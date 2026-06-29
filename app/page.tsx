import Link from "next/link";
import { listProjects, listMetrics, listCalendarItems } from "@/lib/store";
import { Badge, Card, SectionHeader } from "@/components/ui";

const TARGET_METRICS = [
  { label: "월간 활성 사용자(MAU)", current: "+9%", target: "+15%" },
  { label: "사용자당 월평균 콘텐츠 생성 수", current: "+12%", target: "+20%" },
  { label: "콘텐츠당 평균 편집 시간", current: "-18%", target: "-30%" },
  { label: "생성 콘텐츠 평균 조회수", current: "+14%", target: "+25%" },
];

export default function DashboardPage() {
  const projects = listProjects();
  const metrics = listMetrics();
  const calendarItems = listCalendarItems();
  const totalViews = metrics.reduce((s, m) => s + m.views, 0);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-violet-600">핸드메이드 브랜드를 위한 AI 숏폼 콘텐츠 자동화 솔루션</p>
        <h1 className="mt-1 text-2xl font-bold text-neutral-900">대시보드</h1>
        <p className="mt-1 text-sm text-neutral-500">
          아이디어 구상부터 편집, 마케팅, 성과 분석까지 — 숏폼 콘텐츠 제작의 전 과정을 한 곳에서 관리하세요.
        </p>
      </div>

      <div>
        <SectionHeader title="핵심 지표 (목표 대비 현황)" description="제품 목표로 설정한 5가지 핵심 지표의 진행 상황입니다." />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TARGET_METRICS.map((m) => (
            <Card key={m.label}>
              <p className="text-xs text-neutral-500">{m.label}</p>
              <p className="mt-2 text-2xl font-bold text-neutral-900">{m.current}</p>
              <p className="mt-1 text-xs text-neutral-400">목표: {m.target}</p>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <SectionHeader title="최근 콘텐츠 프로젝트" />
            <Link href="/projects/new" className="text-sm font-medium text-violet-600 hover:underline">
              + 새 프로젝트
            </Link>
          </div>
          <div className="space-y-3">
            {projects.slice(0, 4).map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className="flex items-center justify-between rounded-lg border border-neutral-100 px-3 py-2.5 hover:bg-neutral-50"
              >
                <div>
                  <p className="text-sm font-medium text-neutral-900">{p.name}</p>
                  <p className="text-xs text-neutral-500">{p.description.slice(0, 40)}</p>
                </div>
                <Badge>{p.status}</Badge>
              </Link>
            ))}
            {projects.length === 0 && <p className="text-sm text-neutral-400">아직 프로젝트가 없습니다.</p>}
          </div>
        </Card>

        <Card>
          <SectionHeader title="이번 주 기획 캘린더" />
          <div className="space-y-3">
            {calendarItems.slice(0, 4).map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border border-neutral-100 px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium text-neutral-900">{c.topic}</p>
                  <p className="text-xs text-neutral-500">
                    {c.scheduledDate} · {c.platform}
                  </p>
                </div>
                <Badge>{c.status}</Badge>
              </div>
            ))}
          </div>
          <Link href="/calendar" className="mt-3 inline-block text-sm font-medium text-violet-600 hover:underline">
            캘린더 전체 보기 →
          </Link>
        </Card>
      </div>

      <Card>
        <SectionHeader title="누적 성과 요약" description="연동된 플랫폼 콘텐츠 기준" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-xs text-neutral-500">총 콘텐츠 수</p>
            <p className="mt-1 text-xl font-bold">{metrics.length}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">총 조회수</p>
            <p className="mt-1 text-xl font-bold">{totalViews.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">진행중 프로젝트</p>
            <p className="mt-1 text-xl font-bold">{projects.filter((p) => p.status !== "완료").length}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">예정된 게시</p>
            <p className="mt-1 text-xl font-bold">{calendarItems.filter((c) => c.status !== "게시완료").length}</p>
          </div>
        </div>
        <Link href="/analytics" className="mt-4 inline-block text-sm font-medium text-violet-600 hover:underline">
          성과 분석 대시보드 보기 →
        </Link>
      </Card>
    </div>
  );
}
