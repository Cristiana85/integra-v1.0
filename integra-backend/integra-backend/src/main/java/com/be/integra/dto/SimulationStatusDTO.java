package com.be.integra.dto;

import com.be.integra.enums.SimulationStatus;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;

@Data
@EqualsAndHashCode(callSuper = false, onlyExplicitlyIncluded = true)
public class SimulationStatusDTO implements Serializable {
    private String jobId;
    private SimulationStatus status;
    private String zipPath;
    private String error;

    // costruttore da SimulationJob
    public SimulationStatusDTO(SimulationJobDTO job) {
        this.jobId = job.getId();
        this.status = job.getStatus();
        this.zipPath = job.getOutputZipPath();
        this.error = job.getErrorMessage();
    }
}