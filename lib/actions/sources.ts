"use server";

import { revalidatePath } from "next/cache";
import { nextId } from "@/lib/id";
import * as store from "@/lib/store";
import type { SourceMedia } from "@/lib/types";

export async function addSourceAction(input: {
  name: string;
  kind: SourceMedia["kind"];
  url: string;
  sizeBytes: number;
  durationSec?: number;
}): Promise<void> {
  const source: SourceMedia = {
    id: nextId("src"),
    name: input.name,
    kind: input.kind,
    url: input.url,
    sizeBytes: input.sizeBytes,
    durationSec: input.durationSec,
    createdAt: new Date().toISOString(),
  };
  await store.addSource(source);
  revalidatePath("/sources");
}

export async function renameSourceAction(id: string, name: string): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed) return;
  await store.updateSource(id, { name: trimmed });
  revalidatePath("/sources");
}

export async function deleteSourceAction(id: string): Promise<void> {
  await store.deleteSource(id);
  revalidatePath("/sources");
}
