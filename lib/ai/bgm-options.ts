import type { Mood } from "@/lib/types";

export type BgmTempo = "느림" | "보통" | "빠름";

export interface BgmOption {
  id: string;
  name: string;
  mood: string;
  tempo: BgmTempo;
  templateMoods: Mood[];
  license: "상업용 가능" | "개인용만";
}

export const BGM_OPTIONS: BgmOption[] = [
  { id: "bgm-lofi", name: "Lo-fi Mood", mood: "잔잔한", tempo: "느림", templateMoods: ["정보", "감성"], license: "상업용 가능" },
  { id: "bgm-pop", name: "Upbeat Pop Loop", mood: "신나는", tempo: "빠름", templateMoods: ["유머"], license: "상업용 가능" },
  { id: "bgm-acoustic", name: "Acoustic Warm", mood: "감성", tempo: "보통", templateMoods: ["감성"], license: "개인용만" },
  { id: "bgm-chillhop", name: "Chill Hop Beat", mood: "차분한", tempo: "보통", templateMoods: ["정보", "감성"], license: "상업용 가능" },
  { id: "bgm-edm-hype", name: "EDM Hype", mood: "강렬한", tempo: "빠름", templateMoods: ["유머"], license: "상업용 가능" },
  { id: "bgm-piano-calm", name: "Piano Calm", mood: "잔잔한", tempo: "느림", templateMoods: ["감성", "정보"], license: "상업용 가능" },
];

// 영상 분위기(템플릿 mood)와 BGM의 templateMoods 태그가 일치하는 곡을 우선으로 정렬해
// 추천 순서를 만든다. 실제 음향/템포 분석 없이, 태그 일치 여부로 결정짓는 모킹 로직이다.
export function recommendBgmList(mood: Mood): BgmOption[] {
  return [...BGM_OPTIONS].sort((a, b) => {
    const aScore = a.templateMoods.includes(mood) ? 1 : 0;
    const bScore = b.templateMoods.includes(mood) ? 1 : 0;
    return bScore - aScore;
  });
}

export function recommendBgm(mood: Mood): BgmOption {
  return recommendBgmList(mood)[0];
}

export const SUBTITLE_PRESET_OPTIONS = [
  { id: "sub-serif", name: "감성 세리프", style: "감성" as const },
  { id: "sub-sans", name: "미니멀 산세리프", style: "미니멀" as const },
  { id: "sub-kitsch", name: "키치 팝", style: "키치" as const },
];

export interface SfxOption {
  id: string;
  name: string;
  description: string;
  moods: Mood[];
}

// 화면 전환 시점에 삽입할 효과음 후보. 분위기 태그로 추천 1순위를 결정한다.
export const SFX_OPTIONS: SfxOption[] = [
  { id: "sfx-whoosh", name: "스우시 전환음", description: "장면이 휙 전환될 때 어울리는 효과음", moods: ["정보", "유머"] },
  { id: "sfx-pop", name: "팝 강조음", description: "포인트를 강조할 때 통통 튀는 효과음", moods: ["유머"] },
  { id: "sfx-chime", name: "차임 강조음", description: "부드럽게 환기시키는 종소리 효과음", moods: ["감성", "정보"] },
];

export function recommendSfx(mood: Mood): SfxOption {
  return SFX_OPTIONS.find((s) => s.moods.includes(mood)) ?? SFX_OPTIONS[0];
}
