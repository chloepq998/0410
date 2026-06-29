"use client";

import { useState } from "react";
import { submitFeedbackAction } from "@/lib/actions/projects";
import { Button } from "@/components/ui";

export default function FeedbackForm({ projectId }: { projectId: string }) {
  const [sentiment, setSentiment] = useState<"좋아요" | "별로예요">("좋아요");
  const action = submitFeedbackAction.bind(null, projectId);

  return (
    <form action={action} className="space-y-3">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setSentiment("좋아요")}
          className={`rounded-lg border px-3 py-1.5 text-sm ${
            sentiment === "좋아요" ? "border-violet-500 bg-violet-50 text-violet-700" : "border-neutral-300 text-neutral-600"
          }`}
        >
          👍 좋아요
        </button>
        <button
          type="button"
          onClick={() => setSentiment("별로예요")}
          className={`rounded-lg border px-3 py-1.5 text-sm ${
            sentiment === "별로예요" ? "border-violet-500 bg-violet-50 text-violet-700" : "border-neutral-300 text-neutral-600"
          }`}
        >
          👎 별로예요
        </button>
      </div>
      <input type="hidden" name="sentiment" value={sentiment} />
      {sentiment === "별로예요" && (
        <select name="reason" className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm" defaultValue="너무 과함">
          <option value="너무 과함">너무 과함</option>
          <option value="너무 밋밋함">너무 밋밋함</option>
          <option value="톤 불일치">톤 불일치</option>
        </select>
      )}
      <Button type="submit" variant="secondary">
        피드백 보내고 재추천받기
      </Button>
    </form>
  );
}
