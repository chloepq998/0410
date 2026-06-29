"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DailyTrendPoint } from "@/lib/ai/insights";

export default function TrendChart({ data }: { data: DailyTrendPoint[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v: string) => v.slice(5)} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Line type="monotone" dataKey="views" stroke="#7c3aed" name="조회수" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="reach" stroke="#22c55e" name="도달" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="engagement" stroke="#f59e0b" name="참여(좋아요+댓글+공유)" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
