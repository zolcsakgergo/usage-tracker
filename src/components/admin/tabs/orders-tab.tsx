"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  getReorderSuggestions,
  type ReorderRow,
} from "@/app/actions";
import { slotFor } from "@/lib/i18n";

const URGENCY_LABEL: Record<ReorderRow["urgency"], string> = {
  critical: "Gol",
  low: "Aproape gol",
  watch: "Sub țintă",
  ok: "OK",
};

const URGENCY_STYLES: Record<ReorderRow["urgency"], string> = {
  critical: "border-[#e7c4bc] bg-[var(--kiosk-red-soft)] text-[var(--kiosk-red)]",
  low: "border-[#e6d4a2] bg-[var(--kiosk-amber-soft)] text-[var(--kiosk-amber)]",
  watch: "border-[var(--kiosk-line)] bg-[var(--kiosk-surface-2)] text-[var(--kiosk-ink-mute)]",
  ok: "border-[#b9d2bf] bg-[var(--kiosk-green-soft)] text-[var(--kiosk-green)]",
};

export function OrdersTab() {
  const [windowDays, setWindowDays] = useState(30);
  const [coverDays, setCoverDays] = useState(30);
  const [rows, setRows] = useState<ReorderRow[]>([]);
  const [pending, startTransition] = useTransition();
  const [showOnlyNeedsOrder, setShowOnlyNeedsOrder] = useState(true);

  function reload(wd = windowDays, cd = coverDays) {
    startTransition(async () => {
      const data = await getReorderSuggestions({
        windowDays: wd,
        coverDays: cd,
      });
      setRows(data);
    });
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visible = useMemo(
    () =>
      showOnlyNeedsOrder
        ? rows.filter((r) => r.suggestedOrder > 0 || r.urgency !== "ok")
        : rows,
    [rows, showOnlyNeedsOrder]
  );

  const totals = useMemo(() => {
    return {
      critical: rows.filter((r) => r.urgency === "critical").length,
      low: rows.filter((r) => r.urgency === "low").length,
      watch: rows.filter((r) => r.urgency === "watch").length,
      orderSum: rows.reduce((s, r) => s + r.suggestedOrder, 0),
    };
  }, [rows]);

  function exportCsv() {
    const header = [
      "Slot",
      "Nume",
      "Cod",
      "Cod Contabilitate",
      "Unitate",
      "Stoc curent",
      "Prag alarmă",
      `Scoateri ${windowDays}z`,
      "Medie/zi",
      "Zile rămase",
      `Comandă (${coverDays}z)`,
      "Urgență",
    ];
    const lines = [header.join(",")];
    for (const r of visible) {
      lines.push(
        [
          slotFor(r.slot),
          JSON.stringify(r.name),
          r.code ?? "",
          r.accountingCode ?? "",
          r.unit,
          r.count,
          r.low,
          r.takes,
          r.avgPerDay,
          r.daysRemaining ?? "",
          r.suggestedOrder,
          URGENCY_LABEL[r.urgency],
        ].join(",")
      );
    }
    const blob = new Blob(["﻿" + lines.join("\r\n") + "\r\n"], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `comenzi-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Card className="rounded-[10px] border-[var(--kiosk-line)] bg-[var(--kiosk-surface)]">
      <CardContent className="flex flex-col gap-4 p-6">
        <div>
          <div className="text-[16px] font-medium">Comenzi sugerate</div>
          <div className="mt-1 text-[12.5px] text-[var(--kiosk-ink-soft)]">
            Pe baza scoaterilor din ultimele {windowDays} zile, sugerează cât
            să comanzi pentru a acoperi următoarele {coverDays} zile. Sortat
            după urgență.
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Gol" value={totals.critical} tone="critical" />
          <Stat label="Aproape gol" value={totals.low} tone="low" />
          <Stat label="Sub țintă" value={totals.watch} tone="watch" />
          <Stat label="Total piese de comandat" value={totals.orderSum} />
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="windowDays" className="text-[11px] text-[var(--kiosk-ink-soft)]">
              Fereastră analiză (zile)
            </Label>
            <Input
              id="windowDays"
              type="number"
              min={7}
              max={180}
              value={windowDays}
              onChange={(e) => setWindowDays(Math.max(7, Number(e.target.value) || 30))}
              className="w-32"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="coverDays" className="text-[11px] text-[var(--kiosk-ink-soft)]">
              Acoperire țintă (zile)
            </Label>
            <Input
              id="coverDays"
              type="number"
              min={7}
              max={365}
              value={coverDays}
              onChange={(e) => setCoverDays(Math.max(7, Number(e.target.value) || 30))}
              className="w-32"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => reload(windowDays, coverDays)}
            disabled={pending}
          >
            <RefreshCw className={`mr-1.5 h-4 w-4 ${pending ? "animate-spin" : ""}`} />
            Recalculează
          </Button>
          <label className="ml-auto flex cursor-pointer items-center gap-2 text-[13px] text-[var(--kiosk-ink-mute)]">
            <input
              type="checkbox"
              checked={showOnlyNeedsOrder}
              onChange={(e) => setShowOnlyNeedsOrder(e.target.checked)}
              className="h-4 w-4 accent-[var(--kiosk-ink)]"
            />
            Doar articole de comandat
          </label>
          <Button variant="outline" onClick={exportCsv}>
            <Download className="mr-1.5 h-4 w-4" />
            CSV
          </Button>
        </div>

        <div className="overflow-hidden rounded-[6px] border border-[var(--kiosk-line)]">
          <Table>
            <TableHeader>
              <TableRow className="bg-[var(--kiosk-surface-2)]">
                <TableHead className="w-[70px]">Slot</TableHead>
                <TableHead>Nume</TableHead>
                <TableHead className="w-[120px]">Cod</TableHead>
                <TableHead className="w-[140px]">Cod Contabilitate</TableHead>
                <TableHead className="w-[80px] text-right">Stoc</TableHead>
                <TableHead className="w-[110px] text-right">{`Scoateri ${windowDays}z`}</TableHead>
                <TableHead className="w-[90px] text-right">Medie/zi</TableHead>
                <TableHead className="w-[100px] text-right">Zile rămase</TableHead>
                <TableHead className="w-[120px] text-right">Comandă sugerată</TableHead>
                <TableHead className="w-[120px]">Urgență</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="py-8 text-center text-[var(--kiosk-ink-soft)]">
                    {pending ? "Se calculează…" : "Nimic de comandat."}
                  </TableCell>
                </TableRow>
              )}
              {visible.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="mono text-[var(--kiosk-ink-soft)]">
                    {slotFor(r.slot)}
                  </TableCell>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell className="mono text-[12.5px] text-[var(--kiosk-ink-soft)]">
                    {r.code ?? "—"}
                  </TableCell>
                  <TableCell className="mono text-[12.5px] text-[var(--kiosk-ink-soft)]">
                    {r.accountingCode ?? "—"}
                  </TableCell>
                  <TableCell className="mono text-right">
                    {r.count} <span className="text-[var(--kiosk-ink-soft)]">{r.unit}</span>
                  </TableCell>
                  <TableCell className="mono text-right">{r.takes}</TableCell>
                  <TableCell className="mono text-right">{r.avgPerDay}</TableCell>
                  <TableCell className="mono text-right">
                    {r.daysRemaining === null ? (
                      <span className="text-[var(--kiosk-ink-dim)]">∞</span>
                    ) : (
                      r.daysRemaining
                    )}
                  </TableCell>
                  <TableCell className="mono text-right font-medium">
                    {r.suggestedOrder > 0 ? r.suggestedOrder : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={URGENCY_STYLES[r.urgency]}
                    >
                      {URGENCY_LABEL[r.urgency]}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "critical" | "low" | "watch";
}) {
  const cls =
    tone === "critical"
      ? "border-[#e7c4bc] bg-[var(--kiosk-red-soft)] [&_.v]:text-[var(--kiosk-red)]"
      : tone === "low"
      ? "border-[#e6d4a2] bg-[var(--kiosk-amber-soft)] [&_.v]:text-[var(--kiosk-amber)]"
      : tone === "watch"
      ? "border-[var(--kiosk-line)] bg-[var(--kiosk-surface-2)]"
      : "border-[var(--kiosk-line)] bg-[var(--kiosk-surface-2)]";
  return (
    <div className={`rounded-[8px] border px-4 py-3 ${cls}`}>
      <div className="mono v text-[24px] font-medium leading-none tracking-[-0.025em] text-[var(--kiosk-ink)]">
        {value}
      </div>
      <div className="mono mt-1 text-[10px] uppercase tracking-[0.1em] text-[var(--kiosk-ink-soft)]">
        {label}
      </div>
    </div>
  );
}
