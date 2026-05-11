"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  exportMonthlyReport,
  getDashboardStats,
  type DashboardStats,
} from "@/app/actions";

export function UsageTab({ stats: initialStats }: { stats: DashboardStats }) {
  const [stats, setStats] = useState<DashboardStats>(initialStats);

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

  return (
    <div className="flex flex-col gap-6">
      <MonthlyReportCard />
      {inner(stats)}
    </div>
  );
}

function MonthlyReportCard() {
  const now = new Date();
  const months = useMemo(() => {
    const list: { value: string; label: string }[] = [];
    const fmt = new Intl.DateTimeFormat("ro-RO", {
      timeZone: "Europe/Bucharest",
      year: "numeric",
      month: "long",
    });
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 15);
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      list.push({ value, label: fmt.format(d) });
    }
    return list;
  }, [now]);

  const [picked, setPicked] = useState(months[0].value);
  const [pending, startTransition] = useTransition();

  function download() {
    startTransition(async () => {
      const [yearStr, monthStr] = picked.split("-");
      const year = Number(yearStr);
      const month = Number(monthStr);
      const csv = await exportMonthlyReport({ year, month });
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `raport-${picked}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  return (
    <Card className="rounded-[10px] border-[var(--kiosk-line)] bg-[var(--kiosk-surface)]">
      <CardContent className="flex flex-col gap-3 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mono text-[10.5px] uppercase tracking-[0.14em] text-[var(--kiosk-ink-soft)]">
              Raport lunar pentru comenzi
            </div>
            <div className="mt-1 text-[18px] font-medium">
              Export CSV · utilizare + istoric
            </div>
            <div className="mt-1 text-[13px] text-[var(--kiosk-ink-mute)]">
              Conține: pentru fiecare articol — scoateri, returnări, consum net,
              stoc curent, cod, cod contabilitate. Plus istoricul complet al
              tranzacțiilor din lună.
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={picked} onValueChange={(v) => v && setPicked(v)}>
            <SelectTrigger className="w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={download} disabled={pending}>
            <Download className="mr-1.5 h-4 w-4" />
            {pending ? "Se generează…" : "Descarcă CSV"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function inner(stats: DashboardStats) {
  const totalTakes = stats.daily.reduce((s, d) => s + d.takes, 0);
  const totalReturns = stats.daily.reduce((s, d) => s + d.returns, 0);

  return (
    <div className="flex flex-col gap-6">
      <Card className="rounded-[10px] border-[var(--kiosk-line)] bg-[var(--kiosk-surface)]">
        <CardContent className="flex flex-col gap-4 p-6">
          <div className="mono text-[10.5px] uppercase tracking-[0.14em] text-[var(--kiosk-ink-soft)]">
            Rezumat · 14 zile
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="mono text-[10px] uppercase tracking-[0.12em] text-[var(--kiosk-ink-soft)]">
                Scoateri
              </div>
              <div className="mono mt-1 text-[28px] font-medium tracking-[-0.02em] text-[var(--kiosk-red)]">
                {totalTakes}
              </div>
            </div>
            <div>
              <div className="mono text-[10px] uppercase tracking-[0.12em] text-[var(--kiosk-ink-soft)]">
                Returnări
              </div>
              <div className="mono mt-1 text-[28px] font-medium tracking-[-0.02em] text-[var(--kiosk-green)]">
                {totalReturns}
              </div>
            </div>
            <div>
              <div className="mono text-[10px] uppercase tracking-[0.12em] text-[var(--kiosk-ink-soft)]">
                Net consum
              </div>
              <div className="mono mt-1 text-[28px] font-medium tracking-[-0.02em]">
                {totalTakes - totalReturns}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-[10px] border-[var(--kiosk-line)] bg-[var(--kiosk-surface)]">
          <CardContent className="flex flex-col gap-3 p-6">
            <div className="mono text-[10.5px] uppercase tracking-[0.14em] text-[var(--kiosk-ink-soft)]">
              Cele mai utilizate articole
            </div>
            <UsageBars rows={stats.topItems.map((t) => ({ label: t.itemName, value: t.count }))} />
          </CardContent>
        </Card>
        <Card className="rounded-[10px] border-[var(--kiosk-line)] bg-[var(--kiosk-surface)]">
          <CardContent className="flex flex-col gap-3 p-6">
            <div className="mono text-[10.5px] uppercase tracking-[0.14em] text-[var(--kiosk-ink-soft)]">
              Cei mai activi utilizatori
            </div>
            <UsageBars
              rows={stats.topUsers.map((t) => ({ label: t.userName, value: t.count }))}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function UsageBars({ rows }: { rows: { label: string; value: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  if (rows.length === 0) {
    return <div className="text-[13px] text-[var(--kiosk-ink-soft)]">Nicio activitate</div>;
  }
  return (
    <div className="flex flex-col gap-2">
      {rows.map((r, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-40 truncate text-[13px]">{r.label}</div>
          <div className="relative h-5 flex-1 overflow-hidden rounded-[4px] bg-[var(--kiosk-bg-2)]">
            <div
              className="h-full bg-[var(--kiosk-accent)]"
              style={{ width: `${(r.value / max) * 100}%` }}
            />
          </div>
          <div className="mono w-12 text-right text-[12.5px] text-[var(--kiosk-ink-mute)]">
            {r.value}
          </div>
        </div>
      ))}
    </div>
  );
}
