"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";
import { updateDraftAction } from "@/lib/actions/projects";
import { SFX_OPTIONS, recommendBgmList } from "@/lib/ai/bgm-options";
import { LICENSE_WARNING_TEXT } from "@/lib/ai/license";
import { Button } from "@/components/ui";
import type { Draft, Mood } from "@/lib/types";

export default function DraftEditForm({
  projectId,
  draft,
  mood,
  targetLength,
}: {
  projectId: string;
  draft: Draft;
  mood: Mood;
  targetLength: number;
}) {
  const [bgmUrl, setBgmUrl] = useState(draft.bgmUrl ?? "");
  const [bgmFileName, setBgmFileName] = useState<string | null>(null);
  const [bgmUploading, setBgmUploading] = useState(false);

  const [sfxUrl, setSfxUrl] = useState(draft.sfxUrl ?? "");
  const [sfxFileName, setSfxFileName] = useState<string | null>(null);
  const [sfxUploading, setSfxUploading] = useState(false);

  const sortedBgmOptions = recommendBgmList(mood);
  const recommendedBgmId = sortedBgmOptions[0]?.id;

  const [bgmId, setBgmId] = useState(draft.bgmId);
  const [sfxId, setSfxId] = useState(draft.sfxId ?? "");

  const selectedBgm = sortedBgmOptions.find((b) => b.id === bgmId);
  const selectedSfx = SFX_OPTIONS.find((s) => s.id === sfxId);

  async function handleBgmUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBgmUploading(true);
    try {
      const blob = await upload(file.name, file, { access: "public", handleUploadUrl: "/api/upload" });
      setBgmUrl(blob.url);
      setBgmFileName(file.name);
    } finally {
      setBgmUploading(false);
    }
  }

  async function handleSfxUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSfxUploading(true);
    try {
      const blob = await upload(file.name, file, { access: "public", handleUploadUrl: "/api/upload" });
      setSfxUrl(blob.url);
      setSfxFileName(file.name);
    } finally {
      setSfxUploading(false);
    }
  }

  return (
    <form action={updateDraftAction.bind(null, projectId)} className="space-y-4">
      <div>
        <p className="text-sm font-medium text-neutral-700">배경 음악 (영상 분위기 기반 추천)</p>
        <select
          name="bgmId"
          value={bgmId}
          onChange={(e) => setBgmId(e.target.value)}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        >
          {sortedBgmOptions.map((b) => (
            <option key={b.id} value={b.id}>
              {b.id === recommendedBgmId ? "⭐ 추천 · " : ""}
              {b.name} ({b.mood} · {b.tempo} · {b.license})
            </option>
          ))}
        </select>
        {selectedBgm && (
          <p className="mt-1 text-xs text-neutral-400">
            출처: {selectedBgm.source} · {selectedBgm.licenseDetail}
          </p>
        )}
        {selectedBgm?.license === "개인용만" && (
          <div className="mt-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs text-rose-700">
            {LICENSE_WARNING_TEXT}
          </div>
        )}

        <div className="mt-2 grid grid-cols-2 gap-2">
          <label className="block text-xs text-neutral-500">
            재생 시작(초)
            <input
              type="number"
              name="bgmStart"
              min={0}
              max={targetLength}
              step={0.5}
              defaultValue={draft.bgmStart}
              className="mt-0.5 w-full rounded-md border border-neutral-300 px-2 py-1 text-sm"
            />
          </label>
          <label className="block text-xs text-neutral-500">
            재생 종료(초)
            <input
              type="number"
              name="bgmEnd"
              min={0}
              max={targetLength}
              step={0.5}
              defaultValue={draft.bgmEnd}
              className="mt-0.5 w-full rounded-md border border-neutral-300 px-2 py-1 text-sm"
            />
          </label>
        </div>

        <label className="mt-2 block text-xs text-neutral-500">음량 {draft.bgmVolume}</label>
        <input type="range" name="bgmVolume" min={0} max={100} defaultValue={draft.bgmVolume} className="w-full" />

        <div className="mt-3 rounded-lg border border-dashed border-neutral-300 p-3">
          <label className="block text-xs font-medium text-neutral-600">실제 렌더링에 쓸 BGM 파일 직접 업로드 (선택)</label>
          <input type="file" accept="audio/*" onChange={handleBgmUpload} className="mt-1 block w-full text-xs text-neutral-600" />
          <p className="mt-1 text-xs text-neutral-400">
            {bgmUploading
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
        <label className="mt-2 flex items-center gap-1.5 text-xs text-neutral-600">
          <input type="checkbox" name="autoEffectsEnabled" defaultChecked={draft.autoEffectsEnabled} />
          전환 효과 · 효과음 자동 삽입 켜기
        </label>
      </div>

      <div>
        <p className="text-sm font-medium text-neutral-700">강조 구간 효과음 (영상 분위기 기반 추천)</p>
        <select
          name="sfxId"
          value={sfxId}
          onChange={(e) => setSfxId(e.target.value)}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        >
          <option value="">사용 안 함</option>
          {SFX_OPTIONS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} — {s.description} ({s.license})
            </option>
          ))}
        </select>
        {selectedSfx && (
          <p className="mt-1 text-xs text-neutral-400">
            출처: {selectedSfx.source} · {selectedSfx.licenseDetail}
          </p>
        )}
        {selectedSfx?.license === "개인용만" && (
          <div className="mt-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs text-rose-700">
            {LICENSE_WARNING_TEXT}
          </div>
        )}

        <div className="mt-3 rounded-lg border border-dashed border-neutral-300 p-3">
          <label className="block text-xs font-medium text-neutral-600">실제 렌더링에 쓸 효과음 파일 직접 업로드 (선택)</label>
          <input type="file" accept="audio/*" onChange={handleSfxUpload} className="mt-1 block w-full text-xs text-neutral-600" />
          <p className="mt-1 text-xs text-neutral-400">
            {sfxUploading
              ? "업로드 중..."
              : sfxUrl
                ? `등록됨: ${sfxFileName ?? "업로드된 파일"}`
                : "효과음 선택은 참고용 메모입니다. 전환 구간에 실제 효과음을 넣으려면 보유한 효과음 파일을 직접 업로드하세요."}
          </p>
          <input type="hidden" name="sfxUrl" value={sfxUrl} />
        </div>
      </div>

      <Button type="submit" disabled={bgmUploading || sfxUploading}>
        편집 내용 저장
      </Button>
    </form>
  );
}
