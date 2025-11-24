package com.be.integra.queue;

import lombok.extern.slf4j.Slf4j;
import java.util.concurrent.RejectedExecutionHandler;
import java.util.concurrent.ThreadPoolExecutor;

@Slf4j
public class CustomRejectedExecutionHandler implements RejectedExecutionHandler {

    @Override
    public void rejectedExecution(Runnable r, ThreadPoolExecutor executor) {
        if (r instanceof PrioritizedTask task) {
            if (task.isFreeUser()) {
                log.warn("Task FREE rifiutato: troppa saturazione");
                // puoi anche notificare al client
            } else {
                // Rimuovi uno free meno prioritario e inserisci questo premium
                boolean rimpiazzato = tryEvictFreeTask(executor, task);
                if (!rimpiazzato) {
                    log.error("Impossibile rimpiazzare nessun task, anche se premium");
                }
            }
        }
    }

    private boolean tryEvictFreeTask(ThreadPoolExecutor executor, PrioritizedTask incoming) {
        for (Runnable queued : executor.getQueue()) {
            if (queued instanceof PrioritizedTask t && t.isFreeUser()) {
                executor.remove(queued);
                executor.execute(incoming);
                return true;
            }
        }
        return false;
    }
}
