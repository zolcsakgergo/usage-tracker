"use client";

import { type ItemDTO } from "@/app/actions";
import { slotFor, stockTier, type Tier } from "@/lib/i18n";

const tierStyles: Record<Tier, { card: string; count: string; dot: string }> = {
  ok: {
    card: "bg-[var(--kiosk-surface)] border-[var(--kiosk-line)]",
    count: "text-[var(--kiosk-ink)]",
    dot: "bg-[var(--kiosk-green)]",
  },
  low: {
    card: "border-[#d9c490] bg-gradient-to-b from-[#fdf6e3] from-0% via-white via-[24%] to-white",
    count: "text-[var(--kiosk-amber)]",
    dot: "bg-[var(--kiosk-amber)]",
  },
  empty: {
    card: "border-[#d9b1a4] bg-gradient-to-b from-[#fae9e3] from-0% via-white via-[24%] to-white",
    count: "text-[var(--kiosk-red)]",
    dot: "bg-[var(--kiosk-red)]",
  },
};

export function Compartment({
  item,
  onClick,
}: {
  item: ItemDTO;
  onClick: (item: ItemDTO) => void;
}) {
  const tier = stockTier(item.count, item.low);
  const s = tierStyles[tier];
  const slot = slotFor(item.slot);

  return (
    <button
      type="button"
      onClick={() => onClick(item)}
      aria-label={`${item.name}, ${item.count} ${item.unit}`}
      className={[
        "relative flex min-h-0 flex-col gap-1 overflow-hidden rounded-[8px] border text-left",
        "px-[clamp(6px,1vw,12px)] py-[clamp(4px,0.8vh,10px)]",
        "shadow-[var(--kiosk-shadow-sm)] transition-all duration-100",
        "hover:-translate-y-px hover:border-[var(--kiosk-line-3)] hover:shadow-[var(--kiosk-shadow)]",
        "active:translate-y-0",
        s.card,
      ].join(" ")}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 h-full w-[clamp(14px,2vw,28px)] border-l border-[rgba(26,26,23,0.04)]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, rgba(26,26,23,0.025) 0 2px, transparent 2px 8px)",
        }}
      />
      <div className="relative z-[1] mr-[clamp(10px,1.5vw,18px)] flex min-h-0 flex-1 items-start gap-1.5">
        <span className="mono mt-[2px] shrink-0 rounded-[3px] border border-[var(--kiosk-line)] bg-[var(--kiosk-surface-2)] px-1 py-[1px] text-[clamp(8px,1.1vh,10.5px)] leading-tight tracking-[0.05em] text-[var(--kiosk-ink-soft)]">
          {slot}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-[1px] overflow-hidden">
          <span
            className="overflow-hidden text-[clamp(10px,1.55vh,15px)] font-medium leading-[1.15] tracking-[-0.005em] text-[var(--kiosk-ink)]"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              wordBreak: "break-word",
            }}
          >
            {item.name}
          </span>
          {item.code && (
            <span className="mono truncate text-[clamp(7.5px,0.95vh,9.5px)] uppercase tracking-[0.08em] text-[var(--kiosk-ink-dim)]">
              {item.code}
            </span>
          )}
        </span>
        <span
          className={`mt-[6px] block h-[6px] w-[6px] shrink-0 rounded-full ${s.dot}`}
        />
      </div>
      <div className="relative z-[1] mt-auto flex items-baseline gap-1">
        <span
          className={`mono text-[clamp(16px,2.8vh,24px)] font-medium leading-none tracking-[-0.03em] ${s.count}`}
        >
          {item.count}
        </span>
        <span className="mono text-[clamp(8px,1.2vh,11px)] tracking-[0.02em] text-[var(--kiosk-ink-soft)]">
          {item.unit}
        </span>
      </div>
    </button>
  );
}
