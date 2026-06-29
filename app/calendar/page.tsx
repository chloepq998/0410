import Link from "next/link";
import { listCalendarItems } from "@/lib/store";
import { buildMonthGrid, formatMonthParam, parseMonthParam, WEEKDAY_LABELS } from "@/lib/calendar-utils";
import { Badge, Card, SectionHeader } from "@/components/ui";

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const { month: monthParam } = await searchParams;
  const { year, month } = parseMonthParam(monthParam);
  const grid = buildMonthGrid(year, month);
  const items = listCalendarItems();

  const itemsByDate = new Map<string, typeof items>();
  for (const item of items) {
    itemsByDate.set(item.scheduledDate, [...(itemsByDate.get(item.scheduledDate) ?? []), item]);
  }

  const prevMonth = formatMonthParam(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1);
  const nextMonth = formatMonthParam(month === 11 ? year + 1 : year, month === 11 ? 0 : month + 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">기획 캘린더</h1>
          <p className="mt-1 text-sm text-neutral-500">월별 콘텐츠 기획과 게시 일정을 한눈에 관리하세요.</p>
        </div>
        <Link href="/calendar/new" className="inline-flex items-center rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700">
          + 새 기획 카드
        </Link>
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <Link href={`/calendar?month=${prevMonth}`} className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50">
            ← 이전 달
          </Link>
          <p className="text-base font-semibold text-neutral-900">
            {year}년 {month + 1}월
          </p>
          <Link href={`/calendar?month=${nextMonth}`} className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50">
            다음 달 →
          </Link>
        </div>
        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-neutral-200 bg-neutral-200 text-xs">
          {WEEKDAY_LABELS.map((w) => (
            <div key={w} className="bg-neutral-50 px-2 py-1.5 text-center font-medium text-neutral-500">
              {w}
            </div>
          ))}
          {grid.map((cell) => {
            const dayItems = itemsByDate.get(cell.date) ?? [];
            const dayNum = Number(cell.date.split("-")[2]);
            return (
              <div key={cell.date} className={`min-h-[88px] bg-white p-1.5 ${cell.inMonth ? "" : "bg-neutral-50 text-neutral-400"}`}>
                <p className="text-xs">{dayNum}</p>
                <div className="mt-1 space-y-1">
                  {dayItems.map((item) => (
                    <Link
                      key={item.id}
                      href={`/calendar/${item.id}`}
                      className="block truncate rounded bg-violet-50 px-1.5 py-0.5 text-[11px] text-violet-700 hover:bg-violet-100"
                      title={item.topic}
                    >
                      {item.topic}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <SectionHeader title="전체 기획 카드" />
        <div className="space-y-2">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/calendar/${item.id}`}
              className="flex items-center justify-between rounded-lg border border-neutral-100 px-3 py-2.5 hover:bg-neutral-50"
            >
              <div>
                <p className="text-sm font-medium text-neutral-900">{item.topic}</p>
                <p className="text-xs text-neutral-500">
                  {item.scheduledDate} · {item.platform}
                </p>
              </div>
              <Badge>{item.status}</Badge>
            </Link>
          ))}
          {items.length === 0 && <p className="text-sm text-neutral-400">등록된 기획 카드가 없습니다.</p>}
        </div>
      </Card>
    </div>
  );
}
