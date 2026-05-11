"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  addUser,
  listUsers,
  removeUser,
  updateUser,
  type UserRow,
} from "@/app/actions";

const ROLES = ["Tehnician", "Administrator"] as const;

export function UsersTab({ initial }: { initial: UserRow[] }) {
  const [rows, setRows] = useState<UserRow[]>(initial);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [deleting, setDeleting] = useState<UserRow | null>(null);
  const [pending, startTransition] = useTransition();

  async function refresh() {
    const data = await listUsers();
    setRows(data);
  }

  function onAdd(form: FormData) {
    const name = String(form.get("name") ?? "").trim();
    const role = String(form.get("role") ?? "Tehnician");
    const pin = String(form.get("pin") ?? "").trim();
    if (!name || !pin) return;
    startTransition(async () => {
      try {
        await addUser({ name, role, pin });
        setOpen(false);
        await refresh();
      } catch (e) {
        alert((e as Error).message);
      }
    });
  }

  function onEdit(form: FormData) {
    if (!editing) return;
    const name = String(form.get("name") ?? "").trim();
    const role = String(form.get("role") ?? "Tehnician");
    const pin = String(form.get("pin") ?? "").trim();
    startTransition(async () => {
      try {
        await updateUser({
          id: editing.id,
          name,
          role,
          ...(pin ? { newPin: pin } : {}),
        });
        setEditing(null);
        await refresh();
      } catch (e) {
        alert((e as Error).message);
      }
    });
  }

  function toggleActive(u: UserRow) {
    startTransition(async () => {
      await updateUser({ id: u.id, active: !u.active });
      await refresh();
    });
  }

  function confirmDelete() {
    if (!deleting) return;
    startTransition(async () => {
      try {
        const res = await removeUser(deleting.id);
        if (!res.ok && res.reason === "has-history") {
          alert(
            "Utilizatorul are tranzacții înregistrate și nu poate fi șters. Dezactivează-l în loc."
          );
        }
        setDeleting(null);
        await refresh();
      } catch (e) {
        alert((e as Error).message);
      }
    });
  }

  return (
    <Card className="rounded-[10px] border-[var(--kiosk-line)] bg-[var(--kiosk-surface)]">
      <CardContent className="flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[16px] font-medium">Utilizatori</div>
            <div className="text-[12.5px] text-[var(--kiosk-ink-soft)]">
              {rows.length} înregistrați · activitate ultimele 7 zile
            </div>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
              render={
                <Button>
                  <Plus className="mr-1.5 h-4 w-4" />
                  Adaugă utilizator
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Utilizator nou</DialogTitle>
              </DialogHeader>
              <form
                action={onAdd}
                className="flex flex-col gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  onAdd(new FormData(e.currentTarget));
                }}
              >
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="name">Nume complet</Label>
                  <Input id="name" name="name" required autoFocus />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="role">Rol</Label>
                  <Select name="role" defaultValue="Tehnician">
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="pin">PIN (2–8 cifre)</Label>
                  <Input
                    id="pin"
                    name="pin"
                    inputMode="numeric"
                    pattern="[0-9]{2,8}"
                    required
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={pending}>
                    Salvează
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="overflow-hidden rounded-[6px] border border-[var(--kiosk-line)]">
          <Table>
            <TableHeader>
              <TableRow className="bg-[var(--kiosk-surface-2)]">
                <TableHead>Nume</TableHead>
                <TableHead className="w-[140px]">Rol</TableHead>
                <TableHead className="w-[100px]">Stare</TableHead>
                <TableHead className="w-[90px] text-right">Scoateri</TableHead>
                <TableHead className="w-[90px] text-right">Returnări</TableHead>
                <TableHead className="w-[260px] text-right">Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.role}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        u.active
                          ? "border-[#b9d2bf] bg-[var(--kiosk-green-soft)] text-[var(--kiosk-green)]"
                          : "border-[var(--kiosk-line)] bg-[var(--kiosk-surface-2)] text-[var(--kiosk-ink-soft)]"
                      }
                    >
                      {u.active ? "Activ" : "Inactiv"}
                    </Badge>
                  </TableCell>
                  <TableCell className="mono text-right">{u.takes7d}</TableCell>
                  <TableCell className="mono text-right">{u.returns7d}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setEditing(u)}>
                      Editează
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActive(u)}
                      className={u.active ? "text-[var(--kiosk-red)]" : "text-[var(--kiosk-green)]"}
                    >
                      {u.active ? "Dezactivează" : "Activează"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleting(u)}
                      className="text-[var(--kiosk-red)]"
                      aria-label={`Șterge ${u.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <AlertDialog
          open={!!deleting}
          onOpenChange={(o) => !o && setDeleting(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Șterge utilizator?</AlertDialogTitle>
              <AlertDialogDescription>
                {deleting?.name} va fi eliminat definitiv. Dacă utilizatorul are deja
                tranzacții înregistrate, ștergerea nu va fi posibilă — dezactivează-l
                în loc, pentru a păstra istoricul.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Anulează</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                disabled={pending}
                className="bg-[var(--kiosk-red)] text-white hover:bg-[var(--kiosk-red)]/90"
              >
                Șterge
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editează utilizator</DialogTitle>
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
                  <Label htmlFor="e-name">Nume complet</Label>
                  <Input id="e-name" name="name" defaultValue={editing.name} required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="e-role">Rol</Label>
                  <Select name="role" defaultValue={editing.role}>
                    <SelectTrigger id="e-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="e-pin">PIN nou (gol = nu se schimbă)</Label>
                  <Input
                    id="e-pin"
                    name="pin"
                    inputMode="numeric"
                    pattern="[0-9]{2,8}"
                    placeholder="••••"
                  />
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
      </CardContent>
    </Card>
  );
}
