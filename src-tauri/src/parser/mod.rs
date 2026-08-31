//! Pure parsing logic: raw PDF text → report date + measurements.
//!
//! This module has zero I/O and zero framework dependencies so it can be
//! exhaustively unit-tested. Behavior is ported from the legacy
//! `textSearcher.ts` (Electron era) and specified by `tests` below.

pub mod date;
pub mod pdf;
pub mod results;

pub use date::extract_report_date;
pub use pdf::extract_text;
pub use results::extract_measurements;
