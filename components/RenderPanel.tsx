"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { startRenderAction, checkRenderStatusAction } from "@/lib/actions/render";
import { Badge, Button } from "@/components/ui";
import type { Render } from "@/lib/types";

export default function RenderPanel({ projectId, render }: { projectId: string; render?: Render }) {
  const router = useRouter();
  const polling = render?.status === "대기중" || render?.status === "렌더링중";

  useEffect(() => {
    if (!polling) return;
    const interval = setInterval(async () => {
      await checkRenderStatusAction(projectId);
      router.refresh();
    }, 5000);
    return () => clearInterval(interval);
  }, [polling, projectId, router]);

  if (!render) {
    return (
      <form action={startRenderAction.bind(null, projectId)}>
        <Button type="submit">영상 렌더링 시작</Button>
      </form>
    );
  }

  return (
    <div className="space-y-3">
      <Badge>{render.status}</Badge>

      {polling && <p className="text-sm text-neutral-500">렌더링 중입니다. 완료되면 자동으로 갱신됩니다...</p>}

      {render.status === "실패" && (
        <div className="space-y-2">
          <p className="text-sm text-rose-600">{render.error ?? "렌더링에 실패했습니다."}</p>
          <form action={startRenderAction.bind(null, projectId)}>
            <Button type="submit" variant="secondary">
              다시 시도
            </Button>
          </form>
        </div>
      )}

      {render.status === "완료" && render.outputUrl && (
        <div className="space-y-2">
          <video src={render.outputUrl} controls className="w-full max-w-xs rounded-lg" />
          <div className="flex gap-2">
            <a
              href={render.outputUrl}
              download
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              다운로드
            </a>
            <form action={startRenderAction.bind(null, projectId)}>
              <Button type="submit" variant="secondary">
                다시 렌더링
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
