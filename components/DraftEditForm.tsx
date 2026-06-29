"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";
import { updateDraftAction } from "@/lib/actions/projects";
import { BGM_OPTIONS } from "@/lib/ai/bgm-options";
import { Button } from "@/components/ui";
import type { Draft } from "@/lib/types";

export default function DraftEditForm({ projectId, draft }: { projectId: string; draft: Draft }) {
  const [bgmUrl, setBgmUrl] = useState(draft.bgmUrl ?? "");
  const [bgmFileName, setBgmFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleBgmUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const blob = await upload(file.name, file, { access: "public", handleUploadUrl: "/api/upload" });
      setBgmUrl(blob.url);
      setBgmFileName(file.name);
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={updateDraftAction.bind(null, projectId)} className="space-y-4">
      <div>
        <p className="text-sm font-medium text-neutral-700">BGM</p>
        <select name="bgmId" defaultValue={draft.bgmId} className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm">
          {BGM_OPTIONS.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name} ({b.mood} · {b.license})
            </option>
          ))}
        </select>
        <label className="mt-2 block text-xs text-neutral-500">음량 {draft.bgmVolume}</label>
        <input type="range" name="bgmVolume" min={0} max={100} defaultValue={draft.bgmVolume} className="w-full" />

        <div className="mt-3 rounded-lg border border-dashed border-neutral-300 p-3">
          <label className="block text-xs font-medium text-neutral-600">실제 렌더링에 쓸 BGM 파일 직접 업로드 (선택)</label>
          <input type="file" accept="audio/*" onChange={handleBgmUpload} className="mt-1 block w-full text-xs text-neutral-600" />
          <p className="mt-1 text-xs text-neutral-400">
            {uploading
              ? "업로드 중..."
              : bgmUrl
                ? `등록됨: ${bgmFileName ?? "업로드된 파일"}`
                : "위 BGM 선택은 참고용 메모입니다. 실제 영상에 음악을 넣으려면 보유한 BGM 파일을 직접 업로드하세요 (저작권 확인 필수)."}
          </p>
          <input type="hidden" name="bgmUrl" value={bgmUrl} />
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-neutral-700">전환 효과 강도</p>
        <div className="mt-1 flex gap-2">
          {(["낮음", "중간", "높음"] as const).map((level) => (
            <label key={level} className="flex items-center gap-1.5 text-sm text-neutral-600">
              <input type="radio" name="transitionIntensity" value={level} defaultChecked={draft.transitionIntensity === level} />
              {level}
            </label>
          ))}
        </div>
      </div>

      <Button type="submit" disabled={uploading}>
        편집 내용 저장
      </Button>
    </form>
  );
}
