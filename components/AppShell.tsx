"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "대시보드", icon: "🏠" },
  { href: "/projects", label: "콘텐츠 프로젝트", icon: "🎬" },
  { href: "/personalization", label: "개인화 학습", icon: "🧠" },
  { href: "/calendar", label: "기획 캘린더", icon: "🗓️" },
  { href: "/analytics", label: "성과 분석", icon: "📊" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden md:flex w-64 flex-col border-r border-neutral-200 bg-white px-4 py-6">
        <div className="mb-8 px-2">
          <p className="text-sm font-semibold text-violet-600">AI 숏폼 스튜디오</p>
          <p className="mt-1 text-xs text-neutral-500">핸드메이드 브랜드를 위한 콘텐츠 자동화</p>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active ? "bg-violet-50 text-violet-700" : "text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto px-2 pt-6 text-xs text-neutral-400">데모용 MVP · AI 응답은 모의 데이터입니다</div>
      </aside>
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3 md:hidden">
          <span className="text-sm font-semibold text-violet-600">AI 숏폼 스튜디오</span>
        </header>
        <main className="flex-1 bg-neutral-50 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
