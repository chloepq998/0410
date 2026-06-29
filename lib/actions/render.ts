"use server";

import { revalidatePath } from "next/cache";
import * as store from "@/lib/store";
import { getRenderStatus, renderProject } from "@/lib/video/shotstack";

export async function startRenderAction(projectId: string) {
  const project = await store.getProject(projectId);
  if (!project) return;

  const render = await renderProject(project);
  await store.updateProject(projectId, { render });
  revalidatePath(`/projects/${projectId}`);
}

export async function checkRenderStatusAction(projectId: string) {
  const project = await store.getProject(projectId);
  const render = project?.render;
  if (!render?.id || render.status === "완료" || render.status === "실패") return;

  try {
    const result = await getRenderStatus(render.id);
    await store.updateProject(projectId, {
      render: { id: render.id, status: result.status, outputUrl: result.outputUrl, error: result.error, updatedAt: new Date().toISOString() },
    });
  } catch (error) {
    await store.updateProject(projectId, {
      render: { id: render.id, status: "실패", error: (error as Error).message, updatedAt: new Date().toISOString() },
    });
  }
  revalidatePath(`/projects/${projectId}`);
}
