pub mod common;
pub mod tline;
pub mod netlist;

use serde::{Deserialize, Serialize};

use tline::{MicrostripModel, StriplineModel};
use netlist::NetlistModel;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum ModelPayload {
    TlineMicrostrip(MicrostripModel),
    TlineStripline(StriplineModel),
    Netlist(NetlistModel),

    // Futuro: cavity, antenna_link, thermal_pcb, chain_graph, ...
}