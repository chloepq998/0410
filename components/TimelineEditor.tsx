"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  adjustHighlightAction,
  selectTemplateAction,
  updateCaptionsAction,
  updateMusicWindowAction,
} from "@/lib/actions/projects";
import { BGM_OPTIONS } from "@/lib/ai/bgm-options";
import { Badge, Button } from "@/components/ui";
import type { Draft, HighlightSelection, SourceFile, Template } from "@/lib/types";

function formatTime(sec: number): string {
  const safe = Math.max(0, sec);
  const m = Math.floor(safe / 60);
  const s = Math.floor(safe % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function pct(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, (value / total) * 100));
}

type Selection = { kind: "clip"; index: number } | { kind: "caption"; id: string } | { kind: "music" };

function TrackRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-12 shrink-0 text-xs font-medium text-neutral-500">{label}</span>
      <div className="relative h-9 w-full rounded-md bg-neutral-100">{children}</div>
    </div>
  );
}

// 1번 카드(자동 편집 초안 & 간편 편집)의 폼 기반 편집을 보완해, 클립/자막/음악을
// 하나의 타임라인 위에서 시각적으로 선택하고 동일한 서버 액션으로 편집하는 화면이다.
// 하이라이트 구간(클립)은 원본 소스의 durationSec 기준, 자막/음악 구간은 출력
// targetLength 기준으로 좌표계가 다르므로 트랙별로 별도 스케일을 사용한다.
export default function TimelineEditor({
  projectId,
  sourceFiles,
  targetLength,
  draft,
  highlight,
  templates,
  selectedTemplateId,
}: {
  projectId: string;
  sourceFiles: SourceFile[];
  targetLength: number;
  draft: Draft;
  highlight?: HighlightSelection;
  templates: Template[];
  selectedTemplateId?: string;
}) {
  const router = useRouter();
  const [selection, setSelection] = useState<Selection | null>(null);
  const [saving, setSaving] = useState(false);

  const [highlightRange, setHighlightRange] = useState({ start: highlight?.start ?? 0, end: highlight?.end ?? 0 });
  const [captionText, setCaptionText] = useState("");
  const [musicWindow, setMusicWindow] = useState({
    bgmVolume: draft.bgmVolume,
    bgmStart: draft.bgmStart,
    bgmEnd: draft.bgmEnd,
  });

  const highlightSource = highlight ? sourceFiles[highlight.sourceIndex] : undefined;
  const previewSource =
    (highlightSource?.kind === "video" && highlightSource.url ? highlightSource : undefined) ??
    sourceFiles.find((f) => f.kind === "video" && f.url);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [loopRange, setLoopRange] = useState({ start: 0, end: previewSource?.durationSec ?? targetLength });

  const clipLength = targetLength / sourceFiles.length;
  const bgmOption = BGM_OPTIONS.find((b) => b.id === draft.bgmId);

  function selectClip(index: number) {
    setSelection({ kind: "clip", index });
    if (highlight && index === highlight.sourceIndex) {
      setHighlightRange({ start: highlight.start, end: highlight.end });
    }
  }

  function selectCaption(id: string) {
    setSelection({ kind: "caption", id });
    setCaptionText(draft.captions.find((c) => c.id === id)?.text ?? "");
  }

  function selectMusic() {
    setSelection({ kind: "music" });
    setMusicWindow({ bgmVolume: draft.bgmVolume, bgmStart: draft.bgmStart, bgmEnd: draft.bgmEnd });
  }

  async function applyHighlightRange() {
    if (!highlight) return;
    setSaving(true);
    try {
      await adjustHighlightAction(projectId, highlightRange.start, highlightRange.end);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function saveCaptionText() {
    if (selection?.kind !== "caption") return;
    setSaving(true);
    try {
      const captions = draft.captions.map((c) => (c.id === selection.id ? { ...c, text: captionText } : c));
      await updateCaptionsAction(projectId, captions);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function applyMusicWindow() {
    setSaving(true);
    try {
      await updateMusicWindowAction(projectId, musicWindow);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function switchTemplate(templateId: string) {
    setSaving(true);
    try {
      await selectTemplateAction(projectId, templateId);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (playing) {
      video.pause();
    } else {
      if (video.currentTime < loopRange.start || video.currentTime >= loopRange.end) {
        video.currentTime = loopRange.start;
      }
      video.play();
    }
    setPlaying(!playing);
  }

  function handleTimeUpdate() {
    const video = videoRef.current;
    if (!video) return;
    if (video.currentTime >= loopRange.end) {
      video.currentTime = loopRange.start;
    }
  }

  function applyHighlightAsLoop() {
    if (!highlight) return;
    setLoopRange({ start: highlight.start, end: highlight.end });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-neutral-700">타임라인 (클립 · 자막 · 음악)</p>
        <label className="flex items-center gap-1.5 text-xs text-neutral-500">
          템플릿 변경
          <select
            defaultValue={selectedTemplateId}
            onChange={(e) => switchTemplate(e.target.value)}
            disabled={saving}
            className="rounded-md border border-neutral-300 px-2 py-1 text-xs"
          >
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.lengthSec}초)
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="space-y-2 rounded-lg border border-neutral-200 p-3">
        <TrackRow label="클립">
          {sourceFiles.map((file, i) => {
            const isHighlightClip = highlight?.sourceIndex === i;
            const selected = selection?.kind === "clip" && selection.index === i;
            return (
              <button
                key={i}
                type="button"
                onClick={() => selectClip(i)}
                title={file.name}
                className={`absolute top-0.5 bottom-0.5 overflow-hidden rounded border px-1.5 text-left text-[11px] leading-tight ${
                  selected
                    ? "border-violet-600 bg-violet-200"
                    : isHighlightClip
                      ? "border-violet-400 bg-violet-100"
                      : "border-neutral-300 bg-white"
                }`}
                style={{ left: `${pct(i * clipLength, targetLength)}%`, width: `${pct(clipLength, targetLength)}%` }}
              >
                <span className="block truncate text-neutral-700">{file.name}</span>
              </button>
            );
          })}
        </TrackRow>

        <TrackRow label="자막">
          {draft.captions.map((c) => {
            const selected = selection?.kind === "caption" && selection.id === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => selectCaption(c.id)}
                title={c.text}
                className={`absolute top-0.5 bottom-0.5 overflow-hidden rounded border px-1.5 text-left text-[11px] leading-tight ${
                  selected ? "border-emerald-600 bg-emerald-200" : "border-emerald-300 bg-emerald-50"
                }`}
                style={{ left: `${pct(c.start, targetLength)}%`, width: `${Math.max(2, pct(c.end - c.start, targetLength))}%` }}
              >
                <span className="block truncate text-neutral-700">{c.text}</span>
              </button>
            );
          })}
        </TrackRow>

        <TrackRow label="음악">
          <button
            type="button"
            onClick={selectMusic}
            title={bgmOption?.name ?? draft.bgmId}
            className={`absolute top-0.5 bottom-0.5 overflow-hidden rounded border px-1.5 text-left text-[11px] leading-tight ${
              selection?.kind === "music" ? "border-amber-600 bg-amber-200" : "border-amber-300 bg-amber-50"
            }`}
            style={{
              left: `${pct(draft.bgmStart, targetLength)}%`,
              width: `${Math.max(2, pct(draft.bgmEnd - draft.bgmStart, targetLength))}%`,
            }}
          >
            <span className="block truncate text-neutral-700">{bgmOption?.name ?? draft.bgmId}</span>
          </button>
        </TrackRow>

        <p className="text-right text-[11px] text-neutral-400">목표 길이 {targetLength}초 기준</p>
      </div>

      <div className="rounded-lg border border-dashed border-neutral-300 p-3">
        {selection === null && <p className="text-sm text-neutral-400">위 타임라인에서 클립 · 자막 · 음악 요소를 클릭해 편집하세요.</p>}

        {selection?.kind === "clip" && (
          <div>
            <p className="text-sm font-medium text-neutral-700">클립: {sourceFiles[selection.index]?.name}</p>
            {highlight && selection.index === highlight.sourceIndex ? (
              <>
                <p className="mt-1 text-xs text-neutral-400">
                  원본 영상 기준 하이라이트 구간 (원본 길이 {formatTime(sourceFiles[selection.index]?.durationSec ?? highlight.end)})
                </p>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <label className="block text-xs text-neutral-500">
                    시작 (초)
                    <input
                      type="number"
                      step={0.1}
                      min={0}
                      value={highlightRange.start}
                      onChange={(e) => setHighlightRange((prev) => ({ ...prev, start: Number(e.target.value) }))}
                      className="mt-0.5 w-full rounded-md border border-neutral-300 px-2 py-1 text-sm"
                    />
                  </label>
                  <label className="block text-xs text-neutral-500">
                    끝 (초)
                    <input
                      type="number"
                      step={0.1}
                      min={0}
                      value={highlightRange.end}
                      onChange={(e) => setHighlightRange((prev) => ({ ...prev, end: Number(e.target.value) }))}
                      className="mt-0.5 w-full rounded-md border border-neutral-300 px-2 py-1 text-sm"
                    />
                  </label>
                </div>
                <Button type="button" className="mt-2" disabled={saving} onClick={applyHighlightRange}>
                  하이라이트 구간 적용
                </Button>
              </>
            ) : (
              <p className="mt-1 text-xs text-neutral-400">
                {sourceFiles[selection.index]?.kind === "video" ? "영상" : "사진"} 소스이며, 별도로 적용된 하이라이트 구간은 없습니다.
              </p>
            )}
          </div>
        )}

        {selection?.kind === "caption" && (
          <div>
            <p className="text-sm font-medium text-neutral-700">자막 편집</p>
            <p className="mt-1 text-xs text-neutral-400">
              {formatTime(draft.captions.find((c) => c.id === selection.id)?.start ?? 0)} ~{" "}
              {formatTime(draft.captions.find((c) => c.id === selection.id)?.end ?? 0)}
            </p>
            <input
              value={captionText}
              onChange={(e) => setCaptionText(e.target.value)}
              className="mt-2 w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
            />
            <Button type="button" className="mt-2" disabled={saving} onClick={saveCaptionText}>
              자막 텍스트 저장
            </Button>
          </div>
        )}

        {selection?.kind === "music" && (
          <div>
            <p className="text-sm font-medium text-neutral-700">음악: {bgmOption?.name ?? draft.bgmId}</p>
            <label className="mt-2 block text-xs text-neutral-500">음량 {musicWindow.bgmVolume}</label>
            <input
              type="range"
              min={0}
              max={100}
              value={musicWindow.bgmVolume}
              onChange={(e) => setMusicWindow((prev) => ({ ...prev, bgmVolume: Number(e.target.value) }))}
              className="w-full"
            />
            <div className="mt-2 grid grid-cols-2 gap-3">
              <label className="block text-xs text-neutral-500">
                재생 시작(초)
                <input
                  type="number"
                  min={0}
                  max={targetLength}
                  step={0.5}
                  value={musicWindow.bgmStart}
                  onChange={(e) => setMusicWindow((prev) => ({ ...prev, bgmStart: Number(e.target.value) }))}
                  className="mt-0.5 w-full rounded-md border border-neutral-300 px-2 py-1 text-sm"
                />
              </label>
              <label className="block text-xs text-neutral-500">
                재생 종료(초)
                <input
                  type="number"
                  min={0}
                  max={targetLength}
                  step={0.5}
                  value={musicWindow.bgmEnd}
                  onChange={(e) => setMusicWindow((prev) => ({ ...prev, bgmEnd: Number(e.target.value) }))}
                  className="mt-0.5 w-full rounded-md border border-neutral-300 px-2 py-1 text-sm"
                />
              </label>
            </div>
            <Button type="button" className="mt-2" disabled={saving} onClick={applyMusicWindow}>
              음악 구간/음량 적용
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-neutral-200 p-3">
        <p className="text-sm font-medium text-neutral-700">구간 반복 미리보기</p>
        {!previewSource ? (
          <p className="mt-1 text-sm text-neutral-400">실제 업로드된 영상 소스가 없어 미리보기를 재생할 수 없습니다.</p>
        ) : (
          <>
            <video
              ref={videoRef}
              src={previewSource.url}
              onTimeUpdate={handleTimeUpdate}
              onPause={() => setPlaying(false)}
              className="mt-2 w-full max-w-xs rounded-lg bg-black"
              playsInline
              muted
            />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Button type="button" variant="secondary" onClick={togglePlay}>
                {playing ? "일시정지" : "재생"}
              </Button>
              {highlight && highlightSource === previewSource && (
                <Button type="button" variant="secondary" onClick={applyHighlightAsLoop}>
                  하이라이트 구간으로 반복 설정
                </Button>
              )}
              <Badge>{`반복 구간 ${formatTime(loopRange.start)} ~ ${formatTime(loopRange.end)}`}</Badge>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <label className="block text-xs text-neutral-500">
                반복 시작(초)
                <input
                  type="number"
                  step={0.1}
                  min={0}
                  value={loopRange.start}
                  onChange={(e) => setLoopRange((prev) => ({ ...prev, start: Number(e.target.value) }))}
                  className="mt-0.5 w-full rounded-md border border-neutral-300 px-2 py-1 text-sm"
                />
              </label>
              <label className="block text-xs text-neutral-500">
                반복 끝(초)
                <input
                  type="number"
                  step={0.1}
                  min={0}
                  value={loopRange.end}
                  onChange={(e) => setLoopRange((prev) => ({ ...prev, end: Number(e.target.value) }))}
                  className="mt-0.5 w-full rounded-md border border-neutral-300 px-2 py-1 text-sm"
                />
              </label>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
