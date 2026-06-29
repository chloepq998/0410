import { nextId } from "@/lib/id";
import type { HighlightCandidate } from "@/lib/types";

// 영상의 서로 다른 구간(초반/중반/후반)에서 후보를 뽑아, 음성·움직임 분석 결과를 모사한
// 선택 근거를 함께 제시한다(실제 영상/음성 분석 없이 결정적으로 생성되는 목업 로직).
const CANDIDATE_PROFILES: { ratio: number; reason: string }[] = [
  { ratio: 0.08, reason: "오프닝 직후 핵심 장면이 등장해 시청자의 시선을 빠르게 붙잡는 구간이에요." },
  { ratio: 0.42, reason: "움직임과 장면 전환이 많아 시각적으로 몰입도가 높은 구간이에요." },
  { ratio: 0.72, reason: "대사·설명이 집중되어 핵심 메시지가 가장 잘 드러나는 구간이에요." },
];

export function generateHighlightCandidates(durationSec: number, targetLength: number): HighlightCandidate[] {
  const clipLength = Math.max(0.1, Math.min(targetLength, durationSec));
  const maxStart = Math.max(0, durationSec - clipLength);

  return CANDIDATE_PROFILES.map(({ ratio, reason }) => {
    const start = Math.round(Math.min(maxStart, durationSec * ratio) * 10) / 10;
    const end = Math.round(Math.min(durationSec, start + clipLength) * 10) / 10;
    return { id: nextId("hl"), start, end, reason };
  });
}
