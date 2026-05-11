"use client";

import { useEffect, useState, useTransition } from "react";
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
  PackageMinus,
  RefreshCw,
} from "lucide-react";
import { getDashboardStats, type DashboardStats } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function Kpi({
  label,
  value,
  hint,
  tone,
  Icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "warn" | "bad" | null;
  Icon: React.ElementType;
}) {
  const toneStyle =
    tone === "warn"
      ? "border-[#e6d4a2] bg-[var(--kiosk-amber-soft)]"
      : tone === "bad"
      ? "border-[#e7c4bc] bg-[var(--kiosk-red-soft)]"
      : "border-[var(--kiosk-line)] bg-[var(--kiosk-surface)]";

  const valueColor =
    tone === "warn"
      ? "text-[var(--kiosk-amber)]"
      : tone === "bad"
      ? "text-[var(--kiosk-red)]"
      : "text-[var(--kiosk-ink)]";

  return (
    <Card className={`gap-2 rounded-[10px] border shadow-[var(--kiosk-shadow-sm)] ${toneStyle}`}>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div>
          <div className="mono text-[10.5px] uppercase tracking-[0.14em] text-[var(--kiosk-ink-soft)]">
            {label}
          </div>
          <div className={`mono mt-2 text-[32px] font-medium leading-none tracking-[-0.025em] ${valueColor}`}>
            {value}
          </div>
          {hint && (
            <div className="mt-2 text-[12px] text-[var(--kiosk-ink-mute)]">{hint}</div>
          )}
        </div>
        <Icon className="h-5 w-5 text-[var(--kiosk-ink-soft)]" />
      </CardContent>
    </Card>
  );
}

