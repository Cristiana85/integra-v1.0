package com.be.integra.scheduler;

import com.be.integra.dto.SimulationJobDTO;
import com.be.integra.entity.SimulationJob;
import com.be.integra.enums.SimulationStatus;
import com.be.integra.repository.SimulationJobRepository;
import com.be.integra.service.ProjectService;
import com.be.integra.service.SimulationJobService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
public class SimulationScheduler {

    private final SimulationJobRepository simulationJobRepository;
    private final ProjectService projectService;
    private final SimulationJobService simulationJobService;

    @Scheduled(fixedDelay = 10000)
    public void scheduleSimulations() {
        int availableSlots = computeAvailableSlots();

        if (availableSlots <= 0) return;

        // Prendi i prossimi `availableSlots` job
        List<SimulationJob> jobs = simulationJobRepository
                .findByStatusOrderByPriorityDescCreatedAtAsc(
                        SimulationStatus.QUEUED,
                        PageRequest.of(0, availableSlots)
                );

        for (SimulationJob job : jobs) {
            job.setStatus(SimulationStatus.RUNNING);
            job.setStartedAt(LocalDateTime.now());
            simulationJobRepository.save(job);

            SimulationJobDTO simulationJobDTO = simulationJobService.findById(job.getId());

            CompletableFuture.runAsync(() -> {
                try {
                    String resultZip = projectService.executeSimulationJob(simulationJobDTO);
                    job.setStatus(SimulationStatus.DONE);
                    job.setOutputZipPath(resultZip);
                } catch (Exception e) {
                    job.setStatus(SimulationStatus.FAILED);
                    job.setErrorMessage(e.getMessage());
                }
                job.setCompletedAt(LocalDateTime.now());
                simulationJobRepository.save(job);
            });
        }
    }

    private int computeAvailableSlots() {
        int maxParallel = Runtime.getRuntime().availableProcessors();
        long runningCount = simulationJobRepository.countByStatus(SimulationStatus.RUNNING);
        return (int) Math.max(0, maxParallel - runningCount);
    }
}

