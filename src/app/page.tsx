import { getItems } from "./actions";
import { KioskApp } from "@/components/kiosk/kiosk-app";

export const dynamic = "force-dynamic";

export default async function Home() {
  const items = await getItems();
  return <KioskApp initialItems={items} />;
}
