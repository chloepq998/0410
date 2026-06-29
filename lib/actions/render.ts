"use server";

import { revalidatePath } from "next/cache";
import * as store from "@/lib/store";
import { buildTimeline, getRenderStatus, submitRender } from "@/lib/video/shotstack";

export async function startRenderAction(projectId: string) {
  const project = await store.getProject(projectId);
  if (!project) return;

  try {
    const edit = buildTimeline(project);
    const renderId = await submitRender(edit);
    await store.updateProject(projectId, {
      render: { id: renderId, status: "대기중", updatedAt: new Date().toISOString() },
    });
  } catch (error) {
    await store.updateProject(projectId, {
      render: { status: "실패", error: (error as Error).message, updatedAt: new Date().toISOString() },
    });
  }
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
