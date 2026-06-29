import NewProjectForm from "@/components/NewProjectForm";

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">새 프로젝트 만들기</h1>
        <p className="mt-1 text-sm text-neutral-500">소스와 제품 정보를 입력하면 AI가 편집 템플릿을 추천합니다.</p>
      </div>
      <NewProjectForm />
    </div>
  );
}
