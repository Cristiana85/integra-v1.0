package com.be.integra.queue;

import com.be.integra.enums.AccountType;
import lombok.Getter;

public class PrioritizedTask implements Runnable, Comparable<PrioritizedTask> {
    @Getter
    private final Runnable task;
    private final int priority;
    private final AccountType accountType;

    public PrioritizedTask(Runnable task, int priority, AccountType accountType) {
        this.task = task;
        this.priority = priority;
        this.accountType = accountType;
    }

    public boolean isFreeUser() {
        return accountType == AccountType.FREE;
    }

    @Override
    public void run() {
        task.run();
    }

    @Override
    public int compareTo(PrioritizedTask other) {
        return Integer.compare(this.priority, other.priority);
    }
}
