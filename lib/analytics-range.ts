export function resolveRange(
  range: string | null,
  from?: string | null,
  to?: string | null
): { from: Date; to: Date; label: string; range: string } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (range === "custom" && from && to) {
    return { from: new Date(from), to: new Date(to), label: `${from}~${to}`, range: "custom" };
  }

  const days = range === "30" ? 30 : 7;
  const start = new Date(today);
  start.setDate(start.getDate() - (days - 1));
  return { from: start, to: today, label: `최근 ${days}일`, range: String(days) };
}
