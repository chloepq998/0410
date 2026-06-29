import type { Goal, LengthSec, Mood, Template, TemplateCategory, Tone } from "@/lib/types";

export const TEMPLATE_CATEGORIES: TemplateCategory[] = ["브이로그", "제품 리뷰", "정보", "챌린지"];

const MOOD_BY_GOAL: Record<Goal, Mood[]> = {
  인지도: ["유머", "감성", "정보"],
  판매: ["정보", "감성", "유머"],
  팔로우: ["감성", "유머", "정보"],
};

// 카테고리별 3개씩, 총 12개의 고정 편집 템플릿 라이브러리. 적용 시 자막 스타일/전환/색감/
// 음악 분위기가 함께 바뀌도록 색상 테마(colorTheme)·폰트(fontStyle)·BGM(bgmId)을 함께 정의한다.
export const TEMPLATE_LIBRARY: Template[] = [
  // 브이로그
  {
    id: "tpl-vlog-1",
    name: "감성 데일리 브이로그",
    category: "브이로그",
    lengthSec: 30,
    mood: "감성",
    hookType: "POV 시점",
    elements: { bgm: true, subtitle: true, transition: true },
    colorTheme: ["베이지", "아이보리", "웜그레이"],
    fontStyle: "손글씨 느낌 세리프",
    bgmId: "bgm-acoustic",
    previewSummary: "따뜻한 베이지 톤과 잔잔한 어쿠스틱 BGM으로 일상의 분위기를 감성적으로 담아냅니다.",
  },
  {
    id: "tpl-vlog-2",
    name: "밝은 일상 브이로그",
    category: "브이로그",
    lengthSec: 15,
    mood: "유머",
    hookType: "질문형 오프닝",
    elements: { bgm: true, subtitle: true, transition: true },
    colorTheme: ["옐로우", "화이트"],
    fontStyle: "둥근 산세리프",
    bgmId: "bgm-pop",
    previewSummary: "밝은 옐로우 톤과 신나는 팝 BGM으로 짧고 경쾌하게 일상을 보여줍니다.",
  },
  {
    id: "tpl-vlog-3",
    name: "차분한 루틴 브이로그",
    category: "브이로그",
    lengthSec: 60,
    mood: "정보",
    hookType: "타임랩스",
    elements: { bgm: true, subtitle: true, transition: false },
    colorTheme: ["네이비", "그레이"],
    fontStyle: "미니멀 산세리프",
    bgmId: "bgm-lofi",
    previewSummary: "전환 효과 없이 잔잔한 Lo-fi BGM으로 차분한 루틴을 타임랩스로 보여줍니다.",
  },
  // 제품 리뷰
  {
    id: "tpl-product-1",
    name: "제품 클로즈업 리뷰",
    category: "제품 리뷰",
    lengthSec: 30,
    mood: "정보",
    hookType: "클로즈업 반전",
    elements: { bgm: true, subtitle: true, transition: true },
    colorTheme: ["화이트", "블랙"],
    fontStyle: "굵은 고딕",
    bgmId: "bgm-lofi",
    previewSummary: "화이트&블랙 배경에 굵은 고딕 자막으로 제품 디테일을 또렷하게 강조합니다.",
  },
  {
    id: "tpl-product-2",
    name: "비포&애프터 언박싱",
    category: "제품 리뷰",
    lengthSec: 15,
    mood: "감성",
    hookType: "비포&애프터",
    elements: { bgm: true, subtitle: true, transition: true },
    colorTheme: ["파스텔 핑크", "라벤더"],
    fontStyle: "감성 세리프",
    bgmId: "bgm-acoustic",
    previewSummary: "파스텔 핑크·라벤더 색감과 감성 세리프 자막으로 비포&애프터 변화를 보여줍니다.",
  },
  {
    id: "tpl-product-3",
    name: "신나는 제품 소개",
    category: "제품 리뷰",
    lengthSec: 30,
    mood: "유머",
    hookType: "질문형 오프닝",
    elements: { bgm: true, subtitle: true, transition: true },
    colorTheme: ["코랄", "민트"],
    fontStyle: "키치 팝",
    bgmId: "bgm-pop",
    previewSummary: "코랄·민트 컬러와 키치한 팝 자막체로 발랄하게 제품을 소개합니다.",
  },
  // 정보
  {
    id: "tpl-info-1",
    name: "꿀팁 요약형",
    category: "정보",
    lengthSec: 30,
    mood: "정보",
    hookType: "질문형 오프닝",
    elements: { bgm: true, subtitle: true, transition: false },
    colorTheme: ["스카이블루", "화이트"],
    fontStyle: "깔끔한 산세리프",
    bgmId: "bgm-lofi",
    previewSummary: "스카이블루 배경에 깔끔한 산세리프 자막으로 핵심 정보를 간결하게 요약합니다.",
  },
  {
    id: "tpl-info-2",
    name: "타임랩스 설명형",
    category: "정보",
    lengthSec: 60,
    mood: "정보",
    hookType: "타임랩스",
    elements: { bgm: true, subtitle: true, transition: true },
    colorTheme: ["그레이", "옐로우"],
    fontStyle: "굵은 고딕",
    bgmId: "bgm-lofi",
    previewSummary: "타임랩스 구성과 굵은 고딕 자막으로 과정을 단계별로 설명합니다.",
  },
  {
    id: "tpl-info-3",
    name: "발랄한 카드뉴스형",
    category: "정보",
    lengthSec: 15,
    mood: "유머",
    hookType: "POV 시점",
    elements: { bgm: true, subtitle: true, transition: true },
    colorTheme: ["퍼플", "화이트"],
    fontStyle: "둥근 산세리프",
    bgmId: "bgm-pop",
    previewSummary: "퍼플 포인트 컬러와 둥근 자막체로 정보를 카드뉴스처럼 가볍게 전달합니다.",
  },
  // 챌린지
  {
    id: "tpl-challenge-1",
    name: "트렌드 챌린지",
    category: "챌린지",
    lengthSec: 15,
    mood: "유머",
    hookType: "비포&애프터",
    elements: { bgm: true, subtitle: true, transition: true },
    colorTheme: ["네온그린", "블랙"],
    fontStyle: "키치 팝",
    bgmId: "bgm-pop",
    previewSummary: "네온그린·블랙의 강한 대비와 키치한 자막체로 챌린지 영상의 임팩트를 살립니다.",
  },
  {
    id: "tpl-challenge-2",
    name: "감성 챌린지",
    category: "챌린지",
    lengthSec: 30,
    mood: "감성",
    hookType: "클로즈업 반전",
    elements: { bgm: true, subtitle: true, transition: true },
    colorTheme: ["라벤더", "핑크"],
    fontStyle: "손글씨 느낌 세리프",
    bgmId: "bgm-acoustic",
    previewSummary: "라벤더·핑크 색감과 손글씨 느낌 자막으로 감성적인 챌린지 무드를 표현합니다.",
  },
  {
    id: "tpl-challenge-3",
    name: "정보성 챌린지 설명",
    category: "챌린지",
    lengthSec: 60,
    mood: "정보",
    hookType: "POV 시점",
    elements: { bgm: true, subtitle: true, transition: false },
    colorTheme: ["네이비", "화이트"],
    fontStyle: "미니멀 산세리프",
    bgmId: "bgm-lofi",
    previewSummary: "네이비&화이트 톤과 미니멀 자막으로 챌린지 규칙을 차분하게 설명합니다.",
  },
];

function pickTemplateForMood(mood: Mood, targetLength: LengthSec): Template {
  const candidates = TEMPLATE_LIBRARY.filter((t) => t.mood === mood);
  return candidates.find((t) => t.lengthSec === targetLength) ?? candidates[0];
}

// 목표(goal)에 맞는 분위기 3종에 대해, 길이가 가장 잘 맞는 템플릿을 라이브러리에서 추천한다.
export function generateTemplates(input: { goal: Goal; tone: Tone; targetLength: LengthSec }): Template[] {
  const moods = MOOD_BY_GOAL[input.goal];
  return moods.map((mood) => pickTemplateForMood(mood, input.targetLength));
}
