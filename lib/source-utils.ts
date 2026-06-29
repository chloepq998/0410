import type { SourceMedia } from "@/lib/types";

export type LengthBucket = "short" | "medium" | "long";
export type SortOrder = "newest" | "oldest";

export function filterSourcesByLength(sources: SourceMedia[], bucket?: LengthBucket): SourceMedia[] {
  if (!bucket) return sources;
  return sources.filter((source) => {
    if (source.durationSec === undefined) return false;
    if (bucket === "short") return source.durationSec < 300;
    if (bucket === "medium") return source.durationSec >= 300 && source.durationSec < 1800;
    return source.durationSec >= 1800;
  });
}

export function sortSourcesByDate(sources: SourceMedia[], order: SortOrder = "newest"): SourceMedia[] {
  const sorted = [...sources].sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
  return order === "newest" ? sorted.reverse() : sorted;
}

export function formatDuration(durationSec?: number): string {
  if (durationSec === undefined || !Number.isFinite(durationSec)) return "-";
  const minutes = Math.floor(durationSec / 60);
  const seconds = Math.round(durationSec % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)}GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)}MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${bytes}B`;
}
