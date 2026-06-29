"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { addSourceAction } from "@/lib/actions/sources";
import { classifySourceKind, getVideoDuration, validateSourceFile } from "@/lib/upload-validation";
import { Button, Card } from "@/components/ui";

type UploadStatus = "pending" | "uploading" | "done" | "error";

interface UploadItem {
  id: string;
  file: File;
  status: UploadStatus;
  progress: number;
  error?: string;
}

let itemSeq = 0;

export default function SourceUploadForm() {
  const router = useRouter();
  const [items, setItems] = useState<UploadItem[]>([]);

  function handleFilesSelected(fileList: FileList | null) {
    const files = Array.from(fileList ?? []);
    if (files.length === 0) return;

    const newItems: UploadItem[] = files.map((file) => {
      const error = validateSourceFile(file);
      return {
        id: `up_${++itemSeq}`,
        file,
        status: error ? "error" : "pending",
        progress: 0,
        error: error ?? undefined,
      };
    });

    setItems((prev) => [...prev, ...newItems]);
    newItems.filter((item) => item.status === "pending").forEach((item) => void uploadItem(item));
  }

  async function uploadItem(item: UploadItem) {
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, status: "uploading", progress: 0, error: undefined } : i))
    );
    try {
      const blob = await upload(item.file.name, item.file, {
        access: "public",
        handleUploadUrl: "/api/upload",
        multipart: true,
        onUploadProgress: (event) => {
          setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, progress: event.percentage } : i)));
        },
      });

      const durationSec = await getVideoDuration(item.file);

      await addSourceAction({
        name: item.file.name,
        kind: classifySourceKind(item.file),
        url: blob.url,
        sizeBytes: item.file.size,
        durationSec,
      });

      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: "done", progress: 100 } : i)));
      router.refresh();
    } catch (error) {
      const detail = error instanceof Error && error.message ? error.message : "알 수 없는 오류";
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, status: "error", error: `업로드에 실패했습니다: ${detail}` } : i
        )
      );
    }
  }

  function retry(id: string) {
    const item = items.find((i) => i.id === id);
    if (item) void uploadItem(item);
  }

  function dismiss(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <Card>
      <label className="block text-sm font-medium text-neutral-700">원본 영상/사진 업로드</label>
      <input
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={(e) => {
          handleFilesSelected(e.target.files);
          e.target.value = "";
        }}
        className="mt-1 block w-full text-sm text-neutral-600"
      />
      <p className="mt-1 text-xs text-neutral-400">MP4, MOV, AVI 영상 또는 이미지 파일, 최대 5GB까지 업로드할 수 있어요.</p>

      {items.length > 0 && (
        <ul className="mt-4 space-y-2">
          {items.map((item) => (
            <li key={item.id} className="rounded-lg border border-neutral-200 p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-neutral-700">{item.file.name}</span>
                {item.status === "done" && <span className="text-xs text-emerald-600">완료</span>}
                {item.status === "error" && (
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="secondary" onClick={() => retry(item.id)}>
                      재시도
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => dismiss(item.id)}>
                      닫기
                    </Button>
                  </div>
                )}
              </div>
              {item.status === "uploading" && (
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
                  <div className="h-full rounded-full bg-violet-600 transition-all" style={{ width: `${item.progress}%` }} />
                </div>
              )}
              {item.error && <p className="mt-1 text-xs text-red-600">{item.error}</p>}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
