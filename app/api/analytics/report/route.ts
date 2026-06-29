import { NextRequest } from "next/server";
import { listMetrics, listCalendarItems } from "@/lib/store";
import { generateImprovementSuggestions, topContent } from "@/lib/ai/insights";
import { resolveRange } from "@/lib/analytics-range";

function escapeCsv(value: string | number): string {
  const str = String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function toCsvRow(values: (string | number)[]): string {
  return values.map(escapeCsv).join(",");
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const { from, to, label, range } = resolveRange(searchParams.get("range"), searchParams.get("from"), searchParams.get("to"));

  const allMetrics = await listMetrics();
  const metrics = allMetrics.filter((m) => {
    const d = m.publishedAt.slice(0, 10);
    return d >= from.toISOString().slice(0, 10) && d <= to.toISOString().slice(0, 10);
  });

  const rows: string[] = [];
  rows.push(`성과 리포트 (${label})`);
  rows.push("");
  rows.push("요약 지표");
  rows.push(toCsvRow(["콘텐츠 수", "총 조회수", "총 도달", "총 좋아요", "총 댓글", "총 공유"]));
  rows.push(
    toCsvRow([
      metrics.length,
      metrics.reduce((s, m) => s + m.views, 0),
      metrics.reduce((s, m) => s + m.reach, 0),
      metrics.reduce((s, m) => s + m.likes, 0),
      metrics.reduce((s, m) => s + m.comments, 0),
      metrics.reduce((s, m) => s + m.shares, 0),
    ])
  );
  rows.push("");
  rows.push("상위 콘텐츠");
  rows.push(toCsvRow(["제목", "플랫폼", "게시일", "조회수", "도달", "훅 유형"]));
  for (const c of topContent(metrics, 5)) {
    rows.push(toCsvRow([c.projectName, c.platform, c.publishedAt.slice(0, 10), c.views, c.reach, c.hookType]));
  }
  rows.push("");
  rows.push("개선 제안");
  for (const s of generateImprovementSuggestions(metrics)) {
    rows.push(toCsvRow([s]));
  }
  rows.push("");
  rows.push("다음 주 추천 주제");
  const ideaCards = (await listCalendarItems()).filter((c) => c.status === "아이디어");
  for (const c of ideaCards) {
    rows.push(toCsvRow([c.topic]));
  }

  const csv = "﻿" + rows.join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="performance-report-${range}.csv"; filename*=UTF-8''${encodeURIComponent(`성과리포트-${label}`)}.csv`,
    },
  });
}
