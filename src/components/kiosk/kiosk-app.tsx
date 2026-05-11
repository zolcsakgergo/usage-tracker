"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { GridScreen } from "./grid-screen";
import { Keypad } from "./keypad";
import { TransactionScreen, type SessionTx } from "./transaction-screen";
import { FullscreenSpinner } from "./spinner";
import { T } from "@/lib/i18n";
import { useRouter } from "next/navigation";
import {
  endSession,
  getItems,
  recordTransaction,
  verifyAdminPin,
  verifyKioskPin,
  type ItemDTO,
  type UserDTO,
} from "@/app/actions";

type View =
  | { name: "grid" }
  | { name: "auth"; item: ItemDTO }
  | { name: "admin-auth" }
  | {
      name: "tx";
      item: ItemDTO;
      user: UserDTO;
      sessionId: string;
      sessionTx: SessionTx[];
    };

export function KioskApp({ initialItems }: { initialItems: ItemDTO[] }) {
  const router = useRouter();
  const [items, setItems] = useState<ItemDTO[]>(initialItems);
  const [view, setView] = useState<View>({ name: "grid" });
  const [errorTick, setErrorTick] = useState(0);
  const [busy, setBusy] = useState<null | string>(null);
  const inactivityRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Refresh items every 15s when on grid
  useEffect(() => {
    if (view.name !== "grid") return;
    const id = setInterval(async () => {
      const fresh = await getItems();
      setItems(fresh);
    }, 15_000);
    return () => clearInterval(id);
  }, [view.name]);

  // Inactivity timeout
  useEffect(() => {
    if (view.name === "grid") return;
    if (inactivityRef.current) clearTimeout(inactivityRef.current);
    const ms = view.name === "tx" ? 60_000 : 45_000;
    inactivityRef.current = setTimeout(async () => {
      if (view.name === "tx") {
        await endSession(view.sessionId);
      }
      setView({ name: "grid" });
      const fresh = await getItems();
      setItems(fresh);
    }, ms);
    return () => {
      if (inactivityRef.current) clearTimeout(inactivityRef.current);
    };
  }, [view]);

  function pickItem(item: ItemDTO) {
    setErrorTick(0);
    setView({ name: "auth", item });
  }

  async function submitCode(code: string) {
    if (view.name === "auth") {
      setBusy("Se verifică…");
      try {
        const res = await verifyKioskPin(code);
        if (!res.ok) {
          setErrorTick((e) => e + 1);
          return;
        }
        setView({
          name: "tx",
          item: view.item,
          user: res.user,
          sessionId: res.sessionId,
          sessionTx: [],
        });
      } finally {
        setBusy(null);
      }
    } else if (view.name === "admin-auth") {
      setBusy("Se verifică…");
      const res = await verifyAdminPin(code);
      if (!res.ok) {
        setBusy(null);
        setErrorTick((e) => e + 1);
        return;
      }
      setBusy("Se deschide panoul…");
      router.push("/admin");
      // keep `busy` set — the route loading.tsx takes over from here
    }
  }

  async function applyDelta(type: "take" | "return") {
    if (view.name !== "tx") return;
    const res = await recordTransaction({
      itemId: view.item.id,
      userId: view.user.id,
      sessionId: view.sessionId,
      type,
    });
    if (!res.ok) {
      if (res.error === "empty") {
        toast(`${T.empty}`);
      }
      return;
    }

    const newItem = { ...view.item, count: res.newCount };
    setItems((prev) => prev.map((it) => (it.id === newItem.id ? newItem : it)));
    setView((v) =>
      v.name === "tx"
        ? {
            ...v,
            item: newItem,
            sessionTx: [
              ...v.sessionTx,
              { id: Date.now(), ts: Date.now(), type },
            ],
          }
        : v
    );

    toast(
      type === "take"
        ? `−1 ${newItem.unit} ${T.taken}`
        : `+1 ${newItem.unit} ${T.returned}`,
      { duration: 1500 }
    );
  }

  async function finishSession() {
    if (view.name === "tx") {
      await endSession(view.sessionId);
    }
    const fresh = await getItems();
    setItems(fresh);
    setView({ name: "grid" });
  }

  if (busy) {
    return <FullscreenSpinner label={busy} />;
  }

  if (view.name === "grid") {
    return (
      <GridScreen
        items={items}
        onPick={pickItem}
        onAdmin={() => {
          setErrorTick(0);
          setView({ name: "admin-auth" });
        }}
      />
    );
  }

  if (view.name === "auth") {
    return (
      <Keypad
        title={T.authTitle}
        subtitle={T.authSub}
        item={view.item}
        errorTick={errorTick}
        onSubmit={submitCode}
        onCancel={() => setView({ name: "grid" })}
      />
    );
  }

  if (view.name === "admin-auth") {
    return (
      <Keypad
        title={T.adminTitle}
        subtitle={T.adminSub}
        item={null}
        errorTick={errorTick}
        onSubmit={submitCode}
        onCancel={() => setView({ name: "grid" })}
      />
    );
  }

  return (
    <TransactionScreen
      item={view.item}
      user={view.user}
      sessionTx={view.sessionTx}
      onMinus={() => applyDelta("take")}
      onPlus={() => applyDelta("return")}
      onDone={finishSession}
    />
  );
}
