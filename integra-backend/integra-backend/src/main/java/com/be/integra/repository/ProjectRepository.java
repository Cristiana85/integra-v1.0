package com.be.integra.repository;

import com.be.integra.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByAccountId(Long accountId);

    Project findByAccountIdAndId(Long accountId, Long projectId);
}