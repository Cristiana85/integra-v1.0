package com.be.integra.controller;

import com.be.integra.dto.HandleDTO;
import com.be.integra.dto.ProjectDTO;
import com.be.integra.dto.SimulationJobDTO;
import com.be.integra.service.ProjectService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(EndPoint.Project.ROOT)
@RequiredArgsConstructor
@Slf4j
public class ProjectController {
    private final ProjectService projectService;

    @GetMapping
    public ResponseEntity<List<ProjectDTO>> getlProject(
            @AuthenticationPrincipal HandleDTO handle) {
        return ResponseEntity.ok(this.projectService.getlProject(handle.getAccountId()));
    }

    @GetMapping(EndPoint.Project.ID)
    public ResponseEntity<ProjectDTO> getProjectById(
            @AuthenticationPrincipal HandleDTO handle,
            @PathVariable("projectId") Long projectId
    ) {
        return ResponseEntity.ok(this.projectService.getProjectById(handle.getAccountId(), projectId));
    }

    @GetMapping(EndPoint.Project.CREATE_SIMULATION)
    public ResponseEntity<String> createSimulation(
            @AuthenticationPrincipal HandleDTO handle,
            @PathVariable("projectId") Long projectId
    ) {
        SimulationJobDTO simulationJobDTO = this.projectService.createSimulationJob(handle.getAccountId(), projectId);
        return ResponseEntity.ok(simulationJobDTO.getId());
    }
}
