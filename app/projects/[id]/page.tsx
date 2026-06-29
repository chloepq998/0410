import { notFound } from "next/navigation";
import { getProject } from "@/lib/store";
import { BGM_OPTIONS } from "@/lib/ai/bgm-options";
import {
  applyHookAction,
  generateHookIdeasAction,
  generateMarketingAction,
  markProjectCompletedAction,
  regenerateTemplatesAction,
  selectTemplateAction,
  updateDraftAction,
} from "@/lib/actions/projects";
import { Badge, Button, Card, SectionHeader } from "@/components/ui";
import FeedbackForm from "@/components/FeedbackForm";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  const selectedTemplate = project.templates.find((t) => t.id === project.selectedTemplateId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Badge>{project.status}</Badge>
            <span className="text-xs text-neutral-400">
              {project.goal} · {project.tone} · {project.targetLength}초
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-neutral-900">{project.name}</h1>
          <p className="mt-1 text-sm text-neutral-500">{project.description}</p>
          <p className="mt-1 text-xs text-neutral-400">소스: {project.sourceFiles.map((f) => f.name).join(", ") || "없음"}</p>
        </div>
        {project.draft && project.status !== "완료" && (
          <form action={markProjectCompletedAction.bind(null, project.id)}>
            <Button type="submit">완료로 표시</Button>
          </form>
        )}
      </div>

      {/* 1. 템플릿 추천 */}
      <Card>
        <div className="flex items-center justify-between">
          <SectionHeader title="1. 자동화된 숏폼 영상 편집 템플릿" description="업로드한 소스를 기반으로 추천된 편집 템플릿입니다." />
          <form action={regenerateTemplatesAction.bind(null, project.id)}>
            <Button type="submit" variant="secondary">
              다시 추천받기
            </Button>
          </form>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {project.templates.map((t) => {
            const selected = t.id === project.selectedTemplateId;
            return (
              <div key={t.id} className={`rounded-lg border p-4 ${selected ? "border-violet-500 bg-violet-50" : "border-neutral-200"}`}>
                <div className="flex flex-wrap gap-1.5">
                  <Badge>{t.mood}</Badge>
                  <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs text-neutral-600">{t.lengthSec}초</span>
                  <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs text-neutral-600">{t.hookType}</span>
                </div>
                <p className="mt-2 text-sm font-medium text-neutral-900">{t.name}</p>
                <p className="mt-1 text-xs text-neutral-500">{t.previewSummary}</p>
                <p className="mt-2 text-xs text-neutral-400">
                  포함 요소: {[t.elements.bgm && "BGM", t.elements.subtitle && "자막", t.elements.transition && "전환"].filter(Boolean).join(" · ")}
                </p>
                <form action={selectTemplateAction.bind(null, project.id, t.id)} className="mt-3">
                  <Button type="submit" variant={selected ? "secondary" : "primary"} className="w-full" disabled={selected}>
                    {selected ? "적용됨" : "이 템플릿 선택"}
                  </Button>
                </form>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 2. 자동 편집 초안 + 간편 편집 */}
      {project.draft && selectedTemplate && (
        <Card>
          <SectionHeader title="자동 편집 초안 & 간편 편집" description="자동 생성된 초안의 핵심 요소를 간단히 수정할 수 있습니다." />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-neutral-700">컷 구성</p>
              <ol className="mt-2 space-y-1.5 text-sm text-neutral-600">
                {project.draft.cutPlan.map((cut, i) => (
                  <li key={i} className="rounded-lg bg-neutral-50 px-3 py-2">
                    {cut}
                  </li>
                ))}
              </ol>
            </div>
            <form action={updateDraftAction.bind(null, project.id)} className="space-y-4">
              <div>
                <p className="text-sm font-medium text-neutral-700">자막</p>
                <div className="mt-2 space-y-3">
                  {project.draft.captions.map((c) => (
                    <div key={c.id} className="rounded-lg border border-neutral-200 p-3">
                      <input
                        name={`caption_${c.id}_text`}
                        defaultValue={c.text}
                        className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
                      />
                      <div className="mt-2 flex gap-2">
                        <select name={`caption_${c.id}_position`} defaultValue={c.position} className="rounded-md border border-neutral-300 px-2 py-1 text-xs">
                          <option value="상단">상단</option>
                          <option value="중단">중단</option>
                          <option value="하단">하단</option>
                        </select>
                        <select name={`caption_${c.id}_style`} defaultValue={c.style} className="rounded-md border border-neutral-300 px-2 py-1 text-xs">
                          <option value="감성">감성</option>
                          <option value="미니멀">미니멀</option>
                          <option value="키치">키치</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-neutral-700">BGM</p>
                <select name="bgmId" defaultValue={project.draft.bgmId} className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm">
                  {BGM_OPTIONS.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.mood} · {b.license})
                    </option>
                  ))}
                </select>
                <label className="mt-2 block text-xs text-neutral-500">음량 {project.draft.bgmVolume}</label>
                <input type="range" name="bgmVolume" min={0} max={100} defaultValue={project.draft.bgmVolume} className="w-full" />
              </div>

              <div>
                <p className="text-sm font-medium text-neutral-700">전환 효과 강도</p>
                <div className="mt-1 flex gap-2">
                  {(["낮음", "중간", "높음"] as const).map((level) => (
                    <label key={level} className="flex items-center gap-1.5 text-sm text-neutral-600">
                      <input type="radio" name="transitionIntensity" value={level} defaultChecked={project.draft!.transitionIntensity === level} />
                      {level}
                    </label>
                  ))}
                </div>
              </div>

              <Button type="submit">편집 내용 저장</Button>
            </form>
          </div>
        </Card>
      )}

      {/* 2. 훅 아이디어 */}
      <Card>
        <div className="flex items-center justify-between">
          <SectionHeader title="2. AI 기반 훅 아이디어" description="제품 정보와 목적을 바탕으로 바이럴 훅 아이디어를 생성합니다." />
          <form action={generateHookIdeasAction.bind(null, project.id)}>
            <Button type="submit" variant="secondary">
              {project.hookIdeas.length > 0 ? "훅 아이디어 다시 생성" : "훅 아이디어 생성"}
            </Button>
          </form>
        </div>
        {project.hookIdeas.length === 0 ? (
          <p className="text-sm text-neutral-400">아직 생성된 훅 아이디어가 없습니다.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {project.hookIdeas.map((h) => {
              const selected = h.id === project.selectedHookId;
              return (
                <div key={h.id} className={`rounded-lg border p-3 ${selected ? "border-violet-500 bg-violet-50" : "border-neutral-200"}`}>
                  <p className="text-sm font-medium text-neutral-900">&ldquo;{h.text}&rdquo;</p>
                  <p className="mt-1 text-xs text-neutral-500">{h.sceneHint}</p>
                  <p className="mt-1 text-xs text-neutral-400">
                    {h.tone} · {h.lengthSec}초
                  </p>
                  <form action={applyHookAction.bind(null, project.id, h.id)} className="mt-2">
                    <Button type="submit" variant={selected ? "secondary" : "primary"} className="w-full" disabled={selected}>
                      {selected ? "적용됨" : "원클릭 적용"}
                    </Button>
                  </form>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* 마케팅 요소 추천 */}
      <Card>
        <div className="flex items-center justify-between">
          <SectionHeader title="해시태그 · 캡션 · CTA · 마케팅 요소 추천" description="훅과 템플릿에 맞춘 마케팅 문구와 요소를 추천합니다." />
          <form action={generateMarketingAction.bind(null, project.id)}>
            <Button type="submit" variant="secondary">
              {project.marketing ? "다시 추천받기" : "마케팅 요소 추천받기"}
            </Button>
          </form>
        </div>
        {!project.marketing ? (
          <p className="text-sm text-neutral-400">아직 추천된 마케팅 요소가 없습니다.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-neutral-700">해시태그</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {project.marketing.hashtags.map((h) => (
                    <span key={h} className="rounded-full bg-violet-50 px-2.5 py-0.5 text-xs text-violet-700">
                      {h}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-700">캡션</p>
                <p className="mt-1 text-sm text-neutral-600">{project.marketing.caption}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-700">CTA</p>
                <p className="mt-1 text-sm text-neutral-600">{project.marketing.cta}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-neutral-700">BGM 추천</p>
                <ul className="mt-1.5 space-y-1 text-sm text-neutral-600">
                  {project.marketing.bgmSuggestions.map((b) => (
                    <li key={b.id} className="flex justify-between rounded-lg bg-neutral-50 px-3 py-1.5">
                      <span>{b.name} · {b.mood}</span>
                      <span className="text-xs text-neutral-400">{b.license}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-700">자막 프리셋 추천</p>
                <ul className="mt-1.5 space-y-1 text-sm text-neutral-600">
                  {project.marketing.subtitlePresets.map((s) => (
                    <li key={s.id} className="rounded-lg bg-neutral-50 px-3 py-1.5">
                      {s.name} ({s.style})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* 피드백 */}
      <Card>
        <SectionHeader title="결과물 피드백" description="피드백을 남기면 다음 추천(훅/템플릿)에 반영됩니다." />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FeedbackForm projectId={project.id} />
          <div>
            <p className="text-sm font-medium text-neutral-700">피드백 기록</p>
            <ul className="mt-2 space-y-2">
              {project.feedback.length === 0 && <li className="text-sm text-neutral-400">아직 피드백이 없습니다.</li>}
              {project.feedback.map((f) => (
                <li key={f.id} className="rounded-lg bg-neutral-50 px-3 py-2 text-sm">
                  <span className="font-medium">{f.sentiment}</span>
                  {f.reason && <span className="text-neutral-500"> · {f.reason}</span>}
                  <p className="mt-1 text-xs text-neutral-500">{f.summary}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
