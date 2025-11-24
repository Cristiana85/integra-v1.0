package com.be.integra.config;

import com.be.integra.queue.PrioritizedTask;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.PriorityBlockingQueue;

@Configuration
public class SimulationQueueConfig {

    @Bean
    public BlockingQueue<PrioritizedTask> simulationQueue() {
        return new PriorityBlockingQueue<>();
    }
}
