export function withEllipsis(text?: string | null, limit?: number): string {
  if (!text) return "";
  const trimmed = text.trim();
  if (limit) {
    const withoutTrailingSpaces = text.replace(/\s+$/, "");
    return withoutTrailingSpaces.length >= limit
      ? `${trimmed}...`
      : trimmed;
  }
  return `${trimmed}...`;
}