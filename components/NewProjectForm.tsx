"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";
import { createProjectAction } from "@/lib/actions/projects";
import { Button, Card } from "@/components/ui";

export default function NewProjectForm() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    setUploading(true);
    try {
      const sourceFiles = await Promise.all(
        files.map(async (file) => {
          const blob = await upload(file.name, file, {
            access: "public",
            handleUploadUrl: "/api/upload",
          });
          return {
            name: file.name,
            kind: file.type.startsWith("video/") ? "video" : "photo",
            url: blob.url,
          };
        })
      );
      formData.set("sourceFiles", JSON.stringify(sourceFiles));
      await createProjectAction(formData);
    } catch {
      setError("파일 업로드에 실패했습니다. 다시 시도해주세요.");
      setUploading(false);
    }
  }

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
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            className="mt-1 block w-full text-sm text-neutral-600"
          />
          <p className="mt-1 text-xs text-neutral-400">권장 비율 9:16, 권장 길이 5~15초. 업로드한 영상은 실제 자동 편집에 사용됩니다.</p>
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
            <select name="targetLength" defaultValue="10" className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm">
              <option value="5">5초</option>
              <option value="10">10초</option>
              <option value="15">15초</option>
            </select>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" disabled={uploading}>
          {uploading ? "소스 업로드 중..." : "프로젝트 생성하고 템플릿 추천받기"}
        </Button>
      </form>
    </Card>
  );
}
