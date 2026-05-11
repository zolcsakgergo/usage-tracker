"use client";

import { useMemo, useState, useTransition } from "react";
import { Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  listTransactions,
  type ItemAdminRow,
  type TxRow,
  type UserRow,
} from "@/app/actions";

export function TransactionsTab({
  initial,
  users,
  items,
}: {
  initial: TxRow[];
  users: UserRow[];
  items: ItemAdminRow[];
}) {
  const [rows, setRows] = useState<TxRow[]>(initial);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<"all" | "take" | "return">("all");
  const [itemId, setItemId] = useState<string>("all");
  const [userId, setUserId] = useState<string>("all");
  const [fromDays, setFromDays] = useState<number>(30);
  const [pending, startTransition] = useTransition();

  function reload(next: Partial<{
    search: string;
    type: "all" | "take" | "return";
    itemId: string;
    userId: string;
    fromDays: number;
  }>) {
    const payload = {
      search: next.search ?? search,
      type: next.type ?? type,
      itemId: (next.itemId ?? itemId) === "all" ? undefined : (next.itemId ?? itemId),
      userId: (next.userId ?? userId) === "all" ? undefined : (next.userId ?? userId),
      fromDays: next.fromDays ?? fromDays,
    };
    startTransition(async () => {
      const data = await listTransactions(payload);
      setRows(data);
    });
  }

  const csv = useMemo(() => {
    const header = ["timestamp", "type", "qty", "item", "user"];
    const lines = [header.join(",")];
    for (const r of rows) {
      lines.push(
        [
          new Date(r.ts).toISOString(),
          r.type,
          r.qty,
          JSON.stringify(r.itemName),
          JSON.stringify(r.userName),
        ].join(",")
      );
    }
    return lines.join("\n");
  }, [rows]);

  function downloadCsv() {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tranzactii-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Card className="rounded-[10px] border-[var(--kiosk-line)] bg-[var(--kiosk-surface)]">
      <CardContent className="flex flex-col gap-4 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--kiosk-ink-soft)]" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                reload({ search: e.target.value });
              }}
              placeholder="Caută articol sau utilizator…"
              className="pl-8"
            />
          </div>
          <Select
            value={type}
            onValueChange={(v) => {
              setType(v as typeof type);
              reload({ type: v as typeof type });
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Tip" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toate tipurile</SelectItem>
              <SelectItem value="take">Scoateri</SelectItem>
              <SelectItem value="return">Returnări</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={itemId}
            onValueChange={(v) => {
              const s = v ?? "all";
              setItemId(s);
              reload({ itemId: s });
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Articol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toate articolele</SelectItem>
              {items.map((it) => (
                <SelectItem key={it.id} value={it.id}>
                  {it.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={userId}
            onValueChange={(v) => {
              const s = v ?? "all";
              setUserId(s);
              reload({ userId: s });
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Utilizator" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toți utilizatorii</SelectItem>
              {users.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={String(fromDays)}
            onValueChange={(v) => {
              const n = Number(v);
              setFromDays(n);
              reload({ fromDays: n });
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 zile</SelectItem>
              <SelectItem value="14">14 zile</SelectItem>
              <SelectItem value="30">30 zile</SelectItem>
              <SelectItem value="90">90 zile</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={downloadCsv} className="ml-auto">
            <Download className="mr-1.5 h-4 w-4" />
            CSV
          </Button>
        </div>

        <div className="overflow-hidden rounded-[6px] border border-[var(--kiosk-line)]">
          <Table>
            <TableHeader>
              <TableRow className="bg-[var(--kiosk-surface-2)]">
                <TableHead className="w-[170px]">Timp</TableHead>
                <TableHead className="w-[110px]">Tip</TableHead>
                <TableHead>Articol</TableHead>
                <TableHead>Utilizator</TableHead>
                <TableHead className="w-[60px] text-right">Cant.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-[var(--kiosk-ink-soft)]">
                    {pending ? "Se încarcă…" : "Nicio tranzacție"}
                  </TableCell>
                </TableRow>
              )}
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="mono text-[12.5px] text-[var(--kiosk-ink-mute)]">
                    {new Date(r.ts).toLocaleString("ro-RO")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        r.type === "take"
                          ? "border-[#e0c5bc] bg-[var(--kiosk-red-soft)] text-[var(--kiosk-red)]"
                          : "border-[#b9d2bf] bg-[var(--kiosk-green-soft)] text-[var(--kiosk-green)]"
                      }
                    >
                      {r.type === "take" ? "−1 Scoatere" : "+1 Returnare"}
                    </Badge>
                  </TableCell>
                  <TableCell>{r.itemName}</TableCell>
                  <TableCell>{r.userName}</TableCell>
                  <TableCell className="mono text-right">{r.qty}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="text-[12px] text-[var(--kiosk-ink-soft)]">
          {rows.length} rezultate
        </div>
      </CardContent>
    </Card>
  );
}
