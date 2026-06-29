"use client";

import { useState } from "react";
import { createProjectAction } from "@/lib/actions/projects";
import { Button, Card } from "@/components/ui";

export default function NewProjectForm() {
  const [fileNames, setFileNames] = useState<string[]>([]);

  return (
    <Card>
      <form action={createProjectAction} className="space-y-5">
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
            onChange={(e) => setFileNames(Array.from(e.target.files ?? []).map((f) => f.name))}
            className="mt-1 block w-full text-sm text-neutral-600"
          />
          <p className="mt-1 text-xs text-neutral-400">권장 비율 9:16, 권장 길이 5~15초. 업로드된 파일은 데모에서 실제 저장되지 않습니다.</p>
          {fileNames.length > 0 && (
            <ul className="mt-2 list-inside list-disc text-xs text-neutral-500">
              {fileNames.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          )}
          <input type="hidden" name="fileNames" value={fileNames.join(",")} />
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

        <Button type="submit">프로젝트 생성하고 템플릿 추천받기</Button>
      </form>
    </Card>
  );
}
