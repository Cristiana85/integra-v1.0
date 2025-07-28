package com.be.integra.service;

import com.be.integra.dto.SimulationJobDTO;

public interface SimulationJobService {

    void markRunning(SimulationJobDTO job);

    void markFailed(SimulationJobDTO job, String errorMessage);

    void markDone(SimulationJobDTO job, String zipPath);

    void save(SimulationJobDTO jobDTO);

    SimulationJobDTO findById(String jobId);
}