function Sparkline({ daily }: { daily: DashboardStats["daily"] }) {
  const max = Math.max(1, ...daily.map((d) => d.takes + d.returns));
  const totalActivity = daily.reduce((s, d) => s + d.takes + d.returns, 0);

  if (totalActivity === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-[6px] border border-dashed border-[var(--kiosk-line-2)] bg-[var(--kiosk-surface-2)] text-[12px] text-[var(--kiosk-ink-soft)]">
        Nicio activitate în ultimele 14 zile
      </div>
    );
  }

  return (
    <div className="flex h-32 items-stretch gap-1.5 pt-1">
      {daily.map((d) => {
        const total = d.takes + d.returns;
        const totalH = (total / max) * 100;
        const takeH = (d.takes / max) * 100;
        return (
          <div
            key={d.day}
            className="group relative flex h-full flex-1 flex-col items-center gap-1.5"
          >
            <div className="relative flex w-full flex-1 items-end overflow-visible">
              {/* Hover tooltip */}
              <div
                role="tooltip"
                className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 hidden -translate-x-1/2 whitespace-nowrap rounded-[6px] border border-[var(--kiosk-line)] bg-[var(--kiosk-surface)] px-2.5 py-1.5 text-[11px] text-[var(--kiosk-ink)] shadow-[var(--kiosk-shadow)] group-hover:block"
              >
                <div className="mono mb-0.5 text-[10px] uppercase tracking-[0.1em] text-[var(--kiosk-ink-soft)]">
                  {d.day}
                </div>
                <div className="mono flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-sm bg-[var(--kiosk-red)]/85" />
                    {d.takes}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-sm bg-[var(--kiosk-green)]/70" />
                    {d.returns}
                  </span>
                  <span className="text-[var(--kiosk-ink-soft)]">·</span>
                  <span>{total}</span>
                </div>
              </div>
              {/* Bar */}
              <div
                className="absolute bottom-0 w-full rounded-t-[3px] bg-[var(--kiosk-green)]/70 transition group-hover:bg-[var(--kiosk-green)]"
                style={{ height: `${totalH}%` }}
              />
              <div
                className="absolute bottom-0 w-full rounded-t-[3px] bg-[var(--kiosk-red)]/85 transition group-hover:bg-[var(--kiosk-red)]"
                style={{ height: `${takeH}%` }}
              />
              {/* Total label above bar — visible only when there's activity */}
              {total > 0 && (
                <div
                  className="mono pointer-events-none absolute left-1/2 -translate-x-1/2 -translate-y-[14px] text-[9px] font-medium text-[var(--kiosk-ink-mute)] opacity-0 transition group-hover:opacity-0 sm:opacity-100"
                  style={{ bottom: `${totalH}%` }}
                >
                  {total}
                </div>
              )}
            </div>
            <div className="mono text-[9px] text-[var(--kiosk-ink-soft)] group-hover:text-[var(--kiosk-ink)]">
              {d.day.slice(-2)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function DashboardTab({ stats: initialStats }: { stats: DashboardStats }) {
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const data = await getDashboardStats();
      if (!cancelled) setStats(data);
    }
    load();
    const id = setInterval(load, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  function refreshNow() {
    startTransition(async () => {
      const data = await getDashboardStats();
      setStats(data);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-end">
        <Button variant="outline" size="sm" onClick={refreshNow} disabled={pending}>
          <RefreshCw className={`mr-1.5 h-4 w-4 ${pending ? "animate-spin" : ""}`} />
          Reîmprospătează
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi label="Stoc total" value={stats.totalStock} hint={`${stats.itemCount} articole`} Icon={Boxes} />
        <Kpi
          label="Aproape gol"
          value={stats.lowCount}
          tone={stats.lowCount ? "warn" : null}
          Icon={AlertTriangle}
        />
        <Kpi
          label="Gol"
          value={stats.emptyCount}
          tone={stats.emptyCount ? "bad" : null}
          Icon={PackageMinus}
        />
        <Kpi
          label="Tranzacții · 7 zile"
          value={stats.txLast7d}
          hint={`${stats.txLast14d} în 14 zile`}
          Icon={ArrowDownToLine}
        />
      </div>

      <Card className="rounded-[10px] border-[var(--kiosk-line)] bg-[var(--kiosk-surface)]">
        <CardContent className="flex flex-col gap-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="mono text-[10.5px] uppercase tracking-[0.14em] text-[var(--kiosk-ink-soft)]">
                Activitate · 14 zile
              </div>
              <div className="mt-1 text-[18px] font-medium">Tranzacții pe zi</div>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-[var(--kiosk-ink-soft)]">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-[var(--kiosk-red)]/85" />
                Scoateri
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-[var(--kiosk-green)]/70" />
                Returnări
              </span>
            </div>
          </div>
          <Sparkline daily={stats.daily} />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-[10px] border-[var(--kiosk-line)] bg-[var(--kiosk-surface)]">
          <CardContent className="flex flex-col gap-3 p-6">
            <div className="mono text-[10.5px] uppercase tracking-[0.14em] text-[var(--kiosk-ink-soft)]">
              Top utilizatori · 14 zile
            </div>
            <ul className="flex flex-col divide-y divide-[var(--kiosk-line)]">
              {stats.topUsers.length === 0 && (
                <li className="py-2 text-[13px] text-[var(--kiosk-ink-soft)]">Nicio activitate</li>
              )}
              {stats.topUsers.map((u, i) => (
                <li key={i} className="flex items-center justify-between py-2 text-[14px]">
                  <span>{u.userName}</span>
                  <span className="mono text-[var(--kiosk-ink-soft)]">{u.count}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="rounded-[10px] border-[var(--kiosk-line)] bg-[var(--kiosk-surface)]">
          <CardContent className="flex flex-col gap-3 p-6">
            <div className="mono text-[10.5px] uppercase tracking-[0.14em] text-[var(--kiosk-ink-soft)]">
              Top articole · 14 zile
            </div>
            <ul className="flex flex-col divide-y divide-[var(--kiosk-line)]">
              {stats.topItems.length === 0 && (
                <li className="py-2 text-[13px] text-[var(--kiosk-ink-soft)]">Nicio activitate</li>
              )}
              {stats.topItems.map((it, i) => (
                <li key={i} className="flex items-center justify-between py-2 text-[14px]">
                  <span>{it.itemName}</span>
                  <span className="mono text-[var(--kiosk-ink-soft)]">{it.count}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {stats.lowItems.length > 0 && (
        <Card className="rounded-[10px] border-[var(--kiosk-line)] bg-[var(--kiosk-surface)]">
          <CardContent className="flex flex-col gap-3 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="mono text-[10.5px] uppercase tracking-[0.14em] text-[var(--kiosk-ink-soft)]">
                  Alerte stoc
                </div>
                <div className="mt-1 text-[18px] font-medium">
                  Reaprovizionare necesară · {stats.lowItems.length}
                </div>
              </div>
              <ArrowUpFromLine className="h-5 w-5 text-[var(--kiosk-amber)]" />
            </div>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {stats.lowItems.map((it) => (
                <div
                  key={it.id}
                  className={`flex items-center justify-between rounded-[6px] border px-3 py-2 text-[13px] ${
                    it.count === 0
                      ? "border-[#e7c4bc] bg-[var(--kiosk-red-soft)]"
                      : "border-[#e6d4a2] bg-[var(--kiosk-amber-soft)]"
                  }`}
                >
                  <span className="font-medium">{it.name}</span>
                  <span
                    className={`mono ${
                      it.count === 0 ? "text-[var(--kiosk-red)]" : "text-[var(--kiosk-amber)]"
                    }`}
                  >
                    {it.count} / {it.low} {it.unit}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
