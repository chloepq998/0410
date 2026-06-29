import { Badge, Button } from "@/components/ui";
import { selectTemplateAction } from "@/lib/actions/projects";
import { BGM_OPTIONS } from "@/lib/ai/bgm-options";
import type { Template } from "@/lib/types";

const COLOR_HEX: Record<string, string> = {
  베이지: "#E8DCC8",
  아이보리: "#FFFFF0",
  웜그레이: "#A8A296",
  옐로우: "#FFD93D",
  화이트: "#FFFFFF",
  네이비: "#1F2A44",
  그레이: "#9CA3AF",
  블랙: "#111111",
  "파스텔 핑크": "#FAD0E4",
  라벤더: "#C9B8E8",
  코랄: "#FF8C7A",
  민트: "#A8E6CF",
  스카이블루: "#87CEEB",
  퍼플: "#9B59B6",
  네온그린: "#39FF14",
  핑크: "#F699CD",
};

export default function TemplateCard({
  projectId,
  template,
  selected,
}: {
  projectId: string;
  template: Template;
  selected: boolean;
}) {
  const bgm = BGM_OPTIONS.find((b) => b.id === template.bgmId);

  return (
    <div className={`rounded-lg border p-4 ${selected ? "border-violet-500 bg-violet-50" : "border-neutral-200"}`}>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="rounded-full bg-neutral-800 px-2.5 py-0.5 text-xs text-white">{template.category}</span>
        <Badge>{template.mood}</Badge>
        <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs text-neutral-600">{template.lengthSec}초</span>
        <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs text-neutral-600">{template.hookType}</span>
      </div>

      <p className="mt-2 text-sm font-medium text-neutral-900">{template.name}</p>
      <p className="mt-1 text-xs text-neutral-500">{template.previewSummary}</p>

      <div className="mt-2 flex items-center gap-1.5">
        <span className="text-xs text-neutral-400">색감</span>
        <div className="flex gap-1">
          {template.colorTheme.map((c) => (
            <span
              key={c}
              title={c}
              className="h-3.5 w-3.5 rounded-full border border-neutral-200"
              style={{ backgroundColor: COLOR_HEX[c] ?? "#cccccc" }}
            />
          ))}
        </div>
        <span className="text-xs text-neutral-400">· {template.fontStyle}</span>
      </div>

      <div className="mt-3 rounded-lg bg-neutral-50 p-2.5 text-xs text-neutral-600">
        <p className="font-medium text-neutral-700">적용 시 변경되는 요소</p>
        <ul className="mt-1 space-y-0.5">
          <li>자막 스타일: {template.fontStyle}</li>
          <li>전환 효과: {template.elements.transition ? "있음" : "없음"}</li>
          <li>색감: {template.colorTheme.join(", ")}</li>
          <li>음악 분위기: {bgm ? `${bgm.mood} (${bgm.name}) · ${bgm.license}` : "기본"}</li>
        </ul>
      </div>

      <form action={selectTemplateAction.bind(null, projectId, template.id)} className="mt-3">
        <Button type="submit" variant={selected ? "secondary" : "primary"} className="w-full" disabled={selected}>
          {selected ? "적용됨" : "이 템플릿 적용"}
        </Button>
      </form>
    </div>
  );
}
