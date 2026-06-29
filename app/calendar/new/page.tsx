import CalendarItemForm from "@/components/CalendarItemForm";
import { createCalendarItemAction } from "@/lib/actions/calendar";
import { Card } from "@/components/ui";

export default function NewCalendarItemPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">새 기획 카드</h1>
        <p className="mt-1 text-sm text-neutral-500">주제, 핵심 메시지, 훅 후보, 간단 스토리보드를 입력하세요.</p>
      </div>
      <Card>
        <CalendarItemForm action={createCalendarItemAction} submitLabel="기획 카드 생성" />
      </Card>
    </div>
  );
}
