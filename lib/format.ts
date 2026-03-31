export function readingTime(html: string): string {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const words = text.split(" ").filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min čtení`;
}

export function relativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();

  if (diffMs < 0) {
    const days = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60 * 24));
    if (days === 0) return "dnes";
    if (days === 1) return "zítra";
    return `za ${days} dní`;
  }

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "právě teď";
  if (minutes < 60) return `před ${minutes} min`;
  if (hours < 24) return `před ${hours} hod`;
  if (days === 1) return "včera";
  if (days < 7) return `před ${days} dny`;

  const weeks = Math.floor(days / 7);
  if (days < 30) return `před ${weeks} ${weeks === 1 ? "týdnem" : "týdny"}`;

  return then.toLocaleDateString("cs-CZ");
}
