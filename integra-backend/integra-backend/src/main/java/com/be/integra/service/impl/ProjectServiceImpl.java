package com.be.integra.service.impl;

import com.be.integra.dto.AccountDTO;
import com.be.integra.dto.ProjectDTO;
import com.be.integra.dto.SimulationJobDTO;
import com.be.integra.dto.SimulationTaskDTO;
import com.be.integra.enums.SimulationStatus;
import com.be.integra.repository.ProjectRepository;
import com.be.integra.service.*;
import com.be.integra.task.SimulationTaskExecutor;
import com.be.integra.util.IntegraModelMapper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final SimulationJobService simulationJobService;
    private final AccountService accountService;
    private final SimulationNotifierService simulationNotifierService;
    private final QueueManagerService queueManagerService;
    private final IntegraModelMapper modelMapper;

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @SneakyThrows
    public List<ProjectDTO> getlProject(Long accountId) {
        return this.modelMapper.mapList(
                projectRepository.findByAccountId(accountId),
                ProjectDTO.class
        );
    }

    @Override
    @SneakyThrows
    public ProjectDTO getProjectById(Long accountId, Long projectId) {
        return this.modelMapper.map(
                projectRepository.findByAccountIdAndId(accountId, projectId),
                ProjectDTO.class
        );
    }

    @Override
    public String runSimulation(Long accountId, Long projectId) {
        // 1. Crea il Job
        SimulationJobDTO simulationJobDTO = createSimulationJob(accountId, projectId);

        // 2. Ottieni il DTO progetto
        ProjectDTO projectDTO = getProjectById(accountId, projectId);

        // 3. Notifica UI
        simulationNotifierService.notifyStatus(simulationJobDTO);

        // 4. Crea e metti in coda il task
        SimulationTaskDTO task = new SimulationTaskDTO(simulationJobDTO, projectDTO);
        queueManagerService.enqueue(task, projectDTO);

        // 5. Restituisci l'id
        return simulationJobDTO.getId();
    }

    @Override
    public SimulationJobDTO createSimulationJob(Long accountId, Long projectId) {
        String jobId = UUID.randomUUID().toString();

        SimulationJobDTO simulationJobDTO = new SimulationJobDTO();
        simulationJobDTO.setId(jobId);
        simulationJobDTO.setAccountId(accountId);
        simulationJobDTO.setProjectId(projectId);
        simulationJobDTO.setStatus(SimulationStatus.QUEUED);
        simulationJobDTO.setCreatedAt(LocalDateTime.now());

        AccountDTO account = this.accountService.getAccountById(accountId);
        simulationJobDTO.setPriority(account.getType());

        this.simulationJobService.save(simulationJobDTO);

        return simulationJobDTO;
    }

    @Override
    public String executeSimulationJob(SimulationJobDTO simulationJobDTO) {
        // Recupera il progetto
        ProjectDTO projectDTO = this.getProjectById(simulationJobDTO.getAccountId(), simulationJobDTO.getProjectId());

        // Crea SimulationTaskDTO
        SimulationTaskDTO task = new SimulationTaskDTO(simulationJobDTO, projectDTO);

        // Crea l'esecutore
        SimulationTaskExecutor executor = new SimulationTaskExecutor(
                task,
                simulationJobService,
                simulationNotifierService,
                projectDTO
        );

        // Esegue direttamente (sincrono, già in thread separato dallo scheduler)
        executor.run();

        // Ritorna il path dello zip se disponibile
        return task.getJob().getOutputZipPath();
    }

}
