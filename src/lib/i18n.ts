export const T = {
  appTitle: "Cutie de piese schimb · Stația 1",
  appSub: "Atinge un compartiment pentru a înregistra utilizarea",
  inStock: "În stoc",
  low: "Aproape gol",
  empty: "Gol",
  admin: "Administrator",
  footer: "Doar personal autorizat · Toate tranzacțiile sunt înregistrate",
  authTitle: "Introdu codul tău de acces",
  authSub: "PIN personal",
  adminTitle: "Autentificare administrator",
  adminSub: "Introdu codul de administrator",
  badCode: "Cod nerecunoscut · încearcă din nou",
  cancel: "Anulează",
  hello: "Bună",
  compartment: "Compartiment",
  onHand: "în stoc",
  takeOut: "Scoate",
  putBack: "Pune înapoi",
  taken: "scos",
  returned: "returnat",
  done: "Gata",
  enter: "Intră",
  sessionTx: "Tranzacții în sesiune",
};

export function slotFor(idx: number): string {
  const row = Math.floor(idx / 6);
  const col = idx % 6;
  return `${String.fromCharCode(65 + row)}${col + 1}`;
}

export type Tier = "ok" | "low" | "empty";
export function stockTier(count: number, low: number): Tier {
  if (count <= 0) return "empty";
  if (count <= low) return "low";
  return "ok";
}
