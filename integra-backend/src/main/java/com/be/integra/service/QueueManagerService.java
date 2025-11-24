package com.be.integra.service;

import com.be.integra.dto.ProjectDTO;
import com.be.integra.dto.SimulationTaskDTO;

public interface QueueManagerService {

    void enqueue(SimulationTaskDTO dto, ProjectDTO projectDTO);

}