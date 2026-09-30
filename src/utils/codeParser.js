/**
 * Parses user input for codes/numbers.
 * Supports:
 * - Single: "9" or "A"
 * - Comma/space separated: "1, 2, 3" or "1 2 3"
 * - Range: "1-10", "1 s/d 10", "1 sampai 10", "01-05"
 * - Letter range: "A-D", "A, B, C"
 * - Mixed: "1-5, 8, 10-12"
 */
export function parseCodeRange(input) {
  if (!input || typeof input !== 'string') return [];
  
  // Normalize words like "s/d", "sd", "sampai", "to" into hyphens
  let cleaned = input.replace(/\s*(?:s\/d|sd|sampai|to)\s*/gi, '-');
  // Normalize spaces around hyphens like "1 - 10" -> "1-10"
  cleaned = cleaned.replace(/\s*-\s*/g, '-');
  
  const tokens = cleaned.split(/[,;\s]+/).map((t) => t.trim()).filter(Boolean);
  const result = [];

  for (const token of tokens) {
    // Number range: "1-10" or "01-05"
    const numMatch = token.match(/^(\d+)-(\d+)$/);
    if (numMatch) {
      const start = parseInt(numMatch[1], 10);
      const end = parseInt(numMatch[2], 10);
      const pad = numMatch[1].length > 1 && numMatch[1].startsWith('0') ? numMatch[1].length : 0;
      const step = start <= end ? 1 : -1;
      const count = Math.min(Math.abs(end - start) + 1, 100);

      for (let i = 0; i < count; i++) {
        const val = start + i * step;
        const formatted = pad ? String(val).padStart(pad, '0') : String(val);
        if (!result.includes(formatted)) result.push(formatted);
      }
      continue;
    }

    // Letter range: "A-D"
    const letterMatch = token.match(/^([A-Za-z])-([A-Za-z])$/);
    if (letterMatch) {
      const start = letterMatch[1].toUpperCase().charCodeAt(0);
      const end = letterMatch[2].toUpperCase().charCodeAt(0);
      const step = start <= end ? 1 : -1;
      const count = Math.min(Math.abs(end - start) + 1, 26);

      for (let i = 0; i < count; i++) {
        const char = String.fromCharCode(start + i * step);
        if (!result.includes(char)) result.push(char);
      }
      continue;
    }

    // Single item
    if (!result.includes(token)) {
      result.push(token);
    }
  }

  return result;
}
