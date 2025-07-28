package com.be.integra.repository;

import com.be.integra.entity.SimulationJob;
import com.be.integra.enums.SimulationStatus;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SimulationJobRepository extends JpaRepository<SimulationJob, String> {

    Optional<SimulationJob> findFirstByStatusOrderByPriorityDescCreatedAtAsc(SimulationStatus simulationStatus);

    boolean existsByStatus(SimulationStatus simulationStatus);

    int countByStatus(SimulationStatus status);

    @Query("""
    SELECT j FROM SimulationJob j 
    WHERE j.status = :status 
    ORDER BY 
      CASE j.priority 
        WHEN 'PREMIUM' THEN 1 
        WHEN 'FREE' THEN 2 
        ELSE 3 
      END,
      j.createdAt ASC
    """)
    List<SimulationJob> findTopNByStatusOrderByPriorityDescCreatedAtAsc(
            @Param("status") SimulationStatus status,
            Pageable pageable
    );

    List<SimulationJob> findByStatusOrderByPriorityDescCreatedAtAsc(SimulationStatus simulationStatus, PageRequest of);
}

