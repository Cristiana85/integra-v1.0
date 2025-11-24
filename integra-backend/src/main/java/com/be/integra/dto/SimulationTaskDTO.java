package com.be.integra.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SimulationTaskDTO {

    private SimulationJobDTO job;
    private ProjectDTO project;
}


