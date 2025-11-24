package com.be.integra.service;

import com.be.integra.dto.ProjectDTO;
import com.be.integra.dto.SimulationJobDTO;

import java.util.List;

public interface SimulationNotifierService {
    void notifyStatus(SimulationJobDTO jobDto);
}