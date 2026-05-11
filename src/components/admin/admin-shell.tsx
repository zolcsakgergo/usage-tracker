"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ListOrdered,
  BarChart3,
  Users,
  Package,
  Settings,
  LogOut,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  type DashboardStats,
  type ItemAdminRow,
  type TxRow,
  type UserRow,
  signOutAdmin,
} from "@/app/actions";
import { DashboardTab } from "./tabs/dashboard-tab";
import { TransactionsTab } from "./tabs/transactions-tab";
import { UsageTab } from "./tabs/usage-tab";
import { UsersTab } from "./tabs/users-tab";
import { ItemsTab } from "./tabs/items-tab";
import { SettingsTab } from "./tabs/settings-tab";

type Initial = {
  stats: DashboardStats;
  transactions: TxRow[];
  users: UserRow[];
  items: ItemAdminRow[];
};

const TABS = [
  { value: "dashboard", label: "Tablou de bord", Icon: LayoutDashboard },
  { value: "transactions", label: "Jurnal", Icon: ListOrdered },
  { value: "usage", label: "Utilizare", Icon: BarChart3 },
  { value: "users", label: "Utilizatori", Icon: Users },
  { value: "items", label: "Articole", Icon: Package },
  { value: "settings", label: "Setări", Icon: Settings },
] as const;

export function AdminShell({
  adminName,
  initial,
}: {
  adminName: string;
  initial: Initial;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number]["value"]>("dashboard");
  const [pending, startTransition] = useTransition();

  function logout() {
    startTransition(async () => {
      await signOutAdmin();
      router.push("/");
      router.refresh();
    });
  }

  return (
    <div className="min-h-screen bg-[var(--kiosk-bg)] text-[var(--kiosk-ink)]">
      <header className="border-b border-[var(--kiosk-line)] bg-[var(--kiosk-surface)]">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-8 py-4">
          <div className="flex items-center gap-3.5">
            <div className="relative grid h-10 w-10 place-items-center rounded-lg bg-[var(--kiosk-ink)]">
              <span className="absolute inset-1 rounded-[5px] border border-[rgba(244,243,238,0.18)]" />
              <span className="h-3 w-3 rounded-[2px] bg-[var(--kiosk-bg)]" />
            </div>
            <div>
              <div className="text-[16px] font-semibold tracking-[-0.012em]">
                Panou Administrator
              </div>
              <div className="mono mt-0.5 text-[11px] uppercase tracking-[0.12em] text-[var(--kiosk-ink-soft)]">
                Cutie de scule · Stația 3
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[13px] font-medium">{adminName}</div>
              <div className="mono text-[10.5px] uppercase tracking-[0.12em] text-[var(--kiosk-ink-soft)]">
                Administrator
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              disabled={pending}
              className="border-[var(--kiosk-line)] bg-[var(--kiosk-surface-2)] hover:bg-[var(--kiosk-bg-2)]"
            >
              <LogOut className="mr-1.5 h-4 w-4" />
              Ieșire
            </Button>
          </div>
        </div>
      </header>

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as typeof tab)}
        className="mx-auto max-w-[1280px] gap-6 px-8 py-6"
      >
        <TabsList className="h-auto w-full justify-start gap-1 rounded-[8px] border border-[var(--kiosk-line)] bg-[var(--kiosk-surface)] p-1">
          {TABS.map(({ value, label, Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="data-[state=active]:bg-[var(--kiosk-ink)] data-[state=active]:text-[var(--kiosk-bg)] data-[state=active]:shadow-none"
            >
              <Icon className="mr-1.5 h-4 w-4" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="dashboard">
          <DashboardTab stats={initial.stats} />
        </TabsContent>
        <TabsContent value="transactions">
          <TransactionsTab
            initial={initial.transactions}
            users={initial.users}
            items={initial.items}
          />
        </TabsContent>
        <TabsContent value="usage">
          <UsageTab stats={initial.stats} />
        </TabsContent>
        <TabsContent value="users">
          <UsersTab initial={initial.users} />
        </TabsContent>
        <TabsContent value="items">
          <ItemsTab initial={initial.items} />
        </TabsContent>
        <TabsContent value="settings">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
