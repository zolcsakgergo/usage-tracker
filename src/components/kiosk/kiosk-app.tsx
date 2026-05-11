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

const SESSION_IDLE_MS = 90_000;

type ActiveSession = {
  user: UserDTO;
  sessionId: string;
  tape: SessionTx[];
  expiresAt: number;
};

type View =
  | { name: "grid" }
  | { name: "auth"; item: ItemDTO }
  | { name: "admin-auth" }
  | { name: "tx"; item: ItemDTO };

export function KioskApp({ initialItems }: { initialItems: ItemDTO[] }) {
  const router = useRouter();
  const [items, setItems] = useState<ItemDTO[]>(initialItems);
  const [view, setView] = useState<View>({ name: "grid" });
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [errorTick, setErrorTick] = useState(0);
  const [busy, setBusy] = useState<null | string>(null);
  const [tick, setTick] = useState(0);
  const sessionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const screenTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Refresh items periodically when on the grid.
  useEffect(() => {
    if (view.name !== "grid") return;
    const id = setInterval(async () => {
      const fresh = await getItems();
      setItems(fresh);
    }, 15_000);
    return () => clearInterval(id);
  }, [view.name]);

  // Per-screen inactivity timeout (keypad / tx).
  useEffect(() => {
    if (view.name === "grid") return;
    if (screenTimeoutRef.current) clearTimeout(screenTimeoutRef.current);
    const ms = view.name === "tx" ? 60_000 : 45_000;
    screenTimeoutRef.current = setTimeout(async () => {
      setView({ name: "grid" });
      const fresh = await getItems();
      setItems(fresh);
    }, ms);
    return () => {
      if (screenTimeoutRef.current) clearTimeout(screenTimeoutRef.current);
    };
  }, [view]);

  // Session-wide expiry — auto sign-out when nothing happens for SESSION_IDLE_MS.
  useEffect(() => {
    if (!session) return;
    if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current);
    const remaining = session.expiresAt - Date.now();
    sessionTimeoutRef.current = setTimeout(() => {
      void endActiveSession({ silent: true });
    }, Math.max(0, remaining));
    return () => {
      if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.expiresAt]);

  // Countdown ticker for the grid banner.
  useEffect(() => {
    if (!session || view.name !== "grid") return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [session, view.name]);

  function bumpExpiry() {
    setSession((s) =>
      s ? { ...s, expiresAt: Date.now() + SESSION_IDLE_MS } : s
    );
  }

  async function endActiveSession(opts: { silent?: boolean } = {}) {
    if (!session) {
      setView({ name: "grid" });
      return;
    }
    const sid = session.sessionId;
    setSession(null);
    setView({ name: "grid" });
    if (!opts.silent) {
      const fresh = await getItems();
      setItems(fresh);
    }
    await endSession(sid);
  }

  function pickItem(item: ItemDTO) {
    setErrorTick(0);
    if (session) {
      // Reuse the active session — skip PIN.
      bumpExpiry();
      setView({ name: "tx", item });
      return;
    }
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
        setSession({
          user: res.user,
          sessionId: res.sessionId,
          tape: [],
          expiresAt: Date.now() + SESSION_IDLE_MS,
        });
        setView({ name: "tx", item: view.item });
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
    }
  }

  async function applyDelta(type: "take" | "return") {
    if (view.name !== "tx" || !session) return;
    const res = await recordTransaction({
      itemId: view.item.id,
      userId: session.user.id,
      sessionId: session.sessionId,
      type,
    });
    if (!res.ok) {
      if (res.error === "empty") toast(`${T.empty}`);
      return;
    }

    const newItem = { ...view.item, count: res.newCount };
    setItems((prev) => prev.map((it) => (it.id === newItem.id ? newItem : it)));
    setView({ name: "tx", item: newItem });
    setSession((s) =>
      s
        ? {
            ...s,
            tape: [
              ...s.tape,
              { id: Date.now(), ts: Date.now(), type },
            ],
            expiresAt: Date.now() + SESSION_IDLE_MS,
          }
        : s
    );

    toast(
      type === "take"
        ? `−1 ${newItem.unit} ${T.taken}`
        : `+1 ${newItem.unit} ${T.returned}`,
      { duration: 1500 }
    );
  }

  function backToGridKeepSession() {
    bumpExpiry();
    setView({ name: "grid" });
  }

  if (busy) {
    return <FullscreenSpinner label={busy} />;
  }

  if (view.name === "grid") {
    const remaining = session
      ? Math.max(0, Math.ceil((session.expiresAt - Date.now()) / 1000))
      : null;
    // touch `tick` so the countdown re-renders every second
    void tick;
    return (
      <GridScreen
        items={items}
        onPick={pickItem}
        onAdmin={() => {
          setErrorTick(0);
          setView({ name: "admin-auth" });
        }}
        activeUser={session?.user ?? null}
        sessionRemaining={remaining}
        onEndSession={() => void endActiveSession()}
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

  // tx
  if (!session) {
    // Safety: session expired underneath. Bail to grid.
    setView({ name: "grid" });
    return null;
  }
  return (
    <TransactionScreen
      item={view.item}
      user={session.user}
      sessionTx={session.tape}
      onMinus={() => applyDelta("take")}
      onPlus={() => applyDelta("return")}
      onBack={backToGridKeepSession}
      onDone={() => void endActiveSession()}
    />
  );
}
