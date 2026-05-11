"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { T, slotFor } from "@/lib/i18n";
import { type ItemDTO } from "@/app/actions";

type Props = {
  title: string;
  subtitle: string;
  item: ItemDTO | null;
  errorTick: number;
  onSubmit: (code: string) => void;
  onCancel: () => void;
};

export function Keypad({ title, subtitle, item, errorTick, onSubmit, onCancel }: Props) {
  const [code, setCode] = useState("");
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (errorTick > 0) {
      setShake(true);
      setCode("");
      const t = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(t);
    }
  }, [errorTick]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key >= "0" && e.key <= "9") press(e.key);
      else if (e.key === "Backspace") press("⌫");
      else if (e.key === "Enter") press("OK");
      else if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function press(k: string) {
    if (k === "C") {
      setCode("");
      return;
    }
    if (k === "⌫") {
      setCode((c) => c.slice(0, -1));
      return;
    }
    if (k === "OK") {
      if (code.length >= 2) onSubmit(code);
      return;
    }
    setCode((c) => (c.length < 8 ? c + k : c));
  }

  const cellCount = Math.max(4, code.length);
  const cells = Array.from({ length: cellCount }, (_, i) => i < code.length);

  return (
    <div className="relative z-[1] flex min-h-screen flex-col sm:h-screen" style={{ background: "var(--kiosk-bg)" }}>
      <button
        type="button"
        onClick={onCancel}
        aria-label={T.cancel}
        className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-[6px] border border-[var(--kiosk-line)] bg-[var(--kiosk-surface)] text-[var(--kiosk-ink-mute)] shadow-[var(--kiosk-shadow-sm)] transition hover:border-[var(--kiosk-line-3)] hover:text-[var(--kiosk-ink)] active:scale-95 sm:right-[22px] sm:top-[20px] sm:h-12 sm:w-12"
      >
        <X size={20} strokeWidth={2} className="sm:hidden" />
        <X size={22} strokeWidth={2} className="hidden sm:block" />
      </button>

      <div className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col items-stretch gap-4 px-4 py-4 sm:grid sm:grid-cols-[1fr_minmax(280px,42%)] sm:items-center sm:gap-[clamp(16px,3vw,48px)] sm:px-[clamp(16px,3vw,64px)] sm:py-[clamp(16px,3vh,56px)]">
        <div className="flex min-w-0 flex-col gap-[clamp(12px,2vh,24px)]">
          {item ? (
            <div className="rounded-[10px] border border-[var(--kiosk-line)] bg-[var(--kiosk-surface)] px-[clamp(14px,2vw,24px)] py-[clamp(12px,2vh,22px)] shadow-[var(--kiosk-shadow-sm)]">
              <div className="mono text-[clamp(9px,1.2vh,10.5px)] uppercase tracking-[0.14em] text-[var(--kiosk-ink-soft)]">
                {T.compartment} · {slotFor(item.slot)}
              </div>
              <div className="mt-2 text-[clamp(18px,2.8vh,28px)] font-medium tracking-[-0.018em] text-[var(--kiosk-ink)]">
                {item.name}
              </div>
              {item.code && (
                <div className="mono mt-0.5 text-[clamp(10px,1.3vh,11.5px)] uppercase tracking-[0.08em] text-[var(--kiosk-ink-dim)]">
                  {item.code}
                </div>
              )}
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="mono text-[clamp(15px,2.2vh,22px)] tracking-[-0.02em] text-[var(--kiosk-ink)]">
                  {item.count}
                </span>
                <span className="text-[clamp(11px,1.4vh,13px)] text-[var(--kiosk-ink-soft)]">
                  {item.unit} {T.onHand}
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-[10px] border border-[var(--kiosk-ink)] bg-[var(--kiosk-surface)] px-[clamp(14px,2vw,24px)] py-[clamp(12px,2vh,22px)] shadow-[var(--kiosk-shadow-sm)]">
              <div className="mono text-[clamp(9px,1.2vh,10.5px)] uppercase tracking-[0.14em] text-[var(--kiosk-ink-soft)]">
                Acces restricționat
              </div>
              <div className="mt-2 text-[clamp(18px,2.8vh,28px)] font-medium tracking-[-0.018em] text-[var(--kiosk-ink)]">
                Panou Administrator
              </div>
              <div className="mt-1.5 text-[clamp(11px,1.4vh,13px)] text-[var(--kiosk-ink-soft)]">
                Doar utilizatori autorizați
              </div>
            </div>
          )}

          <div>
            <h1 className="text-[clamp(22px,3.4vh,34px)] font-medium tracking-[-0.02em] text-[var(--kiosk-ink)]">
              {title}
            </h1>
            <p className="mt-1.5 text-[clamp(12px,1.6vh,14.5px)] text-[var(--kiosk-ink-mute)]">
              {subtitle}
            </p>
          </div>

          <div className={`flex gap-[clamp(6px,1vw,12px)] ${shake ? "kiosk-shake" : ""}`}>
            {cells.map((on, i) => (
              <span
                key={i}
                className={[
                  "mono grid place-items-center rounded-[6px] border bg-[var(--kiosk-surface)] shadow-[var(--kiosk-shadow-sm)] transition",
                  "h-[clamp(42px,6.5vh,64px)] w-[clamp(36px,5vw,56px)] text-[clamp(20px,3vh,28px)]",
                  on
                    ? "border-[var(--kiosk-accent)] text-[var(--kiosk-accent)] shadow-[0_0_0_3px_var(--kiosk-accent-soft)]"
                    : "border-[var(--kiosk-line)] text-[var(--kiosk-accent)]",
                ].join(" ")}
              >
                {on ? "•" : ""}
              </span>
            ))}
          </div>

          <div
            className="mono text-[clamp(11px,1.5vh,13.5px)] text-[var(--kiosk-red)]"
            style={{ visibility: errorTick > 0 && !shake ? "hidden" : errorTick > 0 ? "visible" : "hidden" }}
          >
            {T.badCode}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-[clamp(6px,1vh,10px)]">
          {(["1","2","3","4","5","6","7","8","9","C","0","⌫"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => press(k)}
              className={[
                "mono rounded-[10px] border border-[var(--kiosk-line)] bg-[var(--kiosk-surface)] shadow-[var(--kiosk-shadow-sm)] transition active:translate-y-px active:bg-[var(--kiosk-bg-2)] hover:border-[var(--kiosk-line-3)] hover:bg-[var(--kiosk-surface-2)]",
                "h-[clamp(54px,8vh,88px)] text-[clamp(18px,2.6vh,26px)]",
                k === "C" || k === "⌫" ? "text-[clamp(14px,2vh,20px)] text-[var(--kiosk-ink-mute)]" : "text-[var(--kiosk-ink)]",
              ].join(" ")}
            >
              {k}
            </button>
          ))}
          <button
            type="button"
            onClick={() => press("OK")}
            disabled={code.length < 2}
            className="col-span-3 h-[clamp(48px,7vh,76px)] rounded-[10px] border border-[var(--kiosk-ink)] bg-[var(--kiosk-ink)] text-[clamp(14px,2vh,18px)] font-medium tracking-[0.005em] text-[var(--kiosk-bg)] transition hover:bg-[var(--kiosk-ink-2)] active:translate-y-px disabled:pointer-events-none disabled:opacity-35"
          >
            {T.enter}
          </button>
        </div>
      </div>
    </div>
  );
}
