package com.be.integra.service;

import com.be.integra.dto.ProjectDTO;
import lombok.SneakyThrows;

import java.util.List;

public interface ProjectService {

    @SneakyThrows
    List<ProjectDTO> getlProject(Long accountId);

    @SneakyThrows
    ProjectDTO getProjectById(Long accountId, Long projectId);
}