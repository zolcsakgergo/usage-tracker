"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Keypad } from "@/components/kiosk/keypad";
import { FullscreenSpinner } from "@/components/kiosk/spinner";
import { T } from "@/lib/i18n";
import { verifyAdminPin } from "@/app/actions";

export function AdminLogin() {
  const router = useRouter();
  const [errorTick, setErrorTick] = useState(0);
  const [busy, setBusy] = useState<null | string>(null);

  async function submit(code: string) {
    setBusy("Se verifică…");
    const res = await verifyAdminPin(code);
    if (!res.ok) {
      setBusy(null);
      setErrorTick((e) => e + 1);
      return;
    }
    setBusy("Se deschide panoul…");
    router.push("/admin");
    router.refresh();
  }

  if (busy) return <FullscreenSpinner label={busy} />;

  return (
    <Keypad
      title={T.adminTitle}
      subtitle={T.adminSub}
      item={null}
      errorTick={errorTick}
      onSubmit={submit}
      onCancel={() => router.push("/")}
    />
  );
}
