"use client";

import { useTransition } from "react";
import { Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { exportBackup, factoryReset } from "@/app/actions";

export function SettingsTab() {
  const [pending, startTransition] = useTransition();

  async function download() {
    const data = await exportBackup();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function reset() {
    startTransition(async () => {
      await factoryReset();
      window.location.reload();
    });
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="rounded-[10px] border-[var(--kiosk-line)] bg-[var(--kiosk-surface)]">
        <CardContent className="flex flex-col gap-3 p-6">
          <div>
            <div className="text-[16px] font-medium">Backup JSON</div>
            <div className="mt-1 text-[13px] text-[var(--kiosk-ink-mute)]">
              Exportă toate articolele, utilizatorii (fără PIN-uri) și tranzacțiile într-un fișier JSON.
            </div>
          </div>
          <Button variant="outline" onClick={download} className="self-start">
            <Download className="mr-1.5 h-4 w-4" />
            Descarcă backup
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-[10px] border-[#e7c4bc] bg-[var(--kiosk-red-soft)]/30">
        <CardContent className="flex flex-col gap-3 p-6">
          <div>
            <div className="text-[16px] font-medium text-[var(--kiosk-red)]">Resetare din fabrică</div>
            <div className="mt-1 text-[13px] text-[var(--kiosk-ink-mute)]">
              Șterge toate tranzacțiile și sesiunile, resetează stocul la valorile inițiale.
              Utilizatorii și PIN-urile rămân.
            </div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button variant="outline" className="self-start border-[var(--kiosk-red)] text-[var(--kiosk-red)] hover:bg-[var(--kiosk-red-soft)]">
                  <RotateCcw className="mr-1.5 h-4 w-4" />
                  Resetează
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmi resetarea?</AlertDialogTitle>
                <AlertDialogDescription>
                  Această acțiune nu poate fi anulată. Toate tranzacțiile și sesiunile vor fi șterse,
                  iar stocul fiecărui articol va reveni la valoarea inițială.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Anulează</AlertDialogCancel>
                <AlertDialogAction
                  onClick={reset}
                  disabled={pending}
                  className="bg-[var(--kiosk-red)] text-white hover:bg-[var(--kiosk-red)]/90"
                >
                  Da, resetează
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
