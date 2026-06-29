import Link from "next/link";
import { listProjects } from "@/lib/store";
import { Badge, Card } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await listProjects();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">콘텐츠 프로젝트</h1>
          <p className="mt-1 text-sm text-neutral-500">소스를 업로드하고 AI 편집 템플릿과 훅 아이디어를 추천받아 숏폼 영상을 완성하세요.</p>
        </div>
        <Link
          href="/projects/new"
          className="inline-flex items-center rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
        >
          + 새 프로젝트
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <Link key={p.id} href={`/projects/${p.id}`}>
            <Card className="h-full transition hover:border-violet-300 hover:shadow-md">
              <div className="flex items-center justify-between">
                <Badge>{p.status}</Badge>
                <span className="text-xs text-neutral-400">{p.targetLength}초 · {p.goal}</span>
              </div>
              <p className="mt-3 font-semibold text-neutral-900">{p.name}</p>
              <p className="mt-1 line-clamp-2 text-sm text-neutral-500">{p.description}</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-neutral-400">
                <span>{p.sourceFiles.length}개 소스</span>
                <span>·</span>
                <span>{p.templates.length}개 템플릿 추천</span>
              </div>
            </Card>
          </Link>
        ))}
        {projects.length === 0 && (
          <Card className="sm:col-span-2 lg:col-span-3 text-center text-neutral-400">아직 생성된 프로젝트가 없습니다.</Card>
        )}
      </div>
    </div>
  );
}
