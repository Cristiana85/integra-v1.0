package com.be.integra.service.impl;

import com.be.integra.dto.SimulationJobDTO;
import com.be.integra.entity.SimulationJob;
import com.be.integra.enums.SimulationStatus;
import com.be.integra.repository.SimulationJobRepository;
import com.be.integra.service.SimulationJobService;
import com.be.integra.util.IntegraModelMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class SimulationJobServiceImpl implements SimulationJobService {

    private final IntegraModelMapper modelMapper;
    private final SimulationJobRepository simulationJobRepository;

    @Override
    public void save(SimulationJobDTO simulationJobDTO) {
        simulationJobRepository.saveAndFlush(modelMapper.map(simulationJobDTO, SimulationJob.class));
    }

    @Override
    public SimulationJobDTO findById(String id) {
        return this.modelMapper.map(
                simulationJobRepository.findById(id),
                SimulationJobDTO.class
        );
    }

    @Override
    public void markRunning(SimulationJobDTO job) {
        job.setStatus(SimulationStatus.RUNNING);
        job.setStartedAt(LocalDateTime.now());
        save(job);
    }

    @Override
    public void markFailed(SimulationJobDTO job, String errorMessage) {
        job.setStatus(SimulationStatus.FAILED);
        job.setErrorMessage(errorMessage);
        save(job);
    }

    @Override
    public void markDone(SimulationJobDTO job, String zipPath) {
        job.setStatus(SimulationStatus.DONE);
        job.setOutputZipPath(zipPath);
        job.setCompletedAt(LocalDateTime.now());
        save(job);
    }
}

