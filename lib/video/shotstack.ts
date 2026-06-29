import type { CaptionLine, Draft, Project, RenderStatus } from "@/lib/types";

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
  soundtrack?: { src: string; effect?: string; volume?: number };
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

function transitionFor(intensity: Draft["transitionIntensity"]): ShotstackClip["transition"] | undefined {
  if (intensity === "낮음") return undefined;
  if (intensity === "중간") return { in: "fade", out: "fade" };
  return { in: "zoom", out: "fade" };
}

// Maps our `Draft` (cut plan, captions, BGM) onto a Shotstack timeline. Source
// files and captions carry no explicit timing, so clips/captions are spread
// evenly across the project's target length.
export function buildTimeline(project: Project): ShotstackEdit {
  const draft = project.draft;
  if (!draft) throw new Error("초안이 없는 프로젝트는 렌더링할 수 없습니다.");

  const sources = project.sourceFiles.filter((f) => f.url);
  if (sources.length === 0) throw new Error("실제 업로드된 소스 파일이 없어 렌더링할 수 없습니다.");

  const totalLength = project.targetLength;
  const clipLength = totalLength / sources.length;
  const transition = transitionFor(draft.transitionIntensity);

  const videoClips: ShotstackClip[] = sources.map((file, i) => ({
    asset: {
      type: file.kind === "video" ? "video" : "image",
      src: file.url,
    },
    start: i * clipLength,
    length: clipLength,
    fit: "cover",
    ...(transition ? { transition } : {}),
  }));

  const captionSegment = totalLength / draft.captions.length;
  const captionClips: ShotstackClip[] = draft.captions.map((c, i) => ({
    asset: {
      type: "title",
      text: c.text,
      style: TITLE_STYLE[c.style],
    },
    start: i * captionSegment,
    length: captionSegment,
    position: TITLE_POSITION[c.position],
  }));

  const timeline: ShotstackTimeline = {
    background: "#000000",
    tracks: [{ clips: captionClips }, { clips: videoClips }],
  };

  if (draft.bgmUrl) {
    timeline.soundtrack = {
      src: draft.bgmUrl,
      effect: "fadeInFadeOut",
      volume: Math.min(1, Math.max(0, draft.bgmVolume / 100)),
    };
  }

  return {
    timeline,
    output: {
      format: "mp4",
      resolution: "sd",
      aspectRatio: "9:16",
    },
  };
}

function requireApiKey(): string {
  const apiKey = process.env.SHOTSTACK_API_KEY;
  if (!apiKey) throw new Error("SHOTSTACK_API_KEY 환경 변수가 설정되지 않았습니다.");
  return apiKey;
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
): Promise<{ status: RenderStatus; outputUrl?: string; error?: string }> {
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
    outputUrl: json?.response?.url,
    error: shotstackStatus === "failed" ? (json?.response?.error ?? "알 수 없는 오류") : undefined,
  };
}
