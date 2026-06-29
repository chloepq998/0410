import type { CaptionLine, Draft, Project, Render, RenderAspectRatio, RenderResolution, RenderStatus } from "@/lib/types";

const SHOTSTACK_HOST =
  process.env.SHOTSTACK_ENV === "production" ? "https://api.shotstack.io/v1" : "https://api.shotstack.io/stage";

interface ShotstackClip {
  asset: Record<string, unknown>;
  start: number;
  length: number;
  transition?: { in?: string; out?: string };
  position?: string;
  fit?: string;
}

interface ShotstackTimeline {
  background?: string;
  tracks: { clips: ShotstackClip[] }[];
}

interface ShotstackEdit {
  timeline: ShotstackTimeline;
  output: { format: string; resolution: string; aspectRatio: string };
}

const TITLE_STYLE: Record<CaptionLine["style"], string> = {
  감성: "vogue",
  미니멀: "minimal",
  키치: "chunk",
};

const TITLE_POSITION: Record<CaptionLine["position"], string> = {
  상단: "top",
  중단: "center",
  하단: "bottom",
};

const TITLE_SIZE: Record<CaptionLine["fontSize"], string> = {
  작게: "small",
  보통: "medium",
  크게: "large",
};

function transitionFor(intensity: Draft["transitionIntensity"]): ShotstackClip["transition"] | undefined {
  if (intensity === "낮음") return undefined;
  if (intensity === "중간") return { in: "fade", out: "fade" };
  return { in: "zoom", out: "fade" };
}

// Shotstack's `output.resolution` enum: preview/mobile/sd/hd/1080. We only
// expose 720p/1080p as export options, mapped to Shotstack's "hd"/"1080".
const RESOLUTION_MAP: Record<RenderResolution, string> = {
  "720p": "hd",
  "1080p": "1080",
};

// Maps our `Draft` (cut plan, captions, BGM, effects) onto a Shotstack timeline.
// Source files carry no explicit timing, so video clips are spread evenly across
// the project's target length; captions instead use the start/end timecodes
// already assigned during generation (see lib/ai/draft.ts). If a highlight
// selection exists for one of the sources, that clip's playback is trimmed to
// the selected window via Shotstack's `asset.trim` + a capped `length`.
// BGM is placed as a dedicated audio clip (not the global `timeline.soundtrack`,
// which has no start/end control) so the user-adjustable bgmStart/bgmEnd window
// is honored. When autoEffectsEnabled is on, visual transitions are applied and
// a short SFX clip (if uploaded) is inserted at each cut boundary.
export function buildTimeline(
  project: Project,
  resolution: RenderResolution = "1080p",
  aspectRatio: RenderAspectRatio = "9:16"
): ShotstackEdit {
  const draft = project.draft;
  if (!draft) throw new Error("초안이 없는 프로젝트는 렌더링할 수 없습니다.");

  const sources = project.sourceFiles.filter((f) => f.url);
  if (sources.length === 0) throw new Error("실제 업로드된 소스 파일이 없어 렌더링할 수 없습니다.");

  const totalLength = project.targetLength;
  const clipLength = totalLength / sources.length;
  const transition = draft.autoEffectsEnabled ? transitionFor(draft.transitionIntensity) : undefined;
  const highlightSource = project.highlight ? project.sourceFiles[project.highlight.sourceIndex] : undefined;

  const videoClips: ShotstackClip[] = sources.map((file, i) => {
    const asset: Record<string, unknown> = {
      type: file.kind === "video" ? "video" : "image",
      src: file.url,
    };

    let length = clipLength;
    if (project.highlight && highlightSource && file === highlightSource) {
      const trimLength = Math.max(0.1, project.highlight.end - project.highlight.start);
      asset.trim = project.highlight.start;
      length = Math.min(clipLength, trimLength);
    }

    return {
      asset,
      start: i * clipLength,
      length,
      fit: "cover",
      ...(transition ? { transition } : {}),
    };
  });

  // 자막은 lib/ai/draft.ts에서 생성된 음성 동기화 타임코드(start/end)를 그대로 사용한다.
  const captionClips: ShotstackClip[] = draft.captions.map((c) => ({
    asset: {
      type: "title",
      text: c.text,
      style: TITLE_STYLE[c.style],
      size: TITLE_SIZE[c.fontSize],
      color: c.color,
      ...(c.backgroundColor ? { background: c.backgroundColor } : {}),
    },
    start: c.start,
    length: Math.max(0.1, c.end - c.start),
    position: TITLE_POSITION[c.position],
  }));

  // BGM은 timeline.soundtrack(전체 구간 고정, start/end 조절 불가) 대신 별도
  // 오디오 클립으로 배치해 사용자가 조절한 bgmStart/bgmEnd 구간만 재생되게 한다.
  const audioClips: ShotstackClip[] = [];
  if (draft.bgmUrl) {
    const bgmStart = Math.max(0, Math.min(draft.bgmStart, totalLength));
    const bgmEnd = Math.max(bgmStart, Math.min(draft.bgmEnd, totalLength));
    audioClips.push({
      asset: {
        type: "audio",
        src: draft.bgmUrl,
        effect: "fadeInFadeOut",
        volume: Math.min(1, Math.max(0, draft.bgmVolume / 100)),
      },
      start: bgmStart,
      length: Math.max(0.1, bgmEnd - bgmStart),
    });
  }

  // 자동 효과가 켜져 있고 효과음 파일이 등록된 경우, 첫 컷을 제외한 각 컷 전환
  // 시점마다 짧은 효과음 클립을 삽입한다.
  if (draft.autoEffectsEnabled && draft.sfxUrl) {
    for (let i = 1; i < videoClips.length; i++) {
      audioClips.push({
        asset: { type: "audio", src: draft.sfxUrl, volume: 0.8 },
        start: Math.max(0, videoClips[i].start - 0.15),
        length: 0.4,
      });
    }
  }

  const timeline: ShotstackTimeline = {
    background: "#000000",
    tracks: [{ clips: captionClips }, { clips: videoClips }, ...(audioClips.length ? [{ clips: audioClips }] : [])],
  };

  return {
    timeline,
    output: {
      format: "mp4",
      resolution: RESOLUTION_MAP[resolution],
      aspectRatio,
    },
  };
}

