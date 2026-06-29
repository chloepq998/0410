import type { CaptionLine, Draft, Template } from "@/lib/types";
import { nextId } from "@/lib/id";

export function generateDraft(template: Template, hookText?: string): Draft {
  const opener: CaptionLine = {
    id: nextId("cap"),
    text: hookText ?? "이거 보고 가세요!",
    position: "상단",
    style: template.mood === "유머" ? "키치" : template.mood === "감성" ? "감성" : "미니멀",
  };
  const body: CaptionLine = {
    id: nextId("cap"),
    text: "핸드메이드로 한 땀 한 땀 완성했어요",
    position: "중단",
    style: opener.style,
  };
  const closer: CaptionLine = {
    id: nextId("cap"),
    text: "마음에 들면 좋아요 & 팔로우!",
    position: "하단",
    style: opener.style,
  };

  const cutCount = template.lengthSec <= 5 ? 3 : template.lengthSec <= 10 ? 5 : 7;
  const cutPlan = Array.from({ length: cutCount }, (_, i) => {
    if (i === 0) return "컷 1: 훅 오프닝 (클로즈업)";
    if (i === cutCount - 1) return `컷 ${i + 1}: 마무리 + CTA 자막`;
    return `컷 ${i + 1}: 제품/제작 과정 디테일 컷`;
  });

  return {
    templateId: template.id,
    bgmId: "bgm-lofi",
    bgmVolume: 70,
    captions: [opener, body, closer],
    transitionIntensity: template.elements.transition ? "중간" : "낮음",
    cutPlan,
    generatedAt: new Date().toISOString(),
  };
}
