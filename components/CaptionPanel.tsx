"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { updateCaptionsAction } from "@/lib/actions/projects";
import { CONFIDENCE_THRESHOLD, PRESET_DEFAULTS } from "@/lib/ai/draft";
import { Button } from "@/components/ui";
import type { CaptionLine, CaptionPreset } from "@/lib/types";

function formatTime(sec: number): string {
  const safe = Math.max(0, sec);
  const m = Math.floor(safe / 60);
  const s = Math.floor(safe % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const PRESETS: CaptionPreset[] = ["기본", "강조", "자막박스"];

export default function CaptionPanel({ projectId, captions }: { projectId: string; captions: CaptionLine[] }) {
  const router = useRouter();
  const [lines, setLines] = useState<CaptionLine[]>(captions);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLines(captions);
  }, [captions]);

  function updateLine(id: string, patch: Partial<CaptionLine>) {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  function applyPreset(id: string, preset: CaptionPreset) {
    updateLine(id, { preset, ...PRESET_DEFAULTS[preset] });
  }

  async function save() {
    setSaving(true);
    try {
      await updateCaptionsAction(projectId, lines);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  const avgConfidence = lines.length === 0 ? 0 : lines.reduce((sum, l) => sum + l.confidence, 0) / lines.length;
  const lowConfidenceCount = lines.filter((l) => l.confidence < CONFIDENCE_THRESHOLD).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-lg bg-neutral-50 px-3 py-2">
        <span className="text-sm font-medium text-neutral-700">평균 인식 정확도 {Math.round(avgConfidence * 100)}%</span>
        {lowConfidenceCount > 0 && (
          <span className="text-xs text-amber-600">정확도 저하 구간 {lowConfidenceCount}개 · 검토를 권장해요.</span>
        )}
      </div>

      <div className="space-y-3">
        {lines.map((line) => {
          const lowConfidence = line.confidence < CONFIDENCE_THRESHOLD;
          return (
            <div
              key={line.id}
              className={`rounded-lg border p-3 ${lowConfidence ? "border-amber-300 bg-amber-50" : "border-neutral-200"}`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-neutral-400">
                  {formatTime(line.start)} ~ {formatTime(line.end)}
                </span>
                <span className={`text-xs ${lowConfidence ? "font-medium text-amber-700" : "text-neutral-400"}`}>
                  인식 정확도 {Math.round(line.confidence * 100)}%
                  {lowConfidence && " · 검토 필요"}
                </span>
              </div>

              <input
                value={line.text}
                onChange={(e) => updateLine(line.id, { text: e.target.value })}
                className="mt-2 w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
              />

              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => applyPreset(line.id, p)}
                    className={`rounded-full px-2.5 py-1 text-xs ${
                      line.preset === p ? "bg-violet-600 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs text-neutral-500">
                  위치
                  <select
                    value={line.position}
                    onChange={(e) => updateLine(line.id, { position: e.target.value as CaptionLine["position"] })}
                    className="rounded-md border border-neutral-300 px-1.5 py-1 text-xs"
                  >
                    <option value="상단">상단</option>
                    <option value="중단">중단</option>
                    <option value="하단">하단</option>
                  </select>
                </label>

                <label className="flex items-center gap-1.5 text-xs text-neutral-500">
                  크기
                  <select
                    value={line.fontSize}
                    onChange={(e) => updateLine(line.id, { fontSize: e.target.value as CaptionLine["fontSize"] })}
                    className="rounded-md border border-neutral-300 px-1.5 py-1 text-xs"
                  >
                    <option value="작게">작게</option>
                    <option value="보통">보통</option>
                    <option value="크게">크게</option>
                  </select>
                </label>

                <label className="flex items-center gap-1.5 text-xs text-neutral-500">
                  글자색
                  <input
                    type="color"
                    value={line.color}
                    onChange={(e) => updateLine(line.id, { color: e.target.value })}
                    className="h-6 w-8 rounded border border-neutral-300"
                  />
                </label>

                <label className="flex items-center gap-1.5 text-xs text-neutral-500">
                  <input
                    type="checkbox"
                    checked={line.backgroundColor !== undefined}
                    onChange={(e) => updateLine(line.id, { backgroundColor: e.target.checked ? "#000000" : undefined })}
                  />
                  배경색
                  {line.backgroundColor !== undefined && (
                    <input
                      type="color"
                      value={line.backgroundColor}
                      onChange={(e) => updateLine(line.id, { backgroundColor: e.target.value })}
                      className="h-6 w-8 rounded border border-neutral-300"
                    />
                  )}
                </label>
              </div>
            </div>
          );
        })}
      </div>

      <Button type="button" onClick={save} disabled={saving}>
        자막 변경사항 저장
      </Button>
    </div>
  );
}
