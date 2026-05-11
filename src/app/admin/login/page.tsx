import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-session";
import { AdminLogin } from "@/components/admin/admin-login";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) redirect("/admin");
  return <AdminLogin />;
}
