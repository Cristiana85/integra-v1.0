pub mod tline;
pub mod netlist;
pub mod touchstone;

use serde::{Deserialize, Serialize};

use tline::{MicrostripModel, StriplineModel};
use netlist::NetlistModel;
use touchstone::TouchstoneModel;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum ModelPayload {
    TlineMicrostrip(MicrostripModel),
    TlineStripline(StriplineModel),
    Netlist(NetlistModel),
    Touchstone(TouchstoneModel),
}