"use client";

import { Lock, LogOut, Search, X } from "lucide-react";
import { Compartment } from "./compartment";
import { T, slotFor, stockTier } from "@/lib/i18n";
import { type ItemDTO, type UserDTO } from "@/app/actions";
import { useEffect, useMemo, useState } from "react";

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
  activeUser,
  sessionRemaining,
  onEndSession,
}: {
  items: ItemDTO[];
  onPick: (item: ItemDTO) => void;
  onAdmin: () => void;
  activeUser?: UserDTO | null;
  sessionRemaining?: number | null;
  onEndSession?: () => void;
}) {
  const total = items.reduce((s, i) => s + i.count, 0);
  const lowCount = items.filter((i) => stockTier(i.count, i.low) === "low").length;
  const empty = items.filter((i) => stockTier(i.count, i.low) === "empty").length;

  const [now, setNow] = useState<Date | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => {
      const slot = slotFor(it.slot).toLowerCase();
      return (
        it.name.toLowerCase().includes(q) ||
        (it.code ?? "").toLowerCase().includes(q) ||
        slot.includes(q)
      );
    });
  }, [items, search]);

  return (
    <div className="relative z-[1] flex min-h-screen flex-col sm:h-screen">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-[var(--kiosk-line)] bg-[var(--kiosk-surface)] px-3 py-2 sm:static sm:gap-3 sm:py-1.5 md:px-6 md:py-2">
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

      {activeUser && (
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--kiosk-line)] bg-[var(--kiosk-accent-soft)]/40 px-3 py-2 sm:px-6">
          <div className="flex min-w-0 items-center gap-2 text-[var(--kiosk-ink)]">
            <span className="mono shrink-0 rounded-full bg-[var(--kiosk-ink)] px-2 py-[2px] text-[10px] uppercase tracking-[0.1em] text-[var(--kiosk-bg)]">
              Conectat
            </span>
            <span className="truncate text-[13px] font-medium">{activeUser.name}</span>
            {sessionRemaining != null && (
              <span className="mono shrink-0 text-[11px] text-[var(--kiosk-ink-soft)]">
                · Auto-deconectare în {sessionRemaining}s
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onEndSession}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-[6px] border border-[var(--kiosk-line)] bg-[var(--kiosk-surface)] px-2.5 py-1 text-[11.5px] font-medium text-[var(--kiosk-ink-mute)] transition hover:border-[var(--kiosk-line-3)] hover:text-[var(--kiosk-ink)] active:translate-y-px"
          >
            <LogOut size={13} />
            Ieși
          </button>
        </div>
      )}

      <div className="flex shrink-0 gap-2 px-3 pt-1.5 sm:px-6 sm:pt-2">
        <div className="relative flex-1">
          <Search
            size={13}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--kiosk-ink-soft)]"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Caută după nume, cod sau slot (ex. 10, M5, A1)"
            className="mono w-full rounded-[6px] border border-[var(--kiosk-line)] bg-[var(--kiosk-surface)] py-1 pl-8 pr-8 text-[12px] text-[var(--kiosk-ink)] placeholder:text-[var(--kiosk-ink-dim)] focus:border-[var(--kiosk-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--kiosk-accent-soft)]"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 grid h-5 w-5 -translate-y-1/2 place-items-center rounded-full text-[var(--kiosk-ink-soft)] hover:bg-[var(--kiosk-bg-2)] hover:text-[var(--kiosk-ink)]"
              aria-label="Șterge căutarea"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 gap-1.5 px-2 pb-2 pt-2 sm:gap-1.5 sm:px-2 sm:pb-1 sm:pt-1.5 md:px-5">
        {/* Row letters: hidden on phones */}
        <div className="mono hidden w-3.5 flex-col pt-[20px] text-[clamp(8px,1vh,11px)] text-[var(--kiosk-ink-dim)] sm:flex md:w-5">
          {["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"].map(
            (l) => (
              <div key={l} className="grid flex-1 place-items-center">
                {l}
              </div>
            )
          )}
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
          {filtered.length === 0 ? (
            <div className="flex min-h-0 flex-1 items-center justify-center rounded-[8px] border border-dashed border-[var(--kiosk-line-2)] bg-[var(--kiosk-surface-2)] p-6 text-center text-[13px] text-[var(--kiosk-ink-soft)]">
              Niciun articol nu corespunde căutării „{search}".
            </div>
          ) : (
            <div className="grid min-h-0 flex-1 grid-cols-3 gap-2 [grid-auto-rows:minmax(80px,1fr)] sm:grid-cols-6 sm:grid-rows-12 sm:gap-1 sm:[grid-auto-rows:auto] md:gap-1.5">
              {filtered.map((it) => (
                <Compartment key={it.id} item={it} onClick={onPick} />
              ))}
            </div>
          )}
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
