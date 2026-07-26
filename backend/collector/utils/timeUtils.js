export function toVNTimestamp(isoString) {
  if (!isoString) return null;
  const utcDate = new Date(isoString);
  const vnDate = new Date(utcDate.getTime() + 7 * 60 * 60 * 1000);
  return vnDate.toISOString().slice(0, 19).replace("T", " ");
}
 