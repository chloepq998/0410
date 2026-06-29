"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function SourceFilters({ length, sort }: { length: string; sort: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <div>
        <label className="block text-xs font-medium text-neutral-500">길이</label>
        <select
          value={length}
          onChange={(e) => updateParam("length", e.target.value)}
          className="mt-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        >
          <option value="">전체</option>
          <option value="short">짧은 영상 (5분 미만)</option>
          <option value="medium">중간 길이 (5~30분)</option>
          <option value="long">긴 영상 (30분 이상)</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-neutral-500">정렬</label>
        <select
          value={sort}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="mt-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        >
          <option value="newest">업로드일 최신순</option>
          <option value="oldest">업로드일 오래된순</option>
        </select>
      </div>
    </div>
  );
}
