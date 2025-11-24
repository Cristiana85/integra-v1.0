package com.be.integra.queue;

import com.be.integra.simulation.queue.SimulationQueueHolder;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.concurrent.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class SimulationQueueProcessor {

    private final SimulationQueueHolder queueHolder;

    private final ThreadPoolExecutor executor = new ThreadPoolExecutor(
            1,                                 // corePoolSize
            Runtime.getRuntime().availableProcessors(),  // maxPoolSize dinamico
            60L, TimeUnit.SECONDS,            // tempo di attesa prima di rilasciare un thread
            new LinkedBlockingQueue<>(),      // coda interna dei task
            new CustomRejectedExecutionHandler()
    );

    @PostConstruct
    public void start() {
        new Thread(() -> {
            while (true) {
                try {
                    PrioritizedTask task = queueHolder.getQueue().take();
                    executor.execute(task);  // esegue dinamicamente se c'è posto
                } catch (Exception e) {
                    log.error("Errore nella coda: ", e);
                }
            }
        }).start();
    }
}
