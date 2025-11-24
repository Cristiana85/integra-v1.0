package com.be.integra.service;

import com.be.integra.dto.ProjectDTO;
import com.be.integra.dto.SimulationJobDTO;

import java.util.List;

public interface ProjectService {

    List<ProjectDTO> getlProject(Long accountId);

    ProjectDTO getProjectById(Long accountId, Long projectId);

    String runSimulation(Long accountId, Long projectId);

    SimulationJobDTO createSimulationJob(Long accountId, Long projectId);

    String executeSimulationJob(SimulationJobDTO simulationJobDTO);
}