import { nextId } from "@/lib/id";
import type { Goal, LengthSec, Mood, Template, Tone } from "@/lib/types";

const HOOK_TYPES = ["비포&애프터", "질문형 오프닝", "클로즈업 반전", "POV 시점", "타임랩스"];

const MOOD_BY_GOAL: Record<Goal, Mood[]> = {
  인지도: ["유머", "감성", "정보"],
  판매: ["정보", "감성", "유머"],
  팔로우: ["감성", "유머", "정보"],
};

export function generateTemplates(input: {
  goal: Goal;
  tone: Tone;
  targetLength: LengthSec;
}): Template[] {
  const moods = MOOD_BY_GOAL[input.goal];
  const lengths: LengthSec[] = [15, 30, 60];

  return moods.map((mood, i) => {
    const lengthSec = i === 0 ? input.targetLength : lengths[(lengths.indexOf(input.targetLength) + i) % lengths.length];
    const hookType = HOOK_TYPES[(mood.length + i) % HOOK_TYPES.length];
    return {
      id: nextId("tpl"),
      name: `${mood} 분위기 · ${lengthSec}초 · ${hookType}`,
      lengthSec,
      mood,
      hookType,
      elements: { bgm: true, subtitle: true, transition: i !== 1 },
      previewSummary: `${input.tone} 톤으로 ${lengthSec}초 분량, 첫 1~2초에 훅 노출 후 ${hookType} 구성으로 전환됩니다.`,
    };
  });
}
