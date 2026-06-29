import type { CaptionFontSize, CaptionLine, CaptionPreset, Draft, Template } from "@/lib/types";
import { nextId } from "@/lib/id";
import { recommendBgm, recommendSfx } from "@/lib/ai/bgm-options";

const BODY_LINE_POOL = [
  "핸드메이드로 한 땀 한 땀 완성했어요",
  "이 디테일 보이시나요?",
  "지금 보시는 컬러가 제일 인기예요",
  "직접 만져보면 더 좋아요",
  "이 과정만 봐도 정성이 느껴져요",
];

// 음성 인식 확신도가 이 값보다 낮으면 "정확도 저하 구간"으로 표시한다.
export const CONFIDENCE_THRESHOLD = 0.85;

export const PRESET_DEFAULTS: Record<CaptionPreset, { fontSize: CaptionFontSize; color: string; backgroundColor?: string }> = {
  기본: { fontSize: "보통", color: "#FFFFFF" },
  강조: { fontSize: "크게", color: "#FFD60A" },
  자막박스: { fontSize: "보통", color: "#FFFFFF", backgroundColor: "#000000" },
};

// 실제 STT API를 호출하지 않고, 텍스트 기반 해시로 인식 확신도를 흉내낸다.
// 질문형 문장(물음표 포함)은 억양 변화가 커 실제 STT에서도 확신도가 떨어지는
// 경향이 있어, 의도적으로 더 낮은 확신도를 부여해 정확도 저하 하이라이트
// 기능을 안정적으로 시연한다.
function mockConfidence(text: string, index: number): number {
  const hash = text.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const variance = (hash + index * 7) % 10;
  let confidence = 0.99 - variance / 100;
  if (text.includes("?")) confidence -= 0.12;
  return Math.max(0.6, Math.round(confidence * 100) / 100);
}

function presetForMood(mood: Template["mood"]): CaptionPreset {
  if (mood === "유머") return "강조";
  if (mood === "정보") return "자막박스";
  return "기본";
}

export function generateDraft(template: Template, hookText?: string): Draft {
  const targetLength = template.lengthSec;
  const cutCount = targetLength <= 15 ? 3 : targetLength <= 30 ? 5 : 7;
  const style = template.mood === "유머" ? "키치" : template.mood === "감성" ? "감성" : "미니멀";
  const preset = presetForMood(template.mood);
  const presetDefaults = PRESET_DEFAULTS[preset];

  const lineTexts = Array.from({ length: cutCount }, (_, i) => {
    if (i === 0) return hookText ?? "이거 보고 가세요!";
    if (i === cutCount - 1) return "마음에 들면 좋아요 & 팔로우!";
    return BODY_LINE_POOL[(i - 1) % BODY_LINE_POOL.length];
  });

  const segment = targetLength / lineTexts.length;
  const captions: CaptionLine[] = lineTexts.map((text, i) => ({
    id: nextId("cap"),
    text,
    start: Math.round(i * segment * 10) / 10,
    end: Math.round(Math.min(targetLength, (i + 1) * segment) * 10) / 10,
    confidence: mockConfidence(text, i),
    position: i === 0 ? "상단" : i === lineTexts.length - 1 ? "하단" : "중단",
    style,
    preset,
    ...presetDefaults,
  }));

  const cutPlan = Array.from({ length: cutCount }, (_, i) => {
    if (i === 0) return "컷 1: 훅 오프닝 (클로즈업)";
    if (i === cutCount - 1) return `컷 ${i + 1}: 마무리 + CTA 자막`;
    return `컷 ${i + 1}: 제품/제작 과정 디테일 컷`;
  });

  // 영상 분위기(template.mood)를 기준으로 BGM·효과음을 추천해 자동 적용한다.
  const bgm = recommendBgm(template.mood);
  const sfx = recommendSfx(template.mood);

  return {
    templateId: template.id,
    bgmId: bgm.id,
    bgmVolume: 70,
    bgmStart: 0,
    bgmEnd: targetLength,
    autoEffectsEnabled: true,
    sfxId: sfx.id,
    captions,
    transitionIntensity: template.elements.transition ? "중간" : "낮음",
    cutPlan,
    generatedAt: new Date().toISOString(),
  };
}
