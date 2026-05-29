"use client";

import { useRef, useState, useTransition } from "react";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  adjustStock,
  bulkUpdateItems,
  exportItemsCsv,
  listItemsAdmin,
  updateItem,
  type BulkItemUpdate,
  type ItemAdminRow,
} from "@/app/actions";
import { slotFor, stockTier } from "@/lib/i18n";
import { parseItemsCsv } from "@/lib/items-csv";

type FieldDiff = { label: string; from: string; to: string };
type RowDiff = { slot: string; name: string; fields: FieldDiff[] };
type ImportPreview = {
  changes: BulkItemUpdate[];
  diffs: RowDiff[];
  errors: string[];
  unmatched: string[];
  unchanged: number;
};

export function ItemsTab({ initial }: { initial: ItemAdminRow[] }) {
  const [rows, setRows] = useState<ItemAdminRow[]>(initial);
  const [editing, setEditing] = useState<ItemAdminRow | null>(null);
  const [adjusting, setAdjusting] = useState<ItemAdminRow | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [pending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function refresh() {
    const data = await listItemsAdmin();
    setRows(data);
  }

  async function downloadCsv() {
    const csv = await exportItemsCsv();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `articole-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file
    if (!file) return;
    let text: string;
    try {
      text = await file.text();
    } catch {
      toast("Nu am putut citi fișierul.");
      return;
    }
    const parsed = parseItemsCsv(text);
    const bySlot = new Map(rows.map((r) => [r.slot, r]));
    const diffs: RowDiff[] = [];
    const changes: BulkItemUpdate[] = [];
    const unmatched: string[] = [];
    let unchanged = 0;

    for (const pr of parsed.rows) {
      const item = bySlot.get(pr.slotIndex);
      if (!item) {
        unmatched.push(pr.slot);
        continue;
      }
      const fields: FieldDiff[] = [];
      if (pr.name !== item.name)
        fields.push({ label: "Nume", from: item.name, to: pr.name });
      if ((pr.code ?? null) !== (item.code ?? null))
        fields.push({ label: "Cod", from: item.code ?? "—", to: pr.code ?? "—" });
      if ((pr.accountingCode ?? null) !== (item.accountingCode ?? null))
        fields.push({
          label: "Cod Contabilitate",
          from: item.accountingCode ?? "—",
          to: pr.accountingCode ?? "—",
        });
      if (pr.unit !== item.unit)
        fields.push({ label: "Unitate", from: item.unit, to: pr.unit });
      if (pr.count !== item.count) {
        const d = pr.count - item.count;
        fields.push({
          label: "Stoc",
          from: String(item.count),
          to: `${pr.count} (${d > 0 ? "+" : ""}${d})`,
        });
      }
      if (pr.low !== item.low)
        fields.push({ label: "Prag alarmă", from: String(item.low), to: String(pr.low) });

      if (fields.length === 0) {
        unchanged++;
        continue;
      }
      diffs.push({ slot: pr.slot, name: item.name, fields });
      changes.push({
        slotIndex: pr.slotIndex,
        name: pr.name,
        code: pr.code,
        accountingCode: pr.accountingCode,
        unit: pr.unit,
        count: pr.count,
        low: pr.low,
      });
    }

    setPreview({ changes, diffs, errors: parsed.errors, unmatched, unchanged });
  }

  function applyImport() {
    if (!preview || preview.changes.length === 0) return;
    startTransition(async () => {
      const res = await bulkUpdateItems(preview.changes);
      setPreview(null);
      await refresh();
      toast(
        `${res.changed} articole actualizate` +
          (res.stockChanged > 0 ? ` · ${res.stockChanged} ajustări de stoc` : "")
      );
    });
  }

  function onEdit(form: FormData) {
    if (!editing) return;
    const name = String(form.get("name") ?? "").trim();
    const code = String(form.get("code") ?? "").trim();
    const accountingCode = String(form.get("accountingCode") ?? "").trim();
    const unit = String(form.get("unit") ?? "").trim();
    const low = Number(form.get("low"));
    startTransition(async () => {
      await updateItem({
        id: editing.id,
        name,
        code: code || null,
        accountingCode: accountingCode || null,
        unit,
        low,
      });
      setEditing(null);
      await refresh();
    });
  }

  function onAdjust(form: FormData) {
    if (!adjusting) return;
    const newCount = Number(form.get("count"));
    if (!Number.isFinite(newCount) || newCount < 0) return;
    startTransition(async () => {
      await adjustStock({ itemId: adjusting.id, newCount });
      setAdjusting(null);
      await refresh();
    });
  }

  return (
    <Card className="rounded-[10px] border-[var(--kiosk-line)] bg-[var(--kiosk-surface)]">
      <CardContent className="flex flex-col gap-4 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-[16px] font-medium">Articole</div>
            <div className="text-[12.5px] text-[var(--kiosk-ink-soft)]">
              {rows.length} compartimente · editează nume / prag / stoc
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={onFileChange}
            />
            <Button variant="outline" size="sm" onClick={downloadCsv}>
              <Download className="mr-1.5 h-4 w-4" />
              Descarcă CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-1.5 h-4 w-4" />
              Încarcă CSV
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-[6px] border border-[var(--kiosk-line)]">
          <Table>
            <TableHeader>
              <TableRow className="bg-[var(--kiosk-surface-2)]">
                <TableHead className="w-[80px]">Slot</TableHead>
                <TableHead>Nume</TableHead>
                <TableHead className="w-[130px]">Cod</TableHead>
                <TableHead className="w-[150px]">Cod Contabilitate</TableHead>
                <TableHead className="w-[90px]">Unitate</TableHead>
                <TableHead className="w-[100px] text-right">Stoc</TableHead>
                <TableHead className="w-[120px] text-right">Prag alarmă</TableHead>
                <TableHead className="w-[100px]">Stare</TableHead>
                <TableHead className="w-[200px] text-right">Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((it) => {
                const tier = stockTier(it.count, it.low);
                return (
                  <TableRow key={it.id}>
                    <TableCell className="mono text-[var(--kiosk-ink-soft)]">
                      {slotFor(it.slot)}
                    </TableCell>
                    <TableCell className="font-medium">{it.name}</TableCell>
                    <TableCell className="mono text-[12.5px] text-[var(--kiosk-ink-soft)]">
                      {it.code ?? "—"}
                    </TableCell>
                    <TableCell className="mono text-[12.5px] text-[var(--kiosk-ink-soft)]">
                      {it.accountingCode ?? "—"}
                    </TableCell>
                    <TableCell className="mono">{it.unit}</TableCell>
                    <TableCell className="mono text-right">{it.count}</TableCell>
                    <TableCell className="mono text-right">{it.low}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          tier === "ok"
                            ? "border-[#b9d2bf] bg-[var(--kiosk-green-soft)] text-[var(--kiosk-green)]"
                            : tier === "low"
                            ? "border-[#e6d4a2] bg-[var(--kiosk-amber-soft)] text-[var(--kiosk-amber)]"
                            : "border-[#e7c4bc] bg-[var(--kiosk-red-soft)] text-[var(--kiosk-red)]"
                        }
                      >
                        {tier === "ok" ? "OK" : tier === "low" ? "Aproape gol" : "Gol"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setEditing(it)}>
                        Editează
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setAdjusting(it)}>
                        Ajustează stoc
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editează articol</DialogTitle>
            </DialogHeader>
            {editing && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onEdit(new FormData(e.currentTarget));
                }}
                className="flex flex-col gap-3"
              >
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="i-name">Nume</Label>
                  <Input id="i-name" name="name" defaultValue={editing.name} required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="i-code">Cod produs</Label>
                  <Input
                    id="i-code"
                    name="code"
                    defaultValue={editing.code ?? ""}
                    placeholder="ex. PCCI 04-M5"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="i-acc">Cod Contabilitate</Label>
                  <Input
                    id="i-acc"
                    name="accountingCode"
                    defaultValue={editing.accountingCode ?? ""}
                    placeholder="opțional"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="i-unit">Unitate</Label>
                    <Input id="i-unit" name="unit" defaultValue={editing.unit} required />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="i-low">Prag alarmă</Label>
                    <Input
                      id="i-low"
                      name="low"
                      type="number"
                      min={0}
                      defaultValue={editing.low}
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={pending}>
                    Salvează
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={!!adjusting} onOpenChange={(o) => !o && setAdjusting(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajustează stoc</DialogTitle>
            </DialogHeader>
            {adjusting && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onAdjust(new FormData(e.currentTarget));
                }}
                className="flex flex-col gap-3"
              >
                <div className="text-[13.5px] text-[var(--kiosk-ink-mute)]">
                  {adjusting.name} · stoc actual{" "}
                  <span className="mono font-medium">{adjusting.count}</span> {adjusting.unit}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="i-count">Stoc nou</Label>
                  <Input
                    id="i-count"
                    name="count"
                    type="number"
                    min={0}
                    defaultValue={adjusting.count}
                    autoFocus
                    required
                  />
                </div>
                <div className="text-[12px] text-[var(--kiosk-ink-soft)]">
                  Diferența va fi înregistrată ca tranzacție admin.
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={pending}>
                    Aplică
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Previzualizare import</DialogTitle>
            </DialogHeader>
            {preview && (
              <div className="flex flex-col gap-3">
                <div className="text-[13px] text-[var(--kiosk-ink-mute)]">
                  <span className="font-medium text-[var(--kiosk-ink)]">
                    {preview.changes.length}
                  </span>{" "}
                  articole modificate · {preview.unchanged} neschimbate
                  {preview.unmatched.length > 0 && (
                    <> · {preview.unmatched.length} sloturi inexistente</>
                  )}
                </div>

                {preview.errors.length > 0 && (
                  <div className="max-h-[120px] overflow-auto rounded-[6px] border border-[#e7c4bc] bg-[var(--kiosk-red-soft)]/40 p-3 text-[12.5px] text-[var(--kiosk-red)]">
                    <div className="mb-1 font-medium">
                      Probleme găsite ({preview.errors.length}) — rândurile afectate vor fi ignorate:
                    </div>
                    <ul className="list-disc pl-4">
                      {preview.errors.map((er, i) => (
                        <li key={i}>{er}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {preview.unmatched.length > 0 && (
                  <div className="text-[12px] text-[var(--kiosk-amber)]">
                    Sloturi care nu există și vor fi ignorate:{" "}
                    {preview.unmatched.join(", ")}
                  </div>
                )}

                {preview.changes.length === 0 ? (
                  <div className="rounded-[6px] border border-[var(--kiosk-line)] bg-[var(--kiosk-surface-2)] p-4 text-center text-[13px] text-[var(--kiosk-ink-soft)]">
                    Nicio modificare de aplicat.
                  </div>
                ) : (
                  <div className="max-h-[320px] overflow-auto rounded-[6px] border border-[var(--kiosk-line)]">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-[var(--kiosk-surface-2)]">
                          <TableHead className="w-[70px]">Slot</TableHead>
                          <TableHead className="w-[150px]">Câmp</TableHead>
                          <TableHead>Vechi</TableHead>
                          <TableHead>Nou</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {preview.diffs.flatMap((d) =>
                          d.fields.map((f, fi) => (
                            <TableRow key={`${d.slot}-${f.label}`}>
                              <TableCell className="mono text-[var(--kiosk-ink-soft)]">
                                {fi === 0 ? d.slot : ""}
                              </TableCell>
                              <TableCell className="text-[12.5px]">{f.label}</TableCell>
                              <TableCell className="text-[12.5px] text-[var(--kiosk-ink-soft)]">
                                {f.from}
                              </TableCell>
                              <TableCell className="text-[12.5px] font-medium">
                                {f.to}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}

                <DialogFooter>
                  <Button variant="ghost" onClick={() => setPreview(null)}>
                    Anulează
                  </Button>
                  <Button
                    onClick={applyImport}
                    disabled={pending || preview.changes.length === 0}
                  >
                    Aplică {preview.changes.length} modificări
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
