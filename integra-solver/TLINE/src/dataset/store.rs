use std::collections::{HashMap, VecDeque};
use crate::dataset::types::{Event, EventBatch, MetricsPayload};
use crate::error::{codes, ErrorReport};

#[derive(Default)]
pub struct EventQueue {
    q: VecDeque<Event>,
}

impl EventQueue {
    pub fn push(&mut self, e: Event) { self.q.push_back(e); }
    pub fn len(&self) -> usize { self.q.len() }

    pub fn drain_batch(&mut self, run_id: u32) -> EventBatch {
        let mut events = Vec::with_capacity(self.q.len().min(128));
        while let Some(e) = self.q.pop_front() { events.push(e); }
        EventBatch { run_id, events }
    }
}

pub struct DatasetStore {
    pub events: EventQueue,
    next_metrics: u32,
    metrics: HashMap<u32, MetricsPayload>,
    run_id: u32,
}

impl DatasetStore {
    pub fn new() -> Self {
        Self { events: EventQueue::default(), next_metrics: 1, metrics: HashMap::new(), run_id: 0 }
    }

    pub fn reset_for_run(&mut self, run_id: u32) {
        self.events = EventQueue::default();
        self.metrics.clear();
        self.next_metrics = 1;
        self.run_id = run_id;
    }

    pub fn insert_metrics(&mut self, mut payload: MetricsPayload) -> u32 {
        let h = self.next_metrics;
        self.next_metrics = self.next_metrics.wrapping_add(1).max(1);
        payload.handle = h;
        self.metrics.insert(h, payload);
        h
    }

    pub fn take_metrics(&mut self, handle: u32) -> Result<MetricsPayload, ErrorReport> {
        self.metrics.remove(&handle)
            .ok_or_else(|| ErrorReport::new(codes::OUT_OF_RANGE, "invalid metrics handle"))
    }
}
