use std::collections::HashMap;

use crate::error::{codes, ErrorReport};
use crate::utils::ids::BufferHandle;

#[derive(Default)]
pub struct BufferStore {
    next: u32,
    map: HashMap<u32, Vec<u8>>,
}

impl BufferStore {
    pub fn new() -> Self { Self { next: 1, map: HashMap::new() } }

    pub fn alloc_f64(&mut self, v: Vec<f64>) -> BufferHandle {
        let mut bytes = Vec::with_capacity(v.len() * 8);
        for x in v { bytes.extend_from_slice(&x.to_le_bytes()); }
        let h = self.next;
        self.next = self.next.wrapping_add(1).max(1);
        self.map.insert(h, bytes);
        BufferHandle(h)
    }

    pub fn ptr_len(&self, h: BufferHandle) -> Result<(*const u8, usize), ErrorReport> {
        let b = self.map.get(&h.0)
            .ok_or_else(|| ErrorReport::new(codes::OUT_OF_RANGE, "invalid buffer handle"))?;
        Ok((b.as_ptr(), b.len()))
    }

    pub fn free(&mut self, h: BufferHandle) -> bool {
        self.map.remove(&h.0).is_some()
    }
}
