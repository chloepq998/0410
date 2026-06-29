import type { Draft, Template } from "@/lib/types";
import { getDraftLicenseSummary, LICENSE_WARNING_TEXT } from "@/lib/ai/license";
import { Badge } from "@/components/ui";

export default function LicenseInfoPanel({ draft, template }: { draft?: Draft; template?: Template }) {
  const items = getDraftLicenseSummary(draft, template);
  const hasRestricted = items.some((item) => item.license === "개인용만");

  if (items.length === 0) {
    return <p className="text-sm text-neutral-400">아직 적용된 음악/효과음/폰트 리소스가 없습니다.</p>;
  }

  return (
    <div className="space-y-3">
      {hasRestricted && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {LICENSE_WARNING_TEXT}
        </div>
      )}
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={`${item.kind}-${i}`} className="rounded-lg border border-neutral-200 px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-neutral-900">
                {item.kind} · {item.name}
              </p>
              <Badge>{item.license}</Badge>
            </div>
            <p className="mt-1 text-xs text-neutral-500">출처: {item.source}</p>
            <p className="mt-0.5 text-xs text-neutral-400">{item.licenseDetail}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
