"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { renameProjectAction } from "@/lib/actions/projects";
import { Button } from "@/components/ui";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ProjectNameEditor({
  projectId,
  name,
  updatedAt,
}: {
  projectId: string;
  name: string;
  updatedAt: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const [saving, setSaving] = useState(false);

  async function save() {
    const trimmed = value.trim();
    if (!trimmed || trimmed === name) {
      setEditing(false);
      setValue(name);
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.set("name", trimmed);
      await renameProjectAction(projectId, formData);
      router.refresh();
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") {
              setValue(name);
              setEditing(false);
            }
          }}
          className="rounded-lg border border-neutral-300 px-2.5 py-1.5 text-2xl font-bold text-neutral-900"
        />
        <Button type="button" onClick={save} disabled={saving}>
          저장
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setValue(name);
            setEditing(false);
          }}
          disabled={saving}
        >
          취소
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <h1 className="text-2xl font-bold text-neutral-900">{name}</h1>
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="rounded-md px-2 py-1 text-xs text-neutral-500 hover:bg-neutral-100"
      >
        이름 변경
      </button>
      <span className="text-xs text-neutral-400">마지막 저장: {formatDateTime(updatedAt)}</span>
    </div>
  );
}
