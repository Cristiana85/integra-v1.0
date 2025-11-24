package com.be.integra.service.impl;

import com.be.integra.dto.SimulationJobDTO;
import com.be.integra.dto.SimulationStatusDTO;
import com.be.integra.service.SimulationNotifierService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class SimulationNotifierServiceImpl implements SimulationNotifierService {

    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    public SimulationNotifierServiceImpl(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @Override
    public void notifyStatus(SimulationJobDTO jobDto) {
        messagingTemplate.convertAndSend(
                "/topic/job-status/" + jobDto.getAccountId(),
                new SimulationStatusDTO(jobDto)
        );
    }
}