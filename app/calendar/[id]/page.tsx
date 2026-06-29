import { notFound } from "next/navigation";
import Link from "next/link";
import { getCalendarItem } from "@/lib/store";
import { deleteCalendarItemAction, updateCalendarItemAction } from "@/lib/actions/calendar";
import CalendarItemForm from "@/components/CalendarItemForm";
import { Button, Card } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function CalendarItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getCalendarItem(id);
  if (!item) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/calendar" className="text-sm text-violet-600 hover:underline">
            ← 캘린더로
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-neutral-900">기획 카드 편집</h1>
        </div>
        <form action={deleteCalendarItemAction.bind(null, item.id)}>
          <Button type="submit" variant="danger">
            삭제
          </Button>
        </form>
      </div>
      <Card>
        <CalendarItemForm action={updateCalendarItemAction.bind(null, item.id)} item={item} submitLabel="변경사항 저장" />
      </Card>
    </div>
  );
}
