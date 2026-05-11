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
    <div className="relative z-[1] flex h-screen flex-col" style={{ background: "var(--kiosk-bg)" }}>
      <button
        type="button"
        onClick={onCancel}
        aria-label={T.cancel}
        className="absolute right-[22px] top-[20px] z-10 grid h-12 w-12 place-items-center rounded-[6px] border border-[var(--kiosk-line)] bg-[var(--kiosk-surface)] text-[var(--kiosk-ink-mute)] shadow-[var(--kiosk-shadow-sm)] transition hover:border-[var(--kiosk-line-3)] hover:text-[var(--kiosk-ink)] active:scale-95"
      >
        <X size={22} strokeWidth={2} />
      </button>

      <div className="mx-auto grid w-full max-w-[1180px] flex-1 grid-cols-[1fr_440px] items-center gap-12 px-16 py-14">
        <div className="flex min-w-0 flex-col gap-6">
          {item ? (
            <div className="rounded-[10px] border border-[var(--kiosk-line)] bg-[var(--kiosk-surface)] px-6 py-[22px] shadow-[var(--kiosk-shadow-sm)]">
              <div className="mono text-[10.5px] uppercase tracking-[0.14em] text-[var(--kiosk-ink-soft)]">
                {T.compartment} · {slotFor(item.slot)}
              </div>
              <div className="mt-2 text-[28px] font-medium tracking-[-0.018em] text-[var(--kiosk-ink)]">
                {item.name}
              </div>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="mono text-[22px] tracking-[-0.02em] text-[var(--kiosk-ink)]">
                  {item.count}
                </span>
                <span className="text-[13px] text-[var(--kiosk-ink-soft)]">
                  {item.unit} {T.onHand}
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-[10px] border border-[var(--kiosk-ink)] bg-[var(--kiosk-surface)] px-6 py-[22px] shadow-[var(--kiosk-shadow-sm)]">
              <div className="mono text-[10.5px] uppercase tracking-[0.14em] text-[var(--kiosk-ink-soft)]">
                Acces restricționat
              </div>
              <div className="mt-2 text-[28px] font-medium tracking-[-0.018em] text-[var(--kiosk-ink)]">
                Panou Administrator
              </div>
              <div className="mt-1.5 text-[13px] text-[var(--kiosk-ink-soft)]">
                Doar utilizatori autorizați
              </div>
            </div>
          )}

          <div>
            <h1 className="text-[34px] font-medium tracking-[-0.02em] text-[var(--kiosk-ink)]">
              {title}
            </h1>
            <p className="mt-1.5 text-[14.5px] text-[var(--kiosk-ink-mute)]">{subtitle}</p>
          </div>

          <div className={`flex gap-3 ${shake ? "kiosk-shake" : ""}`}>
            {cells.map((on, i) => (
              <span
                key={i}
                className={[
                  "mono grid h-16 w-14 place-items-center rounded-[6px] border bg-[var(--kiosk-surface)] text-[28px] shadow-[var(--kiosk-shadow-sm)] transition",
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
            className="mono text-[13.5px] text-[var(--kiosk-red)]"
            style={{ visibility: errorTick > 0 && !shake ? "hidden" : errorTick > 0 ? "visible" : "hidden" }}
          >
            {T.badCode}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {(["1","2","3","4","5","6","7","8","9","C","0","⌫"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => press(k)}
              className={[
                "mono h-[88px] rounded-[10px] border border-[var(--kiosk-line)] bg-[var(--kiosk-surface)] text-[26px] shadow-[var(--kiosk-shadow-sm)] transition active:translate-y-px active:bg-[var(--kiosk-bg-2)] hover:border-[var(--kiosk-line-3)] hover:bg-[var(--kiosk-surface-2)]",
                k === "C" || k === "⌫" ? "text-[20px] text-[var(--kiosk-ink-mute)]" : "text-[var(--kiosk-ink)]",
              ].join(" ")}
            >
              {k}
            </button>
          ))}
          <button
            type="button"
            onClick={() => press("OK")}
            disabled={code.length < 2}
            className="col-span-3 h-[76px] rounded-[10px] border border-[var(--kiosk-ink)] bg-[var(--kiosk-ink)] text-[18px] font-medium tracking-[0.005em] text-[var(--kiosk-bg)] transition hover:bg-[var(--kiosk-ink-2)] active:translate-y-px disabled:pointer-events-none disabled:opacity-35"
          >
            {T.enter}
          </button>
        </div>
      </div>
    </div>
  );
}
