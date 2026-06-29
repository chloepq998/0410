"use server";

import { revalidatePath } from "next/cache";
import { nextId } from "@/lib/id";
import * as store from "@/lib/store";
import type { Reference } from "@/lib/types";

export async function addReferenceAction(formData: FormData) {
  const type = String(formData.get("type") ?? "url") as Reference["type"];
  const value = String(formData.get("value") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  if (!value) return;

  const reference: Reference = {
    id: nextId("ref"),
    type,
    value,
    note,
    excluded: false,
    createdAt: new Date().toISOString(),
  };
  store.addReference(reference);
  revalidatePath("/personalization");
}

export async function toggleReferenceExcludedAction(id: string, excluded: boolean) {
  store.updateReference(id, { excluded });
  revalidatePath("/personalization");
}

export async function deleteReferenceAction(id: string) {
  store.deleteReference(id);
  revalidatePath("/personalization");
}

export async function updateBrandGuideAction(formData: FormData) {
  const parseList = (key: string) =>
    String(formData.get(key) ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  store.updateBrandGuide({
    toneKeywords: parseList("toneKeywords"),
    bannedExpressions: parseList("bannedExpressions"),
    preferredColors: parseList("preferredColors"),
    brandPhrases: parseList("brandPhrases"),
  });
  revalidatePath("/personalization");
}

export async function resetLearningDataAction(formData: FormData) {
  const confirmText = String(formData.get("confirmText") ?? "");
  if (confirmText !== "초기화") return;
  store.resetLearningData();
  revalidatePath("/personalization");
}
