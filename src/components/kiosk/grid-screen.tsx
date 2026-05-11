"use client";

import { Lock } from "lucide-react";
import { Compartment } from "./compartment";
import { T, stockTier } from "@/lib/i18n";
import { type ItemDTO } from "@/app/actions";
import { useEffect, useState } from "react";

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "warn" | "bad" | null;
}) {
  const toneStyle =
    tone === "warn"
      ? "bg-[var(--kiosk-amber-soft)] border-[#e6d4a2] [&_.v]:text-[var(--kiosk-amber)]"
      : tone === "bad"
      ? "bg-[var(--kiosk-red-soft)] border-[#e7c4bc] [&_.v]:text-[var(--kiosk-red)]"
      : "bg-[var(--kiosk-surface-2)] border-[var(--kiosk-line)]";

  return (
    <div
      className={`min-w-[48px] rounded-[6px] border px-2 py-1 text-center sm:min-w-[60px] sm:px-2.5 sm:py-1.5 ${toneStyle}`}
    >
      <div className="mono v text-[14px] font-medium leading-[1.1] tracking-[-0.02em] text-[var(--kiosk-ink)] sm:text-[clamp(13px,2.1vh,17px)]">
        {value}
      </div>
      <div className="mono mt-[2px] text-[8.5px] uppercase tracking-[0.1em] text-[var(--kiosk-ink-soft)] sm:text-[clamp(8px,1.1vh,10px)]">
        {label}
      </div>
    </div>
  );
}

export function GridScreen({
  items,
  onPick,
  onAdmin,
}: {
  items: ItemDTO[];
  onPick: (item: ItemDTO) => void;
  onAdmin: () => void;
}) {
  const total = items.reduce((s, i) => s + i.count, 0);
  const lowCount = items.filter((i) => stockTier(i.count, i.low) === "low").length;
  const empty = items.filter((i) => stockTier(i.count, i.low) === "empty").length;

  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative z-[1] flex min-h-screen flex-col sm:h-screen">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-[var(--kiosk-line)] bg-[var(--kiosk-surface)] px-3 py-2 sm:static sm:gap-3 md:px-6 md:py-3">
        <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
          <div className="relative grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--kiosk-ink)] sm:h-9 sm:w-9">
            <span className="absolute inset-1 rounded-[5px] border border-[rgba(244,243,238,0.18)]" />
            <span className="h-2.5 w-2.5 rounded-[2px] bg-[var(--kiosk-bg)] sm:h-3 sm:w-3" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-semibold tracking-[-0.012em] text-[var(--kiosk-ink)] sm:text-[clamp(14px,2.1vh,18px)]">
              {T.appTitle}
            </div>
            <div className="hidden text-[clamp(10px,1.4vh,12px)] text-[var(--kiosk-ink-soft)] sm:block">
              {T.appSub}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Stat label={T.inStock} value={total} />
          <Stat label={T.low} value={lowCount} tone={lowCount ? "warn" : null} />
          <Stat label={T.empty} value={empty} tone={empty ? "bad" : null} />
          <button
            type="button"
            onClick={onAdmin}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-[6px] bg-[var(--kiosk-ink)] px-2.5 py-1.5 text-[11px] font-medium tracking-[0.005em] text-[var(--kiosk-bg)] transition hover:bg-[var(--kiosk-ink-2)] active:translate-y-px sm:px-3 sm:py-2 sm:text-[clamp(11px,1.5vh,13px)] md:px-4 md:py-2.5"
            aria-label={T.admin}
          >
            <Lock size={14} strokeWidth={1.8} />
            <span className="hidden sm:inline">{T.admin}</span>
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 gap-1.5 px-2 pb-2 pt-2 sm:gap-2.5 sm:px-2 sm:pb-1.5 md:px-6 md:pt-3">
        {/* Row letters: hidden on phones */}
        <div className="mono hidden w-3.5 flex-col pt-[20px] text-[clamp(8px,1vh,11px)] text-[var(--kiosk-ink-dim)] sm:flex md:w-5">
          {["A", "B", "C", "D", "E", "F", "G", "H"].map((l) => (
            <div key={l} className="grid flex-1 place-items-center">
              {l}
            </div>
          ))}
        </div>
        <div className="flex min-h-0 flex-1 flex-col">
          {/* Column numbers: hidden on phones */}
          <div className="mono hidden h-[18px] grid-cols-6 gap-1.5 text-[clamp(8px,1vh,11px)] text-[var(--kiosk-ink-dim)] sm:grid md:gap-2.5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="grid place-items-center">
                {n}
              </div>
            ))}
          </div>
          {/* Phone: 3 cols × auto rows (scrollable). sm+: 6 × 8 fit-to-viewport. */}
          <div className="grid min-h-0 flex-1 grid-cols-3 gap-2 [grid-auto-rows:minmax(86px,1fr)] sm:grid-cols-6 sm:grid-rows-8 sm:gap-1.5 sm:[grid-auto-rows:auto] md:gap-2.5">
            {items.map((it) => (
              <Compartment key={it.id} item={it} onClick={onPick} />
            ))}
          </div>
        </div>
      </div>

      <footer className="hidden shrink-0 justify-between border-t border-[var(--kiosk-line)] bg-[var(--kiosk-surface)] px-3 py-1.5 text-[clamp(9px,1.2vh,11.5px)] text-[var(--kiosk-ink-soft)] sm:flex md:px-6 md:py-2">
        <span className="truncate">{T.footer}</span>
        <span className="mono shrink-0">
          {now
            ? `${now.toLocaleDateString("ro-RO")} · ${now.toLocaleTimeString("ro-RO", {
                hour: "2-digit",
                minute: "2-digit",
              })}`
            : ""}
        </span>
      </footer>
    </div>
  );
}
