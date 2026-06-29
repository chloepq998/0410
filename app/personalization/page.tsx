import { getBrandGuide, listReferences } from "@/lib/store";
import {
  addReferenceAction,
  deleteReferenceAction,
  resetLearningDataAction,
  toggleReferenceExcludedAction,
  updateBrandGuideAction,
} from "@/lib/actions/personalization";
import { Button, Card, SectionHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function PersonalizationPage() {
  const references = await listReferences();
  const brandGuide = await getBrandGuide();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">개인화 학습</h1>
        <p className="mt-1 text-sm text-neutral-500">레퍼런스와 브랜드 가이드를 등록하면 AI 추천이 점점 더 내 스타일에 맞게 개인화됩니다.</p>
      </div>

      <Card>
        <SectionHeader title="레퍼런스 등록" description="좋았던 숏폼 영상을 URL 또는 파일로 등록해 학습 데이터로 활용하세요." />
        <form action={addReferenceAction} className="grid grid-cols-1 gap-3 sm:grid-cols-[120px_1fr_1fr_auto]">
          <select name="type" defaultValue="url" className="rounded-lg border border-neutral-300 px-3 py-2 text-sm">
            <option value="url">URL</option>
            <option value="upload">업로드</option>
          </select>
          <input name="value" required placeholder="URL 또는 파일명" className="rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
          <input name="note" placeholder="좋았던 포인트 메모" className="rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
          <Button type="submit">등록</Button>
        </form>

        <div className="mt-4 space-y-2">
          {references.map((r) => (
            <div key={r.id} className={`flex items-center justify-between rounded-lg border px-3 py-2.5 ${r.excluded ? "border-neutral-200 opacity-50" : "border-neutral-200"}`}>
              <div>
                <p className="text-sm font-medium text-neutral-900">
                  {r.type === "url" ? "🔗" : "📁"} {r.value}
                </p>
                <p className="text-xs text-neutral-500">{r.note}</p>
              </div>
              <div className="flex gap-2">
                <form action={toggleReferenceExcludedAction.bind(null, r.id, !r.excluded)}>
                  <Button type="submit" variant="secondary">
                    {r.excluded ? "학습에 포함" : "학습에서 제외"}
                  </Button>
                </form>
                <form action={deleteReferenceAction.bind(null, r.id)}>
                  <Button type="submit" variant="danger">
                    삭제
                  </Button>
                </form>
              </div>
            </div>
          ))}
          {references.length === 0 && <p className="text-sm text-neutral-400">등록된 레퍼런스가 없습니다.</p>}
        </div>
      </Card>

      <Card>
        <SectionHeader title="브랜드 가이드" description="톤 키워드, 금지 표현, 선호 색감, 브랜드 문구를 설정하면 추천 시 우선 반영됩니다." />
        <form action={updateBrandGuideAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700">톤 키워드 (쉼표로 구분)</label>
            <input
              name="toneKeywords"
              defaultValue={brandGuide.toneKeywords.join(", ")}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700">금지 표현 (쉼표로 구분)</label>
            <input
              name="bannedExpressions"
              defaultValue={brandGuide.bannedExpressions.join(", ")}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700">선호 색감 (쉼표로 구분)</label>
            <input
              name="preferredColors"
              defaultValue={brandGuide.preferredColors.join(", ")}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700">자주 쓰는 브랜드 문구 (쉼표로 구분)</label>
            <input
              name="brandPhrases"
              defaultValue={brandGuide.brandPhrases.join(", ")}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <Button type="submit">브랜드 가이드 저장</Button>
        </form>
      </Card>

      <Card>
        <SectionHeader title="학습 데이터 초기화" description="전체 레퍼런스, 브랜드 가이드, 피드백 기록을 초기화합니다. 되돌릴 수 없습니다." />
        <form action={resetLearningDataAction} className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-sm font-medium text-neutral-700">계속하려면 &ldquo;초기화&rdquo;를 입력하세요</label>
            <input
              name="confirmText"
              required
              pattern="초기화"
              title="정확히 '초기화'를 입력하세요"
              className="mt-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <Button type="submit" variant="danger">
            전체 초기화
          </Button>
        </form>
      </Card>
    </div>
  );
}
