"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  adjustHighlightAction,
  regenerateHighlightCandidatesAction,
  selectHighlightCandidateAction,
} from "@/lib/actions/projects";
import { Badge, Button } from "@/components/ui";
import type { HighlightCandidate, HighlightSelection } from "@/lib/types";

function formatTime(sec: number): string {
  const safe = Math.max(0, sec);
  const m = Math.floor(safe / 60);
  const s = Math.floor(safe % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function HighlightPanel({
  projectId,
  durationSec,
  targetLength,
  candidates,
  highlight,
}: {
  projectId: string;
  durationSec: number;
  targetLength: number;
  candidates: HighlightCandidate[];
  highlight: HighlightSelection;
}) {
  const router = useRouter();
  const trackRef = useRef<HTMLDivElement>(null);
  const [range, setRange] = useState({ start: highlight.start, end: highlight.end });
  const [dragging, setDragging] = useState<"start" | "end" | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setRange({ start: highlight.start, end: highlight.end });
  }, [highlight.start, highlight.end]);

  const clamp = (value: number) => Math.min(durationSec, Math.max(0, value));

  function secondsFromClientX(clientX: number): number {
    const track = trackRef.current;
    if (!track) return 0;
    const rect = track.getBoundingClientRect();
    const ratio = rect.width === 0 ? 0 : (clientX - rect.left) / rect.width;
    return clamp(ratio * durationSec);
  }

  const length = Math.max(0, range.end - range.start);
  const lengthDiff = Math.round((length - targetLength) * 10) / 10;
  const withinTolerance = Math.abs(lengthDiff) <= 1;

  function snapToTarget() {
    const clipLength = Math.min(targetLength, durationSec);
    const maxStart = Math.max(0, durationSec - clipLength);
    const start = Math.min(range.start, maxStart);
    setRange({ start, end: clamp(start + clipLength) });
  }

  async function applyRange(start: number, end: number) {
    setSaving(true);
    try {
      await adjustHighlightAction(projectId, start, end);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function selectCandidate(candidateId: string) {
    setSaving(true);
    try {
      await selectHighlightCandidateAction(projectId, candidateId);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function regenerate() {
    setSaving(true);
    try {
      await regenerateHighlightCandidatesAction(projectId);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-neutral-700">AI 추천 하이라이트 후보 ({candidates.length}개)</p>
          <Button type="button" variant="secondary" onClick={regenerate} disabled={saving}>
            후보 다시 생성
          </Button>
        </div>
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {candidates.map((c) => {
            const selected = c.id === highlight.candidateId;
            return (
              <div key={c.id} className={`rounded-lg border p-3 ${selected ? "border-violet-500 bg-violet-50" : "border-neutral-200"}`}>
                <p className="text-sm font-medium text-neutral-900">
                  {formatTime(c.start)} ~ {formatTime(c.end)}
                </p>
                <p className="mt-1 text-xs text-neutral-500">{c.reason}</p>
                <Button
                  type="button"
                  variant={selected ? "secondary" : "primary"}
                  className="mt-2 w-full"
                  disabled={selected || saving}
                  onClick={() => selectCandidate(c.id)}
                >
                  {selected ? "선택됨" : "이 후보 선택"}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-lg border border-neutral-200 p-3">
        <p className="text-sm font-medium text-neutral-700">구간 직접 조절</p>
        <p className="mt-1 text-xs text-neutral-400">원본 영상 길이 {formatTime(durationSec)} · 드래그 핸들을 움직이거나 숫자를 직접 입력하세요.</p>

        <div
          ref={trackRef}
          className="relative mt-4 h-3 w-full touch-none rounded-full bg-neutral-200"
          onPointerMove={(e) => {
            if (!dragging) return;
            const sec = secondsFromClientX(e.clientX);
            setRange((prev) => {
              if (dragging === "start") return { ...prev, start: Math.min(sec, prev.end - 0.5) };
              return { ...prev, end: Math.max(sec, prev.start + 0.5) };
            });
          }}
          onPointerUp={() => setDragging(null)}
        >
          <div
            className="absolute h-3 rounded-full bg-violet-400"
            style={{
              left: `${(range.start / durationSec) * 100}%`,
              width: `${Math.max(0, ((range.end - range.start) / durationSec) * 100)}%`,
            }}
          />
          <div
            role="slider"
            aria-label="시작점"
            aria-valuemin={0}
            aria-valuemax={durationSec}
            aria-valuenow={range.start}
            tabIndex={0}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              setDragging("start");
            }}
            onPointerUp={() => setDragging(null)}
            className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-2 border-violet-600 bg-white shadow"
            style={{ left: `${(range.start / durationSec) * 100}%` }}
          />
          <div
            role="slider"
            aria-label="끝점"
            aria-valuemin={0}
            aria-valuemax={durationSec}
            aria-valuenow={range.end}
            tabIndex={0}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              setDragging("end");
            }}
            onPointerUp={() => setDragging(null)}
            className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-2 border-violet-600 bg-white shadow"
            style={{ left: `${(range.end / durationSec) * 100}%` }}
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-neutral-500">시작 (초)</label>
            <input
              type="number"
              step={0.1}
              min={0}
              max={durationSec}
              value={Math.round(range.start * 10) / 10}
              onChange={(e) => setRange((prev) => ({ ...prev, start: clamp(Math.min(Number(e.target.value), prev.end - 0.5)) }))}
              className="mt-1 w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500">끝 (초)</label>
            <input
              type="number"
              step={0.1}
              min={0}
              max={durationSec}
              value={Math.round(range.end * 10) / 10}
              onChange={(e) => setRange((prev) => ({ ...prev, end: clamp(Math.max(Number(e.target.value), prev.start + 0.5)) }))}
              className="mt-1 w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
            />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge>{`길이 ${formatTime(length)}`}</Badge>
          {withinTolerance ? (
            <span className="text-xs text-emerald-600">목표 길이({targetLength}초)에 맞아요.</span>
          ) : (
            <span className="text-xs text-amber-600">
              목표 길이({targetLength}초)보다 {lengthDiff > 0 ? `${lengthDiff}초 더 길어요.` : `${Math.abs(lengthDiff)}초 더 짧아요.`}
            </span>
          )}
          {!withinTolerance && (
            <Button type="button" variant="secondary" onClick={snapToTarget} disabled={saving}>
              목표 길이에 맞추기
            </Button>
          )}
        </div>

        <Button
          type="button"
          className="mt-3"
          disabled={saving}
          onClick={() => applyRange(range.start, range.end)}
        >
          이 구간 적용
        </Button>
      </div>
    </div>
  );
}
