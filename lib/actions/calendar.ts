"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { nextId } from "@/lib/id";
import * as store from "@/lib/store";
import type { CalendarItem } from "@/lib/types";

export async function createCalendarItemAction(formData: FormData) {
  const topic = String(formData.get("topic") ?? "").trim();
  if (!topic) return;

  const item: CalendarItem = {
    id: nextId("cal"),
    topic,
    keyMessage: String(formData.get("keyMessage") ?? "").trim(),
    hookCandidates: String(formData.get("hookCandidates") ?? "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    storyboardNotes: String(formData.get("storyboardNotes") ?? "").trim(),
    requiredSources: String(formData.get("requiredSources") ?? "").trim(),
    status: String(formData.get("status") ?? "아이디어") as CalendarItem["status"],
    scheduledDate: String(formData.get("scheduledDate") ?? new Date().toISOString().slice(0, 10)),
    platform: String(formData.get("platform") ?? "틱톡") as CalendarItem["platform"],
    createdAt: new Date().toISOString(),
  };
  await store.addCalendarItem(item);
  revalidatePath("/calendar");
  redirect("/calendar");
}

export async function updateCalendarItemAction(id: string, formData: FormData) {
  const patch: Partial<CalendarItem> = {
    topic: String(formData.get("topic") ?? ""),
    keyMessage: String(formData.get("keyMessage") ?? ""),
    hookCandidates: String(formData.get("hookCandidates") ?? "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    storyboardNotes: String(formData.get("storyboardNotes") ?? ""),
    requiredSources: String(formData.get("requiredSources") ?? ""),
    status: String(formData.get("status") ?? "아이디어") as CalendarItem["status"],
    scheduledDate: String(formData.get("scheduledDate") ?? ""),
    platform: String(formData.get("platform") ?? "틱톡") as CalendarItem["platform"],
  };
  await store.updateCalendarItem(id, patch);
  revalidatePath("/calendar");
}

export async function deleteCalendarItemAction(id: string) {
  await store.deleteCalendarItem(id);
  revalidatePath("/calendar");
}

export async function updateCalendarStatusAction(id: string, status: CalendarItem["status"]) {
  await store.updateCalendarItem(id, { status });
  revalidatePath("/calendar");
}
