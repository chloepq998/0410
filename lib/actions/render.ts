"use server";

import { revalidatePath } from "next/cache";
import * as store from "@/lib/store";
import { getRenderStatus, renderProject } from "@/lib/video/shotstack";
import type { RenderAspectRatio, RenderResolution } from "@/lib/types";

export async function startRenderAction(projectId: string, formData: FormData) {
  const project = await store.getProject(projectId);
  if (!project) return;

  const resolution = (String(formData.get("resolution") ?? "1080p")) as RenderResolution;
  const aspectRatio = (String(formData.get("aspectRatio") ?? "9:16")) as RenderAspectRatio;

  const render = await renderProject(project, resolution, aspectRatio);
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
      render: {
        id: render.id,
        status: result.status,
        outputUrl: result.outputUrl,
        error: result.error,
        resolution: render.resolution,
        aspectRatio: render.aspectRatio,
        progressStage: result.stage,
        startedAt: render.startedAt,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    await store.updateProject(projectId, {
      render: {
        id: render.id,
        status: "실패",
        error: (error as Error).message,
        resolution: render.resolution,
        aspectRatio: render.aspectRatio,
        startedAt: render.startedAt,
        updatedAt: new Date().toISOString(),
      },
    });
  }
  revalidatePath(`/projects/${projectId}`);
}
