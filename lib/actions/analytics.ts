"use server";

import { revalidatePath } from "next/cache";
import * as store from "@/lib/store";

export async function togglePlatformConnectionAction() {
  const current = await store.getPlatformConnection();
  await store.setPlatformConnection(!current.connected);
  revalidatePath("/analytics");
}
