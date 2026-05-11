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
        "relative flex min-h-0 flex-col gap-1.5 overflow-hidden rounded-[10px] border px-3 py-2.5 text-left",
        "shadow-[var(--kiosk-shadow-sm)] transition-all duration-100",
        "hover:-translate-y-px hover:border-[var(--kiosk-line-3)] hover:shadow-[var(--kiosk-shadow)]",
        "active:translate-y-0",
        s.card,
      ].join(" ")}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 h-full w-[28px] border-l border-[rgba(26,26,23,0.04)]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, rgba(26,26,23,0.025) 0 2px, transparent 2px 8px)",
        }}
      />
      <div className="relative z-[1] mr-[18px] flex min-h-0 flex-1 items-start gap-2">
        <span className="mono mt-[3px] shrink-0 rounded-[4px] border border-[var(--kiosk-line)] bg-[var(--kiosk-surface-2)] px-1.5 py-[1px] text-[10.5px] tracking-[0.06em] text-[var(--kiosk-ink-soft)]">
          {slot}
        </span>
        <span
          className="min-w-0 flex-1 overflow-hidden text-[15px] font-medium leading-[1.18] tracking-[-0.005em] text-[var(--kiosk-ink)]"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            wordBreak: "break-word",
          }}
        >
          {item.name}
        </span>
        <span className={`mt-[7px] block h-[7px] w-[7px] shrink-0 rounded-full ${s.dot}`} />
      </div>
      <div className="relative z-[1] mt-auto flex items-baseline gap-[5px]">
        <span
          className={`mono text-[24px] font-medium leading-none tracking-[-0.03em] ${s.count}`}
        >
          {item.count}
        </span>
        <span className="mono text-[11px] tracking-[0.02em] text-[var(--kiosk-ink-soft)]">
          {item.unit}
        </span>
      </div>
    </button>
  );
}
