"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";
import { autoEditAction } from "@/lib/actions/projects";
import { addSourceAction } from "@/lib/actions/sources";
import { classifySourceKind, getVideoDuration, validateSourceFile } from "@/lib/upload-validation";
import { Button, Card } from "@/components/ui";

export default function NewProjectForm() {
  const [files, setFiles] = useState<File[]>([]);
  const [stage, setStage] = useState<"idle" | "uploading" | "editing">("idle");
  const [error, setError] = useState<string | null>(null);

  function handleFilesSelected(fileList: FileList | null) {
    const selected = Array.from(fileList ?? []);
    const valid: File[] = [];
    const errors: string[] = [];
    for (const file of selected) {
      const invalidReason = validateSourceFile(file);
      if (invalidReason) {
        errors.push(invalidReason);
      } else {
        valid.push(file);
      }
    }
    setFiles(valid);
    setError(errors.length > 0 ? errors.join(" ") : null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (files.length === 0) {
      setError("원본 영상 또는 사진을 1개 이상 업로드해주세요.");
      return;
    }

    const formData = new FormData(e.currentTarget);

    setStage("uploading");
    try {
      const sourceFiles = await Promise.all(
        files.map(async (file) => {
          const blob = await upload(file.name, file, {
            access: "public",
            handleUploadUrl: "/api/upload",
            multipart: true,
          });
          const kind = classifySourceKind(file);
          const durationSec = await getVideoDuration(file);
          await addSourceAction({ name: file.name, kind, url: blob.url, sizeBytes: file.size, durationSec });
          return { name: file.name, kind, url: blob.url, durationSec };
        })
      );
      formData.set("sourceFiles", JSON.stringify(sourceFiles));
      setStage("editing");
      await autoEditAction(formData);
    } catch {
      setError("자동 편집 처리에 실패했습니다. 다시 시도해주세요.");
      setStage("idle");
    }
  }

  const submitting = stage !== "idle";

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-neutral-700">프로젝트 이름</label>
          <input
            name="name"
            required
            placeholder="예: 비즈 목걸이 신상 홍보"
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700">제품 설명</label>
          <textarea
            name="description"
            rows={3}
            placeholder="제품명, 특징, 가격대, 타겟 등을 입력하세요"
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700">소스 업로드 (사진/영상)</label>
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={(e) => handleFilesSelected(e.target.files)}
            className="mt-1 block w-full text-sm text-neutral-600"
          />
          <p className="mt-1 text-xs text-neutral-400">
            권장 비율 9:16. MP4, MOV, AVI 영상 또는 이미지 파일, 최대 5GB까지 업로드할 수 있어요. 업로드한 영상/사진은 실제 자동
            편집(하이라이트·자막·BGM 합성)에 사용되며, &ldquo;원본 소스&rdquo; 목록에도 자동으로 등록됩니다.
          </p>
          {files.length > 0 && (
            <ul className="mt-2 list-inside list-disc text-xs text-neutral-500">
              {files.map((f) => (
                <li key={f.name}>{f.name}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-neutral-700">목적</label>
            <select name="goal" defaultValue="판매" className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm">
              <option value="인지도">인지도 향상</option>
              <option value="판매">판매 증진</option>
              <option value="팔로우">팔로우 유도</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700">톤</label>
            <select name="tone" defaultValue="발랄" className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm">
              <option value="발랄">발랄</option>
              <option value="진지">진지</option>
              <option value="유머">유머</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700">목표 길이</label>
            <select name="targetLength" defaultValue="15" className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm">
              <option value="15">15초</option>
              <option value="30">30초</option>
              <option value="60">60초</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700">템플릿</label>
          <select name="templateMode" defaultValue="auto" className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm">
            <option value="auto">자동 추천 (AI가 가장 적합한 템플릿 적용)</option>
            <option value="none">템플릿 없음 (기본 스타일)</option>
          </select>
          <p className="mt-1 text-xs text-neutral-400">생성 후에도 추천 템플릿 중 다른 것으로 바로 바꿀 수 있습니다.</p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" disabled={submitting}>
          {stage === "uploading" && "소스 업로드 중..."}
          {stage === "editing" && "자동 편집 처리 중..."}
          {stage === "idle" && "자동 편집 시작"}
        </Button>
      </form>
    </Card>
  );
}
