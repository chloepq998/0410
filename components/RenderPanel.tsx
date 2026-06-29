"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { startRenderAction, checkRenderStatusAction } from "@/lib/actions/render";
import { Badge, Button } from "@/components/ui";
import type { Render } from "@/lib/types";

const ASPECT_RATIO_OPTIONS: { value: string; label: string }[] = [
  { value: "9:16", label: "9:16 (세로, 숏폼 권장)" },
  { value: "16:9", label: "16:9 (가로)" },
  { value: "1:1", label: "1:1 (정방형)" },
];

const RESOLUTION_OPTIONS: { value: string; label: string }[] = [
  { value: "720p", label: "720p (빠른 처리)" },
  { value: "1080p", label: "1080p (고화질)" },
];

const PROGRESS_BY_STAGE: Record<string, number> = {
  queued: 5,
  fetching: 20,
  rendering: 60,
  saving: 85,
  done: 100,
};

function formatElapsed(startedAt?: string): string {
  if (!startedAt) return "0:00";
  const sec = Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function RenderPanel({ projectId, render }: { projectId: string; render?: Render }) {
  const router = useRouter();
  const polling = render?.status === "대기중" || render?.status === "렌더링중";
  const [elapsed, setElapsed] = useState(() => formatElapsed(render?.startedAt));

  useEffect(() => {
    if (!polling) return;
    const interval = setInterval(async () => {
      await checkRenderStatusAction(projectId);
      router.refresh();
    }, 5000);
    return () => clearInterval(interval);
  }, [polling, projectId, router]);

  useEffect(() => {
    if (!polling) return;
    setElapsed(formatElapsed(render?.startedAt));
    const tick = setInterval(() => setElapsed(formatElapsed(render?.startedAt)), 1000);
    return () => clearInterval(tick);
  }, [polling, render?.startedAt]);

  if (polling) {
    const progressPercent = render.progressStage ? PROGRESS_BY_STAGE[render.progressStage] ?? 10 : 10;
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge>{render.status}</Badge>
          <span className="text-xs text-neutral-400">
            해상도 {render.resolution ?? "1080p"} · 비율 {render.aspectRatio ?? "9:16"}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
          <div
            className="h-full rounded-full bg-violet-500 transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-sm text-neutral-500">
          진행률 약 {progressPercent}% · 경과 시간 {elapsed} · 예상 소요 시간 약 1~3분 (해상도/길이에 따라 달라질 수 있어요)
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {render?.status === "실패" && (
        <p className="text-sm text-rose-600">{render.error ?? "렌더링에 실패했습니다."}</p>
      )}

      {render?.status === "완료" && render.outputUrl && (
        <div className="space-y-2">
          <video src={render.outputUrl} controls className="w-full max-w-xs rounded-lg" />
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={render.outputUrl}
              download
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              다운로드
            </a>
            <span className="text-xs text-neutral-400">
              해상도 {render.resolution ?? "1080p"} · 비율 {render.aspectRatio ?? "9:16"}
            </span>
          </div>
          <p className="text-xs text-amber-600">
            ⚠️ 다운로드 링크는 일정 기간 후 만료될 수 있어요. 만료된 경우 아래에서 다시 렌더링해주세요.
          </p>
        </div>
      )}

      <form
        action={startRenderAction.bind(null, projectId)}
        className="space-y-3 rounded-lg border border-neutral-200 p-3"
      >
        <p className="text-sm font-medium text-neutral-700">내보내기 옵션</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-neutral-500">비율</label>
            <select
              name="aspectRatio"
              defaultValue={render?.aspectRatio ?? "9:16"}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            >
              {ASPECT_RATIO_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500">해상도</label>
            <select
              name="resolution"
              defaultValue={render?.resolution ?? "1080p"}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            >
              {RESOLUTION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <Button type="submit" variant={render ? "secondary" : "primary"}>
          {render ? "다시 렌더링" : "영상 렌더링 시작"}
        </Button>
      </form>
    </div>
  );
}
