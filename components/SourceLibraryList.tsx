"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteSourceAction, renameSourceAction } from "@/lib/actions/sources";
import { formatDuration, formatFileSize } from "@/lib/source-utils";
import { Badge, Button, Card } from "@/components/ui";
import type { SourceMedia } from "@/lib/types";

export default function SourceLibraryList({ sources }: { sources: SourceMedia[] }) {
  const router = useRouter();
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  async function handleRename(id: string) {
    await renameSourceAction(id, editName);
    setEditingId(null);
    router.refresh();
  }

  async function handleDelete(id: string) {
    await deleteSourceAction(id);
    setConfirmingId(null);
    router.refresh();
  }

  if (sources.length === 0) {
    return (
      <Card>
        <p className="text-sm text-neutral-400">아직 업로드된 소스가 없습니다.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {sources.map((source) => (
        <Card key={source.id}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Badge>{source.kind === "video" ? "영상" : "사진"}</Badge>
                {editingId === source.id ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      void handleRename(source.id);
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      autoFocus
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="rounded-lg border border-neutral-300 px-2 py-1 text-sm"
                    />
                    <Button type="submit" variant="secondary">
                      저장
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => setEditingId(null)}>
                      취소
                    </Button>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(source.id);
                      setEditName(source.name);
                    }}
                    className="truncate text-sm font-medium text-neutral-900 hover:underline"
                  >
                    {source.name}
                  </button>
                )}
              </div>
              <p className="mt-1 text-xs text-neutral-500">
                {formatFileSize(source.sizeBytes)} · {formatDuration(source.durationSec)} · {source.createdAt.slice(0, 10)}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setPreviewId(previewId === source.id ? null : source.id)}
              >
                {previewId === source.id ? "닫기" : "미리보기"}
              </Button>
              {confirmingId === source.id ? (
                <>
                  <span className="text-xs text-rose-600">삭제하면 복구할 수 없습니다.</span>
                  <Button type="button" variant="danger" onClick={() => void handleDelete(source.id)}>
                    삭제 확정
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => setConfirmingId(null)}>
                    취소
                  </Button>
                </>
              ) : (
                <Button type="button" variant="danger" onClick={() => setConfirmingId(source.id)}>
                  삭제
                </Button>
              )}
            </div>
          </div>

          {previewId === source.id && (
            <div className="mt-3">
              {source.kind === "video" ? (
                <video src={source.url} controls className="w-full max-w-xs rounded-lg" />
              ) : (
                <img src={source.url} alt={source.name} className="w-full max-w-xs rounded-lg" />
              )}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
