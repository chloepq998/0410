import { Button } from "@/components/ui";
import type { CalendarItem } from "@/lib/types";

export default function CalendarItemForm({
  action,
  item,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  item?: CalendarItem;
  submitLabel: string;
}) {
  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-neutral-700">주제</label>
        <input
          name="topic"
          required
          defaultValue={item?.topic}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700">핵심 메시지</label>
        <input
          name="keyMessage"
          defaultValue={item?.keyMessage}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700">훅 후보 (줄바꿈으로 구분)</label>
        <textarea
          name="hookCandidates"
          rows={2}
          defaultValue={item?.hookCandidates.join("\n")}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700">컷 구성 (간단 스토리보드 메모)</label>
        <textarea
          name="storyboardNotes"
          rows={3}
          defaultValue={item?.storyboardNotes}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700">필요 소스</label>
        <input
          name="requiredSources"
          defaultValue={item?.requiredSources}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-neutral-700">상태</label>
          <select name="status" defaultValue={item?.status ?? "아이디어"} className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm">
            <option value="아이디어">아이디어</option>
            <option value="제작중">제작중</option>
            <option value="게시완료">게시완료</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700">게시 예정일</label>
          <input
            type="date"
            name="scheduledDate"
            defaultValue={item?.scheduledDate ?? new Date().toISOString().slice(0, 10)}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700">플랫폼</label>
          <select name="platform" defaultValue={item?.platform ?? "틱톡"} className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm">
            <option value="틱톡">틱톡</option>
            <option value="릴스">릴스</option>
            <option value="쇼츠">쇼츠</option>
          </select>
        </div>
      </div>
      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}
