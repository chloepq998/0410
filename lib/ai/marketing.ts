import type { Goal, MarketingSuggestions } from "@/lib/types";
import { BGM_OPTIONS, SUBTITLE_PRESET_OPTIONS } from "@/lib/ai/bgm-options";

const CTA_BY_GOAL: Record<Goal, string> = {
  인지도: "더 많은 디자인은 프로필 링크에서 확인하세요!",
  판매: "지금 스토어에서 바로 만나보세요!",
  팔로우: "다음 신상 소식 놓치지 말고 팔로우하세요!",
};

export function generateMarketingSuggestions(input: {
  goal: Goal;
  productName: string;
}): MarketingSuggestions {
  const base = input.productName.replace(/\s+/g, "");
  return {
    hashtags: [`#${base}`, "#핸드메이드", "#수공예", "#소상공인", "#틱톡쇼핑", "#OOTD"].slice(0, 5),
    caption: `${input.productName}, 직접 만들어서 더 특별해요. 디테일 하나까지 신경 썼어요.`,
    cta: CTA_BY_GOAL[input.goal],
    bgmSuggestions: BGM_OPTIONS,
    subtitlePresets: SUBTITLE_PRESET_OPTIONS,
  };
}
