"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { nextId } from "@/lib/id";
import * as store from "@/lib/store";
import { generateTemplates } from "@/lib/ai/templates";
import { generateHookIdeas } from "@/lib/ai/hooks";
import { generateMarketingSuggestions } from "@/lib/ai/marketing";
import { generateDraft } from "@/lib/ai/draft";
import { renderProject } from "@/lib/video/shotstack";
import type { CaptionLine, Goal, LengthSec, Project, SourceFile, Template, Tone } from "@/lib/types";

const NO_TEMPLATE_STYLE: Omit<Template, "id" | "lengthSec"> = {
  name: "템플릿 없음 (기본 스타일)",
  mood: "정보",
  hookType: "기본",
  elements: { bgm: true, subtitle: true, transition: false },
  previewSummary: "템플릿을 적용하지 않은 기본 자막/BGM 스타일입니다.",
};

// Runs the full auto-edit pipeline in one step: source 선택 → 템플릿(또는 '없음') →
// 초안 생성 → (실제 소스가 있으면) Shotstack 렌더링 시작 → 프로젝트 저장 후 편집 화면으로 이동.
export async function autoEditAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const goal = String(formData.get("goal") ?? "판매") as Goal;
  const tone = String(formData.get("tone") ?? "발랄") as Tone;
  const targetLength = Number(formData.get("targetLength") ?? 15) as LengthSec;
  const templateMode = String(formData.get("templateMode") ?? "auto") as "auto" | "none";
  const sourceFiles = JSON.parse(String(formData.get("sourceFiles") ?? "[]")) as SourceFile[];

  if (!name || sourceFiles.length === 0) return;

  const recommendedTemplates = generateTemplates({ goal, tone, targetLength });
  const noneTemplate: Template = { id: nextId("tpl"), lengthSec: targetLength, ...NO_TEMPLATE_STYLE };
  const templates = templateMode === "none" ? [...recommendedTemplates, noneTemplate] : recommendedTemplates;
  const selectedTemplate = templateMode === "none" ? noneTemplate : recommendedTemplates[0];

  const now = new Date().toISOString();
  const project: Project = {
    id: nextId("proj"),
    name,
    description,
    goal,
    tone,
    targetLength,
    sourceFiles,
    status: "수정중",
    templates,
    selectedTemplateId: selectedTemplate.id,
    draft: generateDraft(selectedTemplate),
    hookIdeas: [],
    feedback: [],
    createdAt: now,
    updatedAt: now,
  };

  if (sourceFiles.some((f) => f.url)) {
    project.render = await renderProject(project);
  }

  await store.addProject(project);
  revalidatePath("/projects");
  redirect(`/projects/${project.id}`);
}

export async function selectTemplateAction(projectId: string, templateId: string) {
  const project = await store.getProject(projectId);
  if (!project) return;
  const template = project.templates.find((t) => t.id === templateId);
  if (!template) return;

  const hookText = project.hookIdeas.find((h) => h.id === project.selectedHookId)?.text;
  const draft = generateDraft(template, hookText);
  await store.updateProject(projectId, { selectedTemplateId: templateId, draft, status: "수정중" });
  revalidatePath(`/projects/${projectId}`);
}

export async function regenerateTemplatesAction(projectId: string) {
  const project = await store.getProject(projectId);
  if (!project) return;
  const templates = generateTemplates({ goal: project.goal, tone: project.tone, targetLength: project.targetLength });
  await store.updateProject(projectId, { templates, selectedTemplateId: undefined, draft: undefined });
  revalidatePath(`/projects/${projectId}`);
}

