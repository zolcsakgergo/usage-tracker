import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-session";
import {
  getDashboardStats,
  listItemsAdmin,
  listTransactions,
  listUsers,
} from "@/app/actions";
import { AdminShell } from "@/components/admin/admin-shell";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const [stats, transactions, users, items] = await Promise.all([
    getDashboardStats(),
    listTransactions({ fromDays: 30 }),
    listUsers(),
    listItemsAdmin(),
  ]);

  return (
    <AdminShell
      adminName={session.name}
      initial={{ stats, transactions, users, items }}
    />
  );
}
