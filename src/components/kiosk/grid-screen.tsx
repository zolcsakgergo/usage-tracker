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
      className={`min-w-[60px] rounded-[6px] border px-2.5 py-1.5 text-center ${toneStyle}`}
    >
      <div className="mono v text-[clamp(13px,2.1vh,17px)] font-medium leading-[1.1] tracking-[-0.02em] text-[var(--kiosk-ink)]">
        {value}
      </div>
      <div className="mono mt-[2px] text-[clamp(8px,1.1vh,10px)] uppercase tracking-[0.1em] text-[var(--kiosk-ink-soft)]">
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
    <div className="relative z-[1] flex h-screen flex-col">
      <header className="flex items-center justify-between gap-3 border-b border-[var(--kiosk-line)] bg-[var(--kiosk-surface)] px-3 py-2 md:px-6 md:py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="relative grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--kiosk-ink)]">
            <span className="absolute inset-1 rounded-[5px] border border-[rgba(244,243,238,0.18)]" />
            <span className="h-3 w-3 rounded-[2px] bg-[var(--kiosk-bg)]" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-[clamp(14px,2.1vh,18px)] font-semibold tracking-[-0.012em] text-[var(--kiosk-ink)]">
              {T.appTitle}
            </div>
            <div className="hidden text-[clamp(10px,1.4vh,12px)] text-[var(--kiosk-ink-soft)] sm:block">
              {T.appSub}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2">
          <Stat label={T.inStock} value={total} />
          <Stat label={T.low} value={lowCount} tone={lowCount ? "warn" : null} />
          <Stat label={T.empty} value={empty} tone={empty ? "bad" : null} />
          <button
            type="button"
            onClick={onAdmin}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-[6px] bg-[var(--kiosk-ink)] px-3 py-2 text-[clamp(11px,1.5vh,13px)] font-medium tracking-[0.005em] text-[var(--kiosk-bg)] transition hover:bg-[var(--kiosk-ink-2)] active:translate-y-px md:px-4 md:py-2.5"
          >
            <Lock size={16} strokeWidth={1.8} />
            <span className="hidden sm:inline">{T.admin}</span>
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 gap-1.5 px-2 pb-1.5 pt-2 md:gap-2.5 md:px-6 md:pt-3">
        <div className="mono flex w-3.5 flex-col pt-[20px] text-[clamp(8px,1vh,11px)] text-[var(--kiosk-ink-dim)] md:w-5">
          {["A", "B", "C", "D", "E", "F", "G", "H"].map((l) => (
            <div key={l} className="grid flex-1 place-items-center">
              {l}
            </div>
          ))}
        </div>
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="mono grid h-[18px] grid-cols-6 gap-1.5 text-[clamp(8px,1vh,11px)] text-[var(--kiosk-ink-dim)] md:gap-2.5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="grid place-items-center">
                {n}
              </div>
            ))}
          </div>
          <div className="grid min-h-0 flex-1 grid-cols-6 grid-rows-8 gap-1.5 md:gap-2.5">
            {items.map((it) => (
              <Compartment key={it.id} item={it} onClick={onPick} />
            ))}
          </div>
        </div>
      </div>

      <footer className="flex shrink-0 justify-between border-t border-[var(--kiosk-line)] bg-[var(--kiosk-surface)] px-3 py-1.5 text-[clamp(9px,1.2vh,11.5px)] text-[var(--kiosk-ink-soft)] md:px-6 md:py-2">
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
