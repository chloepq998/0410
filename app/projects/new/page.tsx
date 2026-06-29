import NewProjectForm from "@/components/NewProjectForm";

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">새 프로젝트 만들기</h1>
        <p className="mt-1 text-sm text-neutral-500">
          소스를 업로드하고 자동 편집을 시작하면, 템플릿 적용 · 하이라이트 컷 구성 · 자막 · BGM이 자동으로 합성된 숏폼 초안이 생성됩니다.
        </p>
      </div>
      <NewProjectForm />
    </div>
  );
}
