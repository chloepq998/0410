"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { nextId } from "@/lib/id";
import * as store from "@/lib/store";
import { generateTemplates, TEMPLATE_LIBRARY } from "@/lib/ai/templates";
import { generateHookIdeas } from "@/lib/ai/hooks";
import { generateMarketingSuggestions } from "@/lib/ai/marketing";
import { generateDraft } from "@/lib/ai/draft";
import { generateHighlightCandidates } from "@/lib/ai/highlights";
import { renderProject } from "@/lib/video/shotstack";
import type { CaptionLine, Goal, HighlightSelection, LengthSec, Project, SourceFile, Template, Tone } from "@/lib/types";

const NO_TEMPLATE_STYLE: Omit<Template, "id" | "lengthSec"> = {
  name: "템플릿 없음 (기본 스타일)",
  category: "정보",
  mood: "정보",
  hookType: "기본",
  elements: { bgm: true, subtitle: true, transition: false },
  colorTheme: ["화이트", "그레이"],
  fontStyle: "기본 산세리프",
  bgmId: "bgm-lofi",
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

  // 목표 길이보다 긴 영상 소스가 있으면, 해당 영상을 분석해 하이라이트 후보를 자동 생성한다.
  const highlightSourceIndex = sourceFiles.findIndex(
    (f) => f.kind === "video" && f.durationSec && f.durationSec > targetLength
  );
  let highlightCandidates: Project["highlightCandidates"];
  let highlight: HighlightSelection | undefined;
  if (highlightSourceIndex !== -1) {
    const source = sourceFiles[highlightSourceIndex];
    highlightCandidates = generateHighlightCandidates(source.durationSec!, targetLength);
    const first = highlightCandidates[0];
    highlight = { sourceIndex: highlightSourceIndex, candidateId: first.id, start: first.start, end: first.end };
  }

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
    highlightCandidates,
    highlight,
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

// 추천 템플릿(project.templates)뿐 아니라 전체 템플릿 라이브러리에서도 적용할 수 있도록
// 라이브러리에서 폴백 조회하고, 처음 적용되는 라이브러리 템플릿은 프로젝트에 추가해 기록한다.
// 적용 직전 상태(이전 템플릿/초안)는 templateUndo에 스냅샷으로 남겨 한 단계 되돌리기를 지원한다.
export async function selectTemplateAction(projectId: string, templateId: string) {
  const project = await store.getProject(projectId);
  if (!project) return;

  let template = project.templates.find((t) => t.id === templateId);
  let templates = project.templates;
  if (!template) {
    template = TEMPLATE_LIBRARY.find((t) => t.id === templateId);
    if (!template) return;
    templates = [...project.templates, template];
  }

  const hookText = project.hookIdeas.find((h) => h.id === project.selectedHookId)?.text;
  const draft = generateDraft(template, hookText);
  const templateUndo = { selectedTemplateId: project.selectedTemplateId, draft: project.draft };

  await store.updateProject(projectId, {
    templates,
    selectedTemplateId: templateId,
    draft,
    status: "수정중",
    templateUndo,
  });
  revalidatePath(`/projects/${projectId}`);
}

export async function undoTemplateApplyAction(projectId: string) {
  const project = await store.getProject(projectId);
  if (!project?.templateUndo) return;
  await store.updateProject(projectId, {
    selectedTemplateId: project.templateUndo.selectedTemplateId,
    draft: project.templateUndo.draft,
    templateUndo: undefined,
  });
  revalidatePath(`/projects/${projectId}`);
}

export async function regenerateTemplatesAction(projectId: string) {
  const project = await store.getProject(projectId);
  if (!project) return;
  const templates = generateTemplates({ goal: project.goal, tone: project.tone, targetLength: project.targetLength });
  await store.updateProject(projectId, {
    templates,
    selectedTemplateId: undefined,
    draft: undefined,
    templateUndo: undefined,
  });
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

  const targetLength = project.targetLength;
  const bgmStartRaw = Number(formData.get("bgmStart") ?? project.draft.bgmStart);
  const bgmEndRaw = Number(formData.get("bgmEnd") ?? project.draft.bgmEnd);
  const bgmStart = Math.max(0, Math.min(bgmStartRaw, targetLength));
  const bgmEnd = Math.max(bgmStart, Math.min(bgmEndRaw, targetLength));
  const autoEffectsEnabled = formData.get("autoEffectsEnabled") === "on";
  const sfxIdRaw = String(formData.get("sfxId") ?? project.draft.sfxId ?? "");
  const sfxId = sfxIdRaw || undefined;
  const sfxUrlRaw = formData.get("sfxUrl");
  const sfxUrl = sfxUrlRaw !== null ? String(sfxUrlRaw) || undefined : project.draft.sfxUrl;

  await store.updateProject(projectId, {
    draft: {
      ...project.draft,
      bgmId,
      bgmUrl,
      bgmVolume,
      bgmStart,
      bgmEnd,
      transitionIntensity,
      autoEffectsEnabled,
      sfxId,
      sfxUrl,
    },
  });
  revalidatePath(`/projects/${projectId}`);
}

// CaptionPanel에서 인라인 편집(텍스트/타이밍/스타일)된 자막 전체를 한 번에 저장한다.
export async function updateCaptionsAction(projectId: string, captions: CaptionLine[]) {
  const project = await store.getProject(projectId);
  if (!project?.draft) return;
  await store.updateProject(projectId, { draft: { ...project.draft, captions } });
  revalidatePath(`/projects/${projectId}`);
}

export async function regenerateHighlightCandidatesAction(projectId: string) {
  const project = await store.getProject(projectId);
  if (!project?.highlight) return;
  const source = project.sourceFiles[project.highlight.sourceIndex];
  if (!source?.durationSec) return;

  const highlightCandidates = generateHighlightCandidates(source.durationSec, project.targetLength);
  const first = highlightCandidates[0];
  await store.updateProject(projectId, {
    highlightCandidates,
    highlight: { sourceIndex: project.highlight.sourceIndex, candidateId: first.id, start: first.start, end: first.end },
  });
  revalidatePath(`/projects/${projectId}`);
}

export async function selectHighlightCandidateAction(projectId: string, candidateId: string) {
  const project = await store.getProject(projectId);
  if (!project?.highlight || !project.highlightCandidates) return;
  const candidate = project.highlightCandidates.find((c) => c.id === candidateId);
  if (!candidate) return;

  await store.updateProject(projectId, {
    highlight: {
      sourceIndex: project.highlight.sourceIndex,
      candidateId: candidate.id,
      start: candidate.start,
      end: candidate.end,
    },
  });
  revalidatePath(`/projects/${projectId}`);
}

// 드래그 핸들/숫자 입력으로 직접 조절한 구간은 후보 선택 상태(candidateId)를 해제해
// "커스텀 구간"으로 저장한다.
export async function adjustHighlightAction(projectId: string, start: number, end: number) {
  const project = await store.getProject(projectId);
  if (!project?.highlight) return;
  const source = project.sourceFiles[project.highlight.sourceIndex];
  const duration = source?.durationSec ?? Math.max(start, end);

  const clampedStart = Math.max(0, Math.min(start, duration));
  const clampedEnd = Math.max(clampedStart, Math.min(end, duration));

  await store.updateProject(projectId, {
    highlight: { sourceIndex: project.highlight.sourceIndex, start: clampedStart, end: clampedEnd },
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
