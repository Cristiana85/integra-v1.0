use crate::dataset::store::DatasetStore;
use crate::error::ErrorReport;
use crate::dataset::buffers::BufferStore;
use crate::engine::runtime::{Budget, EngineRuntime};

pub struct EngineContext<'a> {
    pub run_id: u32,
    pub runtime: &'a mut EngineRuntime,
    pub dataset: &'a mut DatasetStore,
    pub buffers: &'a mut BufferStore,
}

pub trait AnalysisRunner {
    /// Called repeatedly by Session.tick()
    fn tick(&mut self, ctx: &mut EngineContext, budget: Budget) -> Result<String, ErrorReport>;
}
