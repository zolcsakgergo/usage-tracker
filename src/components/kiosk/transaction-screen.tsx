"use client";

import { X } from "lucide-react";
import { T, slotFor, stockTier } from "@/lib/i18n";
import { type ItemDTO, type UserDTO } from "@/app/actions";

export type SessionTx = {
  id: number;
  ts: number;
  type: "take" | "return";
};

type Props = {
  item: ItemDTO;
  user: UserDTO;
  sessionTx: SessionTx[];
  onPlus: () => void;
  onMinus: () => void;
  onDone: () => void;
};

export function TransactionScreen({ item, user, sessionTx, onPlus, onMinus, onDone }: Props) {
  const tier = stockTier(item.count, item.low);
  const cannotTake = item.count <= 0;
  const onhandColor =
    tier === "low"
      ? "text-[var(--kiosk-amber)]"
      : tier === "empty"
      ? "text-[var(--kiosk-red)]"
      : "text-[var(--kiosk-ink)]";

  return (
    <div className="relative z-[1] flex h-screen flex-col" style={{ background: "var(--kiosk-bg)" }}>
      <button
        type="button"
        onClick={onDone}
        aria-label={T.done}
        className="absolute right-[22px] top-[20px] z-10 grid h-12 w-12 place-items-center rounded-[6px] border border-[var(--kiosk-line)] bg-[var(--kiosk-surface)] text-[var(--kiosk-ink-mute)] shadow-[var(--kiosk-shadow-sm)] transition hover:border-[var(--kiosk-line-3)] hover:text-[var(--kiosk-ink)] active:scale-95"
      >
        <X size={22} strokeWidth={2} />
      </button>

      <div className="mx-auto flex w-full max-w-[820px] flex-1 flex-col items-center justify-center gap-[clamp(12px,2.2vh,22px)] px-[clamp(16px,3vw,56px)] pb-[clamp(16px,3vh,36px)] pt-[clamp(20px,4vh,48px)]">
        <div className="text-center">
          <div className="mono text-[clamp(9px,1.3vh,11px)] uppercase tracking-[0.14em] text-[var(--kiosk-ink-soft)]">
            {T.compartment} · {slotFor(item.slot)}
          </div>
          <div className="mt-1 text-[clamp(22px,3.6vh,34px)] font-medium tracking-[-0.022em] text-[var(--kiosk-ink)]">
            {T.hello}, {user.name.split(" ")[0]}
          </div>
        </div>

        <div className="flex w-full flex-col gap-[clamp(14px,2.4vh,26px)] rounded-[10px] border border-[var(--kiosk-line)] bg-[var(--kiosk-surface)] px-[clamp(16px,2.4vw,32px)] pb-[clamp(14px,2.4vh,26px)] pt-[clamp(14px,2.4vh,28px)] shadow-[var(--kiosk-shadow)]">
          <div className="flex items-end justify-between gap-4 border-b border-[var(--kiosk-line)] pb-[clamp(10px,1.6vh,20px)]">
            <div className="min-w-0">
              <div className="truncate text-[clamp(18px,2.8vh,28px)] font-medium tracking-[-0.018em] text-[var(--kiosk-ink)]">
                {item.name}
              </div>
              {item.code && (
                <div className="mono mt-0.5 text-[clamp(10px,1.4vh,12px)] uppercase tracking-[0.08em] text-[var(--kiosk-ink-dim)]">
                  {item.code}
                </div>
              )}
              <div className="mono mt-1.5 text-[clamp(10px,1.4vh,12px)] uppercase tracking-[0.1em] text-[var(--kiosk-ink-soft)]">
                {user.role}
              </div>
            </div>
            <div className="text-right">
              <div
                className={`mono text-[clamp(24px,4.2vh,36px)] leading-none tracking-[-0.028em] ${onhandColor}`}
              >
                {item.count}
              </div>
              <div className="mono mt-1.5 text-[clamp(9px,1.3vh,11px)] uppercase tracking-[0.1em] text-[var(--kiosk-ink-soft)]">
                {item.unit} {T.onHand}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-[clamp(8px,1.5vw,14px)]">
            <button
              type="button"
              onClick={() => !cannotTake && onMinus()}
              disabled={cannotTake}
              className="flex h-[clamp(96px,15vh,148px)] flex-col items-center justify-center gap-1 rounded-[10px] border border-[#e0c5bc] bg-gradient-to-b from-white to-[#faece8] shadow-[var(--kiosk-shadow-sm)] transition hover:-translate-y-px hover:border-[var(--kiosk-red)] hover:shadow-[var(--kiosk-shadow)] active:translate-y-px disabled:pointer-events-none disabled:opacity-35"
            >
              <div className="mono text-[clamp(36px,6.5vh,56px)] font-medium leading-none tracking-[-0.03em] text-[var(--kiosk-red)]">
                −1
              </div>
              <div className="mono text-[clamp(11px,1.6vh,14px)] uppercase tracking-[0.12em] text-[var(--kiosk-ink-mute)]">
                {T.takeOut}
              </div>
            </button>
            <button
              type="button"
              onClick={onPlus}
              className="flex h-[clamp(96px,15vh,148px)] flex-col items-center justify-center gap-1 rounded-[10px] border border-[#b9d2bf] bg-gradient-to-b from-white to-[#e5eee5] shadow-[var(--kiosk-shadow-sm)] transition hover:-translate-y-px hover:border-[var(--kiosk-green)] hover:shadow-[var(--kiosk-shadow)] active:translate-y-px"
            >
              <div className="mono text-[clamp(36px,6.5vh,56px)] font-medium leading-none tracking-[-0.03em] text-[var(--kiosk-green)]">
                +1
              </div>
              <div className="mono text-[clamp(11px,1.6vh,14px)] uppercase tracking-[0.12em] text-[var(--kiosk-ink-mute)]">
                {T.putBack}
              </div>
            </button>
          </div>

          {sessionTx.length > 0 && (
            <div className="rounded-[6px] border border-dashed border-[var(--kiosk-line-2)] bg-[var(--kiosk-surface-2)] px-[18px] py-3.5">
              <div className="flex items-center justify-between border-b border-dashed border-[var(--kiosk-line-2)] pb-2">
                <span className="mono text-[10.5px] uppercase tracking-[0.14em] text-[var(--kiosk-ink-soft)]">
                  {T.sessionTx}
                </span>
                <span className="mono text-[12px] text-[var(--kiosk-ink)]">{sessionTx.length}</span>
              </div>
              <div className="mt-1.5 flex flex-col">
                {sessionTx.slice(-6).reverse().map((tx) => (
                  <div key={tx.id} className="flex justify-between py-1.5 text-[13px]">
                    <span
                      className={`mono font-medium ${
                        tx.type === "take" ? "text-[var(--kiosk-red)]" : "text-[var(--kiosk-green)]"
                      }`}
                    >
                      {tx.type === "take" ? "−1" : "+1"}
                    </span>
                    <span className="mono text-[12px] text-[var(--kiosk-ink-soft)]">
                      {new Date(tx.ts).toLocaleTimeString("ro-RO", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onDone}
          className="h-[clamp(48px,7vh,68px)] w-full rounded-[10px] bg-[var(--kiosk-ink)] text-[clamp(13px,1.9vh,17px)] font-medium tracking-[0.005em] text-[var(--kiosk-bg)] transition hover:bg-[var(--kiosk-ink-2)] active:translate-y-px"
        >
          {T.done}
        </button>
      </div>
    </div>
  );
}
