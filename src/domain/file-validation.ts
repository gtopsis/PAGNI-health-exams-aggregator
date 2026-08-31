export interface FileLike {
  name: string;
  /** File size in megabytes. */
  sizeMb: number;
}

export interface ValidationResult {
  /** Names of files that passed validation. */
  valid: string[];
  /** Human-readable validation errors for rejected files. */
  errors: string[];
}

function isPdf(name: string): boolean {
  return name.toLowerCase().endsWith(".pdf");
}

/**
 * Validate a batch of candidate files: must be PDFs and within `maxSizeMb`.
 * Pure function — the caller maps accepted names back to real paths.
 */
export function validatePdfFiles(
  files: FileLike[],
  maxSizeMb: number
): ValidationResult {
  const valid: string[] = [];
  const errors: string[] = [];

  for (const file of files) {
    if (!isPdf(file.name)) {
      errors.push(`${file.name}: only PDF files are supported.`);
      continue;
    }
    if (file.sizeMb > maxSizeMb) {
      errors.push(
        `${file.name}: file size should be less than ${maxSizeMb} MB.`
      );
      continue;
    }
    valid.push(file.name);
  }

  return { valid, errors };
}
