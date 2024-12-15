package com.be.integra.service.impl;

import com.be.integra.dto.ProjectDTO;
import com.be.integra.repository.ProjectRepository;
import com.be.integra.service.ProjectService;
import com.be.integra.util.IntegraModelMapper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {
    private final ProjectRepository projectRepository;

    @PersistenceContext
    private EntityManager entityManager;
    private final IntegraModelMapper modelMapper;

    @Override
    @SneakyThrows
    public List<ProjectDTO> getlProject(Long accountId) {
        return this.modelMapper.mapList(
                projectRepository.findByAccountId(accountId),
                ProjectDTO.class
        );
    }

    @Override
    @SneakyThrows
    public ProjectDTO getProjectById(Long accountId, Long projectId) {
        return this.modelMapper.map(
                projectRepository.findByAccountIdAndId(accountId, projectId),
                ProjectDTO.class
        );
    }
}