function requireApiKey(): string {
  const apiKey = process.env.SHOTSTACK_API_KEY;
  if (!apiKey) throw new Error("SHOTSTACK_API_KEY 환경 변수가 설정되지 않았습니다.");
  return apiKey;
}

// Builds the timeline from the project's draft and submits it to Shotstack,
// returning a `Render` patch on success or failure. Shared by the manual
// "다시 렌더링" action and the automated edit-and-render flow.
export async function renderProject(
  project: Project,
  resolution: RenderResolution = "1080p",
  aspectRatio: RenderAspectRatio = "9:16"
): Promise<Render> {
  const now = new Date().toISOString();
  try {
    const edit = buildTimeline(project, resolution, aspectRatio);
    const renderId = await submitRender(edit);
    return { id: renderId, status: "대기중", resolution, aspectRatio, startedAt: now, updatedAt: now };
  } catch (error) {
    return { status: "실패", resolution, aspectRatio, error: (error as Error).message, updatedAt: now };
  }
}

export async function submitRender(edit: ShotstackEdit): Promise<string> {
  const apiKey = requireApiKey();

  const res = await fetch(`${SHOTSTACK_HOST}/render`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey },
    body: JSON.stringify(edit),
  });
  const json = await res.json();

  if (!res.ok || !json?.response?.id) {
    throw new Error(json?.message ?? "Shotstack 렌더링 요청에 실패했습니다.");
  }
  return json.response.id as string;
}

const STATUS_MAP: Record<string, RenderStatus> = {
  queued: "대기중",
  fetching: "대기중",
  rendering: "렌더링중",
  saving: "렌더링중",
  done: "완료",
  failed: "실패",
};

export async function getRenderStatus(
  renderId: string
): Promise<{ status: RenderStatus; stage: string; outputUrl?: string; error?: string }> {
  const apiKey = requireApiKey();

  const res = await fetch(`${SHOTSTACK_HOST}/render/${renderId}`, {
    headers: { "x-api-key": apiKey },
  });
  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.message ?? "Shotstack 렌더링 상태 조회에 실패했습니다.");
  }

  const shotstackStatus = json?.response?.status as string;
  return {
    status: STATUS_MAP[shotstackStatus] ?? "렌더링중",
    stage: shotstackStatus,
    outputUrl: json?.response?.url,
    error: shotstackStatus === "failed" ? (json?.response?.error ?? "알 수 없는 오류") : undefined,
  };
}
