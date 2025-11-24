package com.be.integra.simulation.queue;

import com.be.integra.queue.PrioritizedTask;
import lombok.Getter;
import org.springframework.stereotype.Component;

import java.util.concurrent.PriorityBlockingQueue;

@Component
@Getter
public class SimulationQueueHolder {
    private final PriorityBlockingQueue<PrioritizedTask> queue = new PriorityBlockingQueue<>();
}
