"use client";

import { useState, useTransition } from "react";
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
  listItemsAdmin,
  updateItem,
  type ItemAdminRow,
} from "@/app/actions";
import { slotFor, stockTier } from "@/lib/i18n";

export function ItemsTab({ initial }: { initial: ItemAdminRow[] }) {
  const [rows, setRows] = useState<ItemAdminRow[]>(initial);
  const [editing, setEditing] = useState<ItemAdminRow | null>(null);
  const [adjusting, setAdjusting] = useState<ItemAdminRow | null>(null);
  const [pending, startTransition] = useTransition();

  async function refresh() {
    const data = await listItemsAdmin();
    setRows(data);
  }

  function onEdit(form: FormData) {
    if (!editing) return;
    const name = String(form.get("name") ?? "").trim();
    const unit = String(form.get("unit") ?? "").trim();
    const low = Number(form.get("low"));
    startTransition(async () => {
      await updateItem({ id: editing.id, name, unit, low });
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
        <div>
          <div className="text-[16px] font-medium">Articole</div>
          <div className="text-[12.5px] text-[var(--kiosk-ink-soft)]">
            {rows.length} compartimente · editează nume / prag / stoc
          </div>
        </div>

        <div className="overflow-hidden rounded-[6px] border border-[var(--kiosk-line)]">
          <Table>
            <TableHeader>
              <TableRow className="bg-[var(--kiosk-surface-2)]">
                <TableHead className="w-[80px]">Slot</TableHead>
                <TableHead>Nume</TableHead>
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
      </CardContent>
    </Card>
  );
}
