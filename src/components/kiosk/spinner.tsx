import { Loader2 } from "lucide-react";

export function Spinner({
  size = 32,
  label,
}: {
  size?: number;
  label?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 text-[var(--kiosk-ink-soft)]">
      <Loader2 size={size} strokeWidth={1.6} className="animate-spin" />
      {label && (
        <div className="mono text-[11px] uppercase tracking-[0.14em]">{label}</div>
      )}
    </div>
  );
}

export function FullscreenSpinner({ label }: { label?: string }) {
  return (
    <div
      className="relative z-[1] flex min-h-screen items-center justify-center"
      style={{ background: "var(--kiosk-bg)" }}
    >
      <Spinner size={36} label={label} />
    </div>
  );
}
