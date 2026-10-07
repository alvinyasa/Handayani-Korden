/**
 * Parse photo_url field which can be:
 * - A single URL string (e.g. "https://example.com/photo.jpg")
 * - A JSON array string (e.g. '["url1","url2"]')
 * - A comma-separated string (e.g. "url1, url2")
 *
 * Always returns an array of URL strings.
 */
export function parsePhotoUrls(photoUrl) {
  if (!photoUrl) return [];

  // If already an array (shouldn't happen from DB, but just in case)
  if (Array.isArray(photoUrl)) return photoUrl.filter(Boolean);

  const trimmed = String(photoUrl).trim();
  if (!trimmed) return [];

  // Try parsing as JSON array
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.filter(Boolean);
      }
    } catch {
      // Not valid JSON, fall through
    }
  }

  // Check if it's a comma-separated list of URLs (each must start with http)
  if (trimmed.includes(',')) {
    const parts = trimmed.split(',').map((s) => s.trim()).filter(Boolean);
    // Only treat as comma-separated if all parts look like URLs
    if (parts.length > 1 && parts.every((p) => p.startsWith('http'))) {
      return parts;
    }
  }

  // Single URL
  return [trimmed];
}
