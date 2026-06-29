import Link from "next/link";
import { getPlatformConnection, listMetrics } from "@/lib/store";
import { togglePlatformConnectionAction } from "@/lib/actions/analytics";
import { buildDailyTrend, generateImprovementSuggestions, groupByHookType, groupByTemplateMood, topContent } from "@/lib/ai/insights";
import { resolveRange } from "@/lib/analytics-range";
import { Badge, Button, Card, SectionHeader } from "@/components/ui";
import TrendChart from "@/components/TrendChart";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const connection = getPlatformConnection();
  const allMetrics = listMetrics();
  const { from, to, label, range } = resolveRange(sp.range ?? null, sp.from, sp.to);

  const metrics = allMetrics.filter((m) => {
    const d = m.publishedAt.slice(0, 10);
    return d >= from.toISOString().slice(0, 10) && d <= to.toISOString().slice(0, 10);
  });
  const trend = buildDailyTrend(allMetrics, from, to);
  const top = topContent(metrics, 5);
  const byHook = groupByHookType(metrics);
  const byMood = groupByTemplateMood(metrics);
  const suggestions = generateImprovementSuggestions(metrics);

  const rangeLink = (r: string) => `/analytics?range=${r}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">콘텐츠 성과 분석</h1>
          <p className="mt-1 text-sm text-neutral-500">연동된 플랫폼의 콘텐츠 성과를 한눈에 확인하고 다음 기획에 반영하세요.</p>
        </div>
        <a
          href={`/api/analytics/report?range=${range}${sp.from ? `&from=${sp.from}&to=${sp.to}` : ""}`}
          className="inline-flex items-center rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
        >
          📄 리포트 다운로드 (CSV)
        </a>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-900">틱톡 플랫폼 연동</p>
            <p className="mt-0.5 text-xs text-neutral-500">
              {connection.connected ? `연동됨 · ${connection.connectedAt?.slice(0, 10)}` : "연동되지 않음"}
            </p>
          </div>
          <form action={togglePlatformConnectionAction}>
            <Button type="submit" variant={connection.connected ? "secondary" : "primary"}>
              {connection.connected ? "연동 해제" : "연동하기"}
            </Button>
          </form>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <SectionHeader title="기간별 성과 추이" description={label} />
          <div className="flex gap-2">
            <Link href={rangeLink("7")} className={`rounded-lg border px-3 py-1.5 text-xs ${range === "7" ? "border-violet-500 bg-violet-50 text-violet-700" : "border-neutral-300"}`}>
              7일
            </Link>
            <Link href={rangeLink("30")} className={`rounded-lg border px-3 py-1.5 text-xs ${range === "30" ? "border-violet-500 bg-violet-50 text-violet-700" : "border-neutral-300"}`}>
              30일
            </Link>
          </div>
        </div>
        <TrendChart data={trend} />
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <SectionHeader title="상위 콘텐츠" />
          <div className="space-y-2">
            {top.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2 text-sm">
                <div>
                  <p className="font-medium text-neutral-900">{c.projectName}</p>
                  <p className="text-xs text-neutral-500">
                    {c.platform} · {c.hookType}
                  </p>
                </div>
                <p className="font-semibold text-violet-700">{c.views.toLocaleString()}회</p>
              </div>
            ))}
            {top.length === 0 && <p className="text-sm text-neutral-400">선택한 기간에 콘텐츠가 없습니다.</p>}
          </div>
        </Card>

        <Card>
          <SectionHeader title="훅/템플릿 유형별 성과" />
          <p className="text-xs font-medium text-neutral-500">훅 유형</p>
          <div className="mt-1.5 space-y-1.5">
            {byHook.map((h) => (
              <div key={h.key} className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-1.5 text-sm">
                <span>{h.key}</span>
                <span className="text-neutral-500">평균 {h.avgViews.toLocaleString()}회</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs font-medium text-neutral-500">템플릿 분위기</p>
          <div className="mt-1.5 space-y-1.5">
            {byMood.map((m) => (
              <div key={m.key} className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-1.5 text-sm">
                <span>{m.key}</span>
                <span className="text-neutral-500">평균 {m.avgViews.toLocaleString()}회</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <SectionHeader title="다음 콘텐츠 개선 제안" />
        <ul className="space-y-2">
          {suggestions.map((s, i) => (
            <li key={i} className="flex gap-2 rounded-lg bg-violet-50 px-3 py-2.5 text-sm text-violet-900">
              <Badge>{`제안 ${i + 1}`}</Badge>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
