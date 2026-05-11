"use client";

import { AlertTriangle, ArrowDownToLine, ArrowUpFromLine, Boxes, PackageMinus } from "lucide-react";
import { type DashboardStats } from "@/app/actions";
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
  return (
    <div className="flex h-32 items-end gap-1.5">
      {daily.map((d) => {
        const totalH = ((d.takes + d.returns) / max) * 100;
        const takeH = ((d.takes) / max) * 100;
        return (
          <div key={d.day} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="relative flex w-full flex-1 items-end">
              <div
                className="w-full rounded-t-[3px] bg-[var(--kiosk-green)]/70"
                style={{ height: `${totalH}%` }}
              />
              <div
                className="absolute bottom-0 w-full rounded-t-[3px] bg-[var(--kiosk-red)]/85"
                style={{ height: `${takeH}%` }}
              />
            </div>
            <div className="mono text-[9px] text-[var(--kiosk-ink-soft)]">
              {d.day.slice(-2)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function DashboardTab({ stats }: { stats: DashboardStats }) {
  return (
    <div className="flex flex-col gap-6">
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
