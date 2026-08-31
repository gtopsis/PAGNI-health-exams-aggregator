//! Thin I/O wrapper around `pdf-extract`: file path → raw text.
//!
//! Kept separate from the pure parser so the parsing rules stay testable
//! without touching the filesystem.

use std::path::Path;

use thiserror::Error;

#[derive(Debug, Error)]
pub enum PdfError {
    #[error("failed to read PDF `{0}`: {1}")]
    Read(String, String),
}

/// Extract the raw text layer of a PDF file.
pub fn extract_text(path: &str) -> Result<String, PdfError> {
    pdf_extract::extract_text(Path::new(path))
        .map_err(|e| PdfError::Read(path.to_string(), e.to_string()))
}
