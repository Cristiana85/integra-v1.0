package com.be.integra.task;

import com.be.integra.dto.ProjectDTO;
import com.be.integra.dto.SimulationJobDTO;
import com.be.integra.dto.SimulationTaskDTO;
import com.be.integra.enums.SimulationStatus;
import com.be.integra.service.ProjectService;
import com.be.integra.service.SimulationJobService;
import com.be.integra.service.SimulationNotifierService;
import com.be.integra.util.ZipUtils;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;

public class SimulationTaskExecutor implements Runnable {
    private final SimulationTaskDTO simulationTaskDTO;
    private final SimulationJobService simulationJobService;
    private final SimulationNotifierService simulationNotifierService;
    private final ProjectDTO projectDTO;

    public SimulationTaskExecutor(
            SimulationTaskDTO simulationTaskDTO,
            SimulationJobService simulationJobService,
            SimulationNotifierService simulationNotifierService,
            ProjectDTO projectDTO
    ) {
        this.simulationTaskDTO = simulationTaskDTO;
        this.simulationJobService = simulationJobService;
        this.simulationNotifierService = simulationNotifierService;
        this.projectDTO = projectDTO;
    }

    @Override
    public void run() {
        // usa `project` direttamente
        SimulationJobDTO job = simulationTaskDTO.getJob();
        ProjectDTO project = simulationTaskDTO.getProject();

        try {
            // Stato: RUNNING
            job.setStatus(SimulationStatus.RUNNING);
            job.setStartedAt(LocalDateTime.now());
            simulationJobService.save(job);
            simulationNotifierService.notifyStatus(job);

            // Scrivi input per .exe
            Path inputPath = Files.write(
                    Paths.get("input_" + job.getId() + ".json"),
                    new ObjectMapper().writeValueAsBytes(project)
            );

            // Esegui exe
            ProcessBuilder pb = new ProcessBuilder("simulatore.exe", inputPath.toString());
            Process process = pb.start();
            int exitCode = process.waitFor();

            if (exitCode != 0) {
                job.setStatus(SimulationStatus.FAILED);
                job.setErrorMessage("Errore in simulazione, codice: " + exitCode);
            } else {
                // ZIP dei risultati
                File outputFolder = new File("output/" + job.getId());
                File zipFile = new File("output/" + job.getId() + ".zip");
                ZipUtils.zipFolder(outputFolder, zipFile);

                job.setStatus(SimulationStatus.DONE);
                job.setOutputZipPath(zipFile.getAbsolutePath());
                job.setCompletedAt(LocalDateTime.now());
            }

        } catch (Exception e) {
            job.setStatus(SimulationStatus.FAILED);
            job.setErrorMessage("Eccezione: " + e.getMessage());
        }

        // Salvataggio finale + notifica
        simulationJobService.save(job);
        simulationNotifierService.notifyStatus(job);
    }
}

