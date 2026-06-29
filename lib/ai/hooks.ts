import { nextId } from "@/lib/id";
import type { Goal, HookIdea, LengthSec, Tone } from "@/lib/types";

const OPENERS_BY_GOAL: Record<Goal, string[]> = {
  인지도: ["이걸 모르고 사셨다고요?", "다들 이거 모르고 지나가더라고요", "한 번 보면 안 살 수 없는"],
  판매: ["이 가격에 이게 가능해요?", "재고 얼마 안 남았어요", "이거 완성되는 과정 보세요"],
  팔로우: ["이런 거 좋아하면 팔로우 필수", "다음 편 기대해도 좋아요", "저장 안 하면 후회함"],
};

const SCENE_HINTS = ["클로즈업으로 디테일 강조", "손 움직임 위주 컷", "완성 전/후 비교 컷", "제품 360도 회전 컷"];

function withTone(text: string, tone: Tone): string {
  if (tone === "유머") return `${text} (ㅋㅋ 진심)`;
  if (tone === "진지") return `${text}.`;
  return `${text}!`;
}

export function generateHookIdeas(input: { goal: Goal; tone: Tone; targetLength: LengthSec }): HookIdea[] {
  const openers = OPENERS_BY_GOAL[input.goal];
  return openers.map((opener, i) => ({
    id: nextId("hook"),
    text: withTone(opener, input.tone),
    sceneHint: SCENE_HINTS[i % SCENE_HINTS.length],
    tone: input.tone,
    lengthSec: input.targetLength,
  }));
}
