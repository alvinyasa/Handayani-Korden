/**
 * Parse photo_url field which can be:
 * - A single URL string (e.g. "https://example.com/photo.jpg")
 * - A JSON array string (e.g. '["url1","url2"]')
 * - Double-encoded JSON string (e.g. '"[\"url1\",\"url2\"]"')
 * - A comma-separated string (e.g. "url1, url2")
 * - An actual Array
 *
 * Always returns an array of cleaned URL strings.
 */
export function parsePhotoUrls(photoUrl) {
  if (!photoUrl) return [];

  // If already an array
  if (Array.isArray(photoUrl)) {
    return photoUrl.flat().map((item) => String(item).trim()).filter(Boolean);
  }

  let trimmed = String(photoUrl).trim();
  if (!trimmed) return [];

  // Remove outer quotes if double-stringified JSON
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    try {
      const unquoted = JSON.parse(trimmed);
      if (typeof unquoted === 'string') {
        trimmed = unquoted.trim();
      } else if (Array.isArray(unquoted)) {
        return unquoted.filter(Boolean);
      }
    } catch {
      trimmed = trimmed.slice(1, -1).trim();
    }
  }

  // Unescape backslashes if any
  if (trimmed.includes('\\"')) {
    trimmed = trimmed.replace(/\\"/g, '"');
  }

  // Try parsing JSON array
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.filter(Boolean);
      }
    } catch {
      // Fallback to regex extraction
    }
  }

  // Regex fallback: extract all HTTP/HTTPS URLs
  const urlMatches = trimmed.match(/https?:\/\/[^\s"',\]]+/g);
  if (urlMatches && urlMatches.length > 0) {
    return urlMatches;
  }

  // Check if comma-separated
  if (trimmed.includes(',')) {
    const parts = trimmed
      .split(',')
      .map((s) => s.trim().replace(/^["']|["']$/g, ''))
      .filter(Boolean);
    if (parts.length > 0) {
      return parts;
    }
  }

  // Single URL
  const cleanSingle = trimmed.replace(/^["']|["']$/g, '');
  return cleanSingle ? [cleanSingle] : [];
}
