"use client";

import { type ItemDTO } from "@/app/actions";
import { slotFor, stockTier, type Tier } from "@/lib/i18n";
import { imageForSlot } from "@/lib/slot-images";

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
  const image = imageForSlot(item.slot);

  return (
    <button
      type="button"
      onClick={() => onClick(item)}
      aria-label={`${item.name}, ${item.count} ${item.unit}`}
      className={[
        "relative flex min-h-0 flex-col gap-[2px] overflow-hidden rounded-[6px] border text-left",
        "px-2 py-2 sm:px-[clamp(5px,0.7vw,10px)] sm:py-[clamp(3px,0.55vh,7px)]",
        "shadow-[var(--kiosk-shadow-sm)] transition-all duration-100",
        "hover:-translate-y-px hover:border-[var(--kiosk-line-3)] hover:shadow-[var(--kiosk-shadow)]",
        "active:translate-y-0",
        s.card,
      ].join(" ")}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 h-full w-2.5 border-l border-[rgba(26,26,23,0.04)] sm:w-[clamp(10px,1.5vw,22px)]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, rgba(26,26,23,0.025) 0 2px, transparent 2px 8px)",
        }}
      />
      <div className="relative z-[1] mr-2.5 flex min-h-0 flex-1 items-start gap-1 sm:mr-[clamp(8px,1.2vw,14px)] sm:gap-1.5">
        {image && (
          <img
            src={image}
            alt=""
            aria-hidden
            className="h-6 w-6 shrink-0 rounded-[3px] border border-[var(--kiosk-line)] bg-white object-cover sm:h-[clamp(18px,2.6vh,26px)] sm:w-[clamp(18px,2.6vh,26px)]"
          />
        )}
        <span className="mono mt-[1px] shrink-0 rounded-[3px] border border-[var(--kiosk-line)] bg-[var(--kiosk-surface-2)] px-1 py-[1px] text-[9px] leading-tight tracking-[0.05em] text-[var(--kiosk-ink-soft)] sm:text-[clamp(7.5px,0.95vh,9.5px)]">
          {slot}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-[1px] overflow-hidden">
          <span
            className="overflow-hidden text-[12px] font-medium leading-[1.12] tracking-[-0.005em] text-[var(--kiosk-ink)] sm:text-[clamp(9.5px,1.3vh,13px)]"
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
            <span className="mono truncate text-[9px] uppercase tracking-[0.08em] text-[var(--kiosk-ink-dim)] sm:text-[clamp(7px,0.85vh,9px)]">
              {item.code}
            </span>
          )}
        </span>
        <span
          className={`mt-[5px] block h-[6px] w-[6px] shrink-0 rounded-full ${s.dot}`}
        />
      </div>
      <div className="relative z-[1] mt-auto flex items-baseline gap-[3px]">
        <span
          className={`mono text-[20px] font-medium leading-none tracking-[-0.03em] sm:text-[clamp(14px,2.2vh,20px)] ${s.count}`}
        >
          {item.count}
        </span>
        <span className="mono text-[10px] tracking-[0.02em] text-[var(--kiosk-ink-soft)] sm:text-[clamp(7.5px,1vh,10px)]">
          {item.unit}
        </span>
      </div>
    </button>
  );
}
