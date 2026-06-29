import type { Mood } from "@/lib/types";

export type BgmTempo = "느림" | "보통" | "빠름";

export interface BgmOption {
  id: string;
  name: string;
  mood: string;
  tempo: BgmTempo;
  templateMoods: Mood[];
  license: "상업용 가능" | "개인용만";
  source: string;
  licenseDetail: string;
}

export const BGM_OPTIONS: BgmOption[] = [
  {
    id: "bgm-lofi",
    name: "Lo-fi Mood",
    mood: "잔잔한",
    tempo: "느림",
    templateMoods: ["정보", "감성"],
    license: "상업용 가능",
    source: "Pixabay Music",
    licenseDetail: "Pixabay 콘텐츠 라이선스 — 출처 표기 없이 상업적 영상에 자유롭게 사용 가능합니다.",
  },
  {
    id: "bgm-pop",
    name: "Upbeat Pop Loop",
    mood: "신나는",
    tempo: "빠름",
    templateMoods: ["유머"],
    license: "상업용 가능",
    source: "YouTube Audio Library",
    licenseDetail: "YouTube 오디오 라이브러리 무료 음악 — 출처 표기 불필요, 상업적 사용 가능.",
  },
  {
    id: "bgm-acoustic",
    name: "Acoustic Warm",
    mood: "감성",
    tempo: "보통",
    templateMoods: ["감성"],
    license: "개인용만",
    source: "Free Music Archive (CC BY-NC)",
    licenseDetail: "CC BY-NC 라이선스 — 비영리·개인 용도로만 사용 가능하며 상업적 게시물에는 사용할 수 없습니다.",
  },
  {
    id: "bgm-chillhop",
    name: "Chill Hop Beat",
    mood: "차분한",
    tempo: "보통",
    templateMoods: ["정보", "감성"],
    license: "상업용 가능",
    source: "Pixabay Music",
    licenseDetail: "Pixabay 콘텐츠 라이선스 — 출처 표기 없이 상업적 영상에 자유롭게 사용 가능합니다.",
  },
  {
    id: "bgm-edm-hype",
    name: "EDM Hype",
    mood: "강렬한",
    tempo: "빠름",
    templateMoods: ["유머"],
    license: "상업용 가능",
    source: "YouTube Audio Library",
    licenseDetail: "YouTube 오디오 라이브러리 무료 음악 — 출처 표기 불필요, 상업적 사용 가능.",
  },
  {
    id: "bgm-piano-calm",
    name: "Piano Calm",
    mood: "잔잔한",
    tempo: "느림",
    templateMoods: ["감성", "정보"],
    license: "상업용 가능",
    source: "Pixabay Music",
    licenseDetail: "Pixabay 콘텐츠 라이선스 — 출처 표기 없이 상업적 영상에 자유롭게 사용 가능합니다.",
  },
];

// 영상 분위기(템플릿 mood)와 BGM의 templateMoods 태그가 일치하는 곡을 우선으로 정렬해
// 추천 순서를 만든다. 실제 음향/템포 분석 없이, 태그 일치 여부로 결정짓는 모킹 로직이다.
// 라이선스 제약이 있는 리소스도 사용자가 직접 둘러보고 선택할 수 있도록 전체 목록을 반환한다.
export function recommendBgmList(mood: Mood): BgmOption[] {
  return [...BGM_OPTIONS].sort((a, b) => {
    const aScore = a.templateMoods.includes(mood) ? 1 : 0;
    const bScore = b.templateMoods.includes(mood) ? 1 : 0;
    return bScore - aScore;
  });
}

// 자동 적용(템플릿 선택 시 초안 생성 등)에는 라이선스 제약이 있는 리소스를 제외한다.
export function recommendBgm(mood: Mood): BgmOption {
  const list = recommendBgmList(mood);
  const allowed = list.filter((b) => b.license === "상업용 가능");
  return (allowed[0] ?? list[0]);
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
  license: "상업용 가능" | "개인용만";
  source: string;
  licenseDetail: string;
}

// 화면 전환 시점에 삽입할 효과음 후보. 분위기 태그로 추천 1순위를 결정한다.
export const SFX_OPTIONS: SfxOption[] = [
  {
    id: "sfx-whoosh",
    name: "스우시 전환음",
    description: "장면이 휙 전환될 때 어울리는 효과음",
    moods: ["정보", "유머"],
    license: "상업용 가능",
    source: "Pixabay Sound Effects",
    licenseDetail: "Pixabay 콘텐츠 라이선스 — 출처 표기 없이 상업적 영상에 자유롭게 사용 가능합니다.",
  },
  {
    id: "sfx-pop",
    name: "팝 강조음",
    description: "포인트를 강조할 때 통통 튀는 효과음",
    moods: ["유머"],
    license: "상업용 가능",
    source: "Freesound (CC0)",
    licenseDetail: "CC0 퍼블릭 도메인 — 저작자 표시 없이 자유롭게 사용·수정·상업적 이용이 가능합니다.",
  },
  {
    id: "sfx-chime",
    name: "차임 강조음",
    description: "부드럽게 환기시키는 종소리 효과음",
    moods: ["감성", "정보"],
    license: "상업용 가능",
    source: "Pixabay Sound Effects",
    licenseDetail: "Pixabay 콘텐츠 라이선스 — 출처 표기 없이 상업적 영상에 자유롭게 사용 가능합니다.",
  },
];

// 자동 적용에는 라이선스 제약이 있는 리소스를 제외한다 (현재 모든 효과음이 상업용 가능이지만, 향후 제한된 항목이 추가되어도 안전하도록 필터링한다).
export function recommendSfx(mood: Mood): SfxOption {
  const allowed = SFX_OPTIONS.filter((s) => s.license === "상업용 가능");
  const pool = allowed.length > 0 ? allowed : SFX_OPTIONS;
  return pool.find((s) => s.moods.includes(mood)) ?? pool[0];
}
