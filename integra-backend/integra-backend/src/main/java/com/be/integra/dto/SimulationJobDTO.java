package com.be.integra.dto;

import com.be.integra.enums.AccountType;
import com.be.integra.enums.SimulationStatus;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = false, onlyExplicitlyIncluded = true)
public class SimulationJobDTO implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    private String id;
    private Long accountId;
    private Long projectId;
    private AccountType priority;

    @Enumerated(EnumType.STRING)
    private SimulationStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;

    private String outputZipPath;
    private String errorMessage;


}