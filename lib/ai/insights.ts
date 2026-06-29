import type { ContentMetric, Mood } from "@/lib/types";

export interface TypeStat {
  key: string;
  count: number;
  avgViews: number;
  avgReach: number;
}

export function groupByHookType(metrics: ContentMetric[]): TypeStat[] {
  return groupBy(metrics, (m) => m.hookType);
}

export function groupByTemplateMood(metrics: ContentMetric[]): TypeStat[] {
  return groupBy(metrics, (m) => m.templateMood);
}

function groupBy(metrics: ContentMetric[], keyFn: (m: ContentMetric) => string): TypeStat[] {
  const map = new Map<string, ContentMetric[]>();
  for (const m of metrics) {
    const key = keyFn(m);
    map.set(key, [...(map.get(key) ?? []), m]);
  }
  return [...map.entries()]
    .map(([key, items]) => ({
      key,
      count: items.length,
      avgViews: Math.round(items.reduce((s, i) => s + i.views, 0) / items.length),
      avgReach: Math.round(items.reduce((s, i) => s + i.reach, 0) / items.length),
    }))
    .sort((a, b) => b.avgViews - a.avgViews);
}

export function topContent(metrics: ContentMetric[], limit = 5): ContentMetric[] {
  return [...metrics].sort((a, b) => b.views - a.views).slice(0, limit);
}

export function generateImprovementSuggestions(metrics: ContentMetric[]): string[] {
  const byHook = groupByHookType(metrics);
  const byMood = groupByTemplateMood(metrics);
  const suggestions: string[] = [];

  if (byHook.length > 0) {
    suggestions.push(`'${byHook[0].key}' 훅이 평균 조회수 ${byHook[0].avgViews.toLocaleString()}회로 가장 높아요. 다음 콘텐츠에도 이 훅 스타일을 활용해보세요.`);
  }
  if (byMood.length > 1) {
    const weakest = byMood[byMood.length - 1];
    suggestions.push(`'${weakest.key}' 분위기 템플릿의 도달률이 낮은 편이에요. 오프닝 훅을 더 짧게 줄이는 걸 고려해보세요.`);
  }
  suggestions.push("CTA 문구를 '프로필 링크 확인'에서 '댓글로 색상 골라주세요'처럼 참여 유도형으로 바꿔보세요.");
  suggestions.push("최근 콘텐츠 평균 길이보다 2~3초 짧은 버전을 A/B로 테스트해보세요.");
  return suggestions.slice(0, 4);
}

export function describeMoodTrend(mood: Mood): string {
  return `${mood} 분위기 콘텐츠`;
}

export interface DailyTrendPoint {
  date: string;
  views: number;
  reach: number;
  engagement: number;
}

export function buildDailyTrend(metrics: ContentMetric[], from: Date, to: Date): DailyTrendPoint[] {
  const points: DailyTrendPoint[] = [];
  const cursor = new Date(from);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(0, 0, 0, 0);

  while (cursor <= end) {
    const dateKey = cursor.toISOString().slice(0, 10);
    const dayMetrics = metrics.filter((m) => m.publishedAt.slice(0, 10) === dateKey);
    points.push({
      date: dateKey,
      views: dayMetrics.reduce((s, m) => s + m.views, 0),
      reach: dayMetrics.reduce((s, m) => s + m.reach, 0),
      engagement: dayMetrics.reduce((s, m) => s + m.likes + m.comments + m.shares, 0),
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return points;
}