export async function updateDraftAction(projectId: string, formData: FormData) {
  const project = await store.getProject(projectId);
  if (!project?.draft) return;

  const bgmId = String(formData.get("bgmId") ?? project.draft.bgmId);
  const bgmVolume = Number(formData.get("bgmVolume") ?? project.draft.bgmVolume);
  const bgmUrlRaw = formData.get("bgmUrl");
  const bgmUrl = bgmUrlRaw !== null ? String(bgmUrlRaw) || undefined : project.draft.bgmUrl;
  const transitionIntensity = String(formData.get("transitionIntensity") ?? project.draft.transitionIntensity) as
    | "낮음"
    | "중간"
    | "높음";

  const captions: CaptionLine[] = project.draft.captions.map((c) => {
    const text = formData.get(`caption_${c.id}_text`);
    const position = formData.get(`caption_${c.id}_position`);
    const style = formData.get(`caption_${c.id}_style`);
    return {
      ...c,
      text: text !== null ? String(text) : c.text,
      position: position !== null ? (String(position) as CaptionLine["position"]) : c.position,
      style: style !== null ? (String(style) as CaptionLine["style"]) : c.style,
    };
  });

  await store.updateProject(projectId, {
    draft: { ...project.draft, bgmId, bgmUrl, bgmVolume, transitionIntensity, captions },
  });
  revalidatePath(`/projects/${projectId}`);
}

export async function generateHookIdeasAction(projectId: string) {
  const project = await store.getProject(projectId);
  if (!project) return;
  const hookIdeas = generateHookIdeas({ goal: project.goal, tone: project.tone, targetLength: project.targetLength });
  await store.updateProject(projectId, { hookIdeas });
  revalidatePath(`/projects/${projectId}`);
}

export async function applyHookAction(projectId: string, hookId: string) {
  const project = await store.getProject(projectId);
  if (!project) return;
  const hook = project.hookIdeas.find((h) => h.id === hookId);
  if (!hook) return;

  let draft = project.draft;
  if (draft) {
    const captions = draft.captions.map((c, i) => (i === 0 ? { ...c, text: hook.text } : c));
    draft = { ...draft, captions };
  }
  await store.updateProject(projectId, { selectedHookId: hookId, draft });
  revalidatePath(`/projects/${projectId}`);
}

export async function generateMarketingAction(projectId: string) {
  const project = await store.getProject(projectId);
  if (!project) return;
  const marketing = generateMarketingSuggestions({ goal: project.goal, productName: project.name });
  await store.updateProject(projectId, { marketing });
  revalidatePath(`/projects/${projectId}`);
}

export async function markProjectCompletedAction(projectId: string) {
  await store.updateProject(projectId, { status: "완료" });
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");
}

export async function submitFeedbackAction(projectId: string, formData: FormData) {
  const project = await store.getProject(projectId);
  if (!project) return;

  const sentiment = String(formData.get("sentiment") ?? "좋아요") as "좋아요" | "별로예요";
  const reason = formData.get("reason") ? String(formData.get("reason")) : undefined;

  let summary = "피드백을 반영해 다음 추천에 참고할게요.";
  let nextHookTone: Tone = project.tone;
  let nextTransition: "낮음" | "중간" | "높음" | undefined;

  if (sentiment === "별로예요" && reason === "너무 과함") {
    nextTransition = "낮음";
    nextHookTone = "진지";
    summary = "전환 효과를 줄이고 더 차분한 톤의 훅으로 재추천했어요.";
  } else if (sentiment === "별로예요" && reason === "너무 밋밋함") {
    nextTransition = "높음";
    nextHookTone = "유머";
    summary = "전환 효과를 강화하고 더 발랄한 훅으로 재추천했어요.";
  } else if (sentiment === "별로예요" && reason === "톤 불일치") {
    nextHookTone = project.tone;
    summary = "브랜드 톤에 맞춰 문구와 훅을 다시 추천했어요.";
  } else if (sentiment === "좋아요") {
    summary = "선호하신 스타일을 우선으로 다음 추천에 반영했어요.";
  }

  const hookIdeas = generateHookIdeas({ goal: project.goal, tone: nextHookTone, targetLength: project.targetLength });
  const draft = project.draft && nextTransition ? { ...project.draft, transitionIntensity: nextTransition } : project.draft;

  const feedback = {
    id: nextId("fb"),
    projectId,
    sentiment,
    reason,
    summary,
    createdAt: new Date().toISOString(),
  };

  await store.updateProject(projectId, {
    feedback: [feedback, ...project.feedback],
    hookIdeas,
    draft,
  });
  revalidatePath(`/projects/${projectId}`);
}
