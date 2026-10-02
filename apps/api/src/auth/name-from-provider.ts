/** Split a single display string from OAuth into stored first / last name. */
export function namePartsFromProviderDisplay(displayName: string) {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  const firstName = parts[0] ?? '';
  const lastName = parts.slice(1).join(' ');
  return { firstName, lastName };
}
