package com.be.integra.service;

import java.util.List;

import com.be.integra.dto.ProjectDTO;

public interface ProjectService {

    List<ProjectDTO> getlProject(Long accountId);

    ProjectDTO getProjectById(Long accountId, Long projectId);
}