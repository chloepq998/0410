export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-neutral-200 bg-white p-5 shadow-sm ${className}`}>{children}</div>;
}

export function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
      {description && <p className="mt-1 text-sm text-neutral-500">{description}</p>}
    </div>
  );
}

const BADGE_COLORS: Record<string, string> = {
  높음: "bg-rose-100 text-rose-700",
  중간: "bg-amber-100 text-amber-700",
  낮음: "bg-neutral-100 text-neutral-600",
  초안: "bg-neutral-100 text-neutral-600",
  수정중: "bg-amber-100 text-amber-700",
  완료: "bg-emerald-100 text-emerald-700",
  아이디어: "bg-neutral-100 text-neutral-600",
  제작중: "bg-amber-100 text-amber-700",
  게시완료: "bg-emerald-100 text-emerald-700",
};

export function Badge({ children }: { children: string }) {
  const cls = BADGE_COLORS[children] ?? "bg-violet-100 text-violet-700";
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>{children}</span>;
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" }) {
  const variants: Record<string, string> = {
    primary: "bg-violet-600 text-white hover:bg-violet-700",
    secondary: "bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition disabled:opacity-50 ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
