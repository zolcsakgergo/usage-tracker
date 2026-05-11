"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Keypad } from "@/components/kiosk/keypad";
import { T } from "@/lib/i18n";
import { verifyAdminPin } from "@/app/actions";

export function AdminLogin() {
  const router = useRouter();
  const [errorTick, setErrorTick] = useState(0);

  async function submit(code: string) {
    const res = await verifyAdminPin(code);
    if (!res.ok) {
      setErrorTick((e) => e + 1);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

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
