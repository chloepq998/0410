import { listSources } from "@/lib/store";
import { filterSourcesByLength, sortSourcesByDate, type LengthBucket, type SortOrder } from "@/lib/source-utils";
import SourceUploadForm from "@/components/SourceUploadForm";
import SourceFilters from "@/components/SourceFilters";
import SourceLibraryList from "@/components/SourceLibraryList";
import { SectionHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function SourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ length?: string; sort?: string }>;
}) {
  const { length, sort } = await searchParams;
  const sources = await listSources();

  const filtered = filterSourcesByLength(sources, length as LengthBucket | undefined);
  const sorted = sortSourcesByDate(filtered, (sort as SortOrder | undefined) ?? "newest");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">원본 소스</h1>
        <p className="mt-1 text-sm text-neutral-500">업로드한 원본 영상/사진을 한곳에서 관리하고 재사용하세요.</p>
      </div>

      <SourceUploadForm />

      <div>
        <SectionHeader title="업로드된 소스" description={`총 ${sources.length}개`} />
        <div className="mb-3">
          <SourceFilters length={length ?? ""} sort={sort ?? "newest"} />
        </div>
        <SourceLibraryList sources={sorted} />
      </div>
    </div>
  );
}
