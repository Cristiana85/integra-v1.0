package com.be.integra.service.impl;

import com.be.integra.dto.AccountDTO;
import com.be.integra.dto.ProjectDTO;
import com.be.integra.dto.SimulationJobDTO;
import com.be.integra.dto.SimulationTaskDTO;
import com.be.integra.queue.PrioritizedTask;
import com.be.integra.service.AccountService;
import com.be.integra.service.QueueManagerService;
import com.be.integra.service.SimulationJobService;
import com.be.integra.service.SimulationNotifierService;
import com.be.integra.task.SimulationTaskExecutor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.concurrent.BlockingQueue;

@RequiredArgsConstructor
@Service
public class QueueManagerServiceImpl implements QueueManagerService {

    private final BlockingQueue<PrioritizedTask> queue;
    private final SimulationJobService simulationJobService;
    private final AccountService accountService;
    private final SimulationNotifierService notifier;

    @Override
    public void enqueue(SimulationTaskDTO dto, ProjectDTO projectDTO) {
        SimulationTaskExecutor task = new SimulationTaskExecutor(dto, simulationJobService, notifier, projectDTO);

        AccountDTO account = this.accountService.getAccountById(projectDTO.getAccountId());

        int priority = switch (account.getType()) {
            case PREMIUM -> 0;
            case FREE -> 10;
            default -> 5;
        };

        queue.add(new PrioritizedTask(task, priority, account.getType()));
    }
}

