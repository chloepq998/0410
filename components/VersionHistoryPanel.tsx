"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { restoreVersionAction } from "@/lib/actions/projects";
import { Button } from "@/components/ui";
import type { ProjectVersion } from "@/lib/types";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function VersionHistoryPanel({
  projectId,
  versions,
}: {
  projectId: string;
  versions: ProjectVersion[];
}) {
  const router = useRouter();
  const [restoringId, setRestoringId] = useState<string | null>(null);

  async function restore(version: ProjectVersion) {
    const confirmed = window.confirm(
      `"${version.label}" 시점(${formatDateTime(version.createdAt)})으로 되돌릴까요? 현재 상태는 되돌리기 전 버전으로 저장됩니다.`
    );
    if (!confirmed) return;

    setRestoringId(version.id);
    try {
      await restoreVersionAction(projectId, version.id);
      router.refresh();
    } finally {
      setRestoringId(null);
    }
  }

  if (versions.length === 0) {
    return <p className="text-sm text-neutral-400">아직 저장 이력이 없습니다. 편집을 진행하면 자동으로 저장 이력이 쌓여요.</p>;
  }

  return (
    <ul className="space-y-2">
      {versions.map((version) => (
        <li
          key={version.id}
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-neutral-200 px-3 py-2"
        >
          <div>
            <p className="text-sm font-medium text-neutral-700">{version.label}</p>
            <p className="text-xs text-neutral-400">{formatDateTime(version.createdAt)}</p>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => restore(version)}
            disabled={restoringId === version.id}
          >
            이 시점으로 되돌리기
          </Button>
        </li>
      ))}
    </ul>
  );
}
