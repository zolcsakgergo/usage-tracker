// Authoritative 48-compartment layout from "cutie stoc legris.xlsx" sheet 2.
// 6 columns × 8 drawers — Legris pneumatic fittings.
// Slot index is row-major (row 0 col 0 = A1 = slot 0, row 0 col 5 = A6 = slot 5, etc.)

export type SeedItem = {
  id: string;
  name: string;
  unit: string;
  start: number;
  low: number;
};

export const DEFAULT_ITEMS: SeedItem[] = [
  // Row A (slots 0–5)
  { id: "pcci-04-m5", name: "4 Drept M5", unit: "buc", start: 0, low: 3 },
  { id: "pcci-06-18", name: "6 Drept 1/8", unit: "buc", start: 0, low: 3 },
  { id: "pcci-08-18", name: "8 Drept 1/8", unit: "buc", start: 0, low: 3 },
  { id: "pcci-10-18", name: "10 Drept 1/8", unit: "buc", start: 0, low: 3 },
  { id: "pcci-12-14", name: "12 Drept 1/4", unit: "buc", start: 0, low: 3 },
  { id: "pul-04", name: "4 L", unit: "buc", start: 0, low: 3 },
  // Row B (slots 6–11)
  { id: "pcci-04-18", name: "4 Drept 1/8", unit: "buc", start: 0, low: 3 },
  { id: "pcci-06-14", name: "6 Drept 1/4", unit: "buc", start: 0, low: 3 },
  { id: "pcci-08-14", name: "8 Drept 1/4", unit: "buc", start: 0, low: 3 },
  { id: "pcci-10-14", name: "10 Drept 1/4", unit: "buc", start: 0, low: 3 },
  { id: "puc-12", name: "12 Legătură", unit: "buc", start: 0, low: 3 },
  { id: "py-04", name: "4 Y", unit: "buc", start: 0, low: 3 },
  // Row C (slots 12–17)
  { id: "pcci-04-14", name: "4 Drept 1/4", unit: "buc", start: 0, low: 3 },
  { id: "pcci-06-38", name: "6 Drept 3/8", unit: "buc", start: 0, low: 3 },
  { id: "pcci-08-38", name: "8 Drept 3/8", unit: "buc", start: 0, low: 3 },
  { id: "pcci-10-38", name: "10 Drept 3/8", unit: "buc", start: 0, low: 3 },
  { id: "ptci-12-14", name: "12 T 1/4", unit: "buc", start: 0, low: 3 },
  { id: "pul-06", name: "6 L", unit: "buc", start: 0, low: 3 },
  // Row D (slots 18–23)
  { id: "puc-04", name: "4 Legătură", unit: "buc", start: 0, low: 3 },
  { id: "puc-06", name: "6 Legătură", unit: "buc", start: 0, low: 3 },
  { id: "puc-08", name: "8 Legătură", unit: "buc", start: 0, low: 3 },
  { id: "pcci-10-12", name: "10 Drept 1/2", unit: "buc", start: 0, low: 3 },
  { id: "ptci-12-38", name: "12 T 3/8", unit: "buc", start: 0, low: 3 },
  { id: "py-06", name: "6 Y", unit: "buc", start: 0, low: 3 },
  // Row E (slots 24–29)
  { id: "ptci-04-m5", name: "4 T M5", unit: "buc", start: 0, low: 3 },
  { id: "ptci-06-18", name: "6 T 1/8", unit: "buc", start: 0, low: 3 },
  { id: "ptci-08-18", name: "8 T 1/8", unit: "buc", start: 0, low: 3 },
  { id: "puc-10", name: "10 Legătură", unit: "buc", start: 0, low: 3 },
  { id: "put-12", name: "12 T simplu", unit: "buc", start: 0, low: 3 },
  { id: "pul-08", name: "8 L", unit: "buc", start: 0, low: 3 },
  // Row F (slots 30–35)
  { id: "ptci-04-18", name: "4 T 1/8", unit: "buc", start: 0, low: 3 },
  { id: "ptci-06-14", name: "6 T 1/4", unit: "buc", start: 0, low: 3 },
  { id: "ptci-08-14", name: "8 T 1/4", unit: "buc", start: 0, low: 3 },
  { id: "ptci-10-38", name: "10 T 3/8", unit: "buc", start: 0, low: 3 },
  { id: "plci-12-14", name: "12 Cot 1/4", unit: "buc", start: 0, low: 3 },
  { id: "py-08", name: "8 Y", unit: "buc", start: 0, low: 3 },
  // Row G (slots 36–41)
  { id: "plci-04-m5", name: "4 Cot M5", unit: "buc", start: 0, low: 3 },
  { id: "ptci-06-38", name: "6 T 3/8", unit: "buc", start: 0, low: 3 },
  { id: "put-08", name: "8 T simplu", unit: "buc", start: 0, low: 3 },
  { id: "put-10", name: "10 T simplu", unit: "buc", start: 0, low: 3 },
  { id: "plci-12-38", name: "12 Cot 3/8", unit: "buc", start: 0, low: 3 },
  { id: "pul-10", name: "10 L", unit: "buc", start: 0, low: 3 },
  // Row H (slots 42–47)
  { id: "put-04", name: "4 T simplu", unit: "buc", start: 0, low: 3 },
  { id: "plci-06-18", name: "6 Cot 1/8", unit: "buc", start: 0, low: 3 },
  { id: "plci-08-18", name: "8 Cot 1/8", unit: "buc", start: 0, low: 3 },
  { id: "plci-10-14", name: "10 Cot 1/4", unit: "buc", start: 0, low: 3 },
  { id: "reserve-h5", name: "Liber · rezervă", unit: "buc", start: 0, low: 0 },
  { id: "py-10", name: "10 Y", unit: "buc", start: 0, low: 3 },
];

export const DEFAULT_USERS = [
  { pin: "10", name: "VIRAG GHEORGHE", role: "Tehnician" },
  { pin: "12", name: "ZOLCSAK SANDOR", role: "Administrator" },
  { pin: "124", name: "BESENYODI FERENC CSABA", role: "Tehnician" },
  { pin: "249", name: "PUSKAS KAROLY", role: "Tehnician" },
  { pin: "562", name: "INCZE FODOR SANDOR ISTVAN", role: "Tehnician" },
  { pin: "653", name: "DRAGOS VASILE", role: "Tehnician" },
  { pin: "674", name: "CSOKASI TAMAS GABOR", role: "Tehnician" },
  { pin: "956", name: "CORDIS FLORIN GHEORGHE", role: "Tehnician" },
  { pin: "1280", name: "TURCAS IOAN MARCEL", role: "Tehnician" },
  { pin: "1365", name: "SOMI ZOLTAN ATTILA", role: "Tehnician" },
  { pin: "1376", name: "KURTI CSABA", role: "Tehnician" },
  { pin: "1481", name: "GERGELY NORBERT", role: "Tehnician" },
  { pin: "1816", name: "BOTOS LORAND", role: "Tehnician" },
  { pin: "1830", name: "MAJER ALFRED ADRIAN", role: "Tehnician" },
  { pin: "1985", name: "NAGY NICOLAE ROBERT", role: "Tehnician" },
  { pin: "1991", name: "ERNI ZSOLT HERBERT", role: "Administrator" },
  { pin: "2024", name: "NAGY TAMAS ISTVAN", role: "Tehnician" },
  { pin: "2045", name: "KOVACS ADALBERT", role: "Tehnician" },
  { pin: "2053", name: "LUKACS JANOS LORANT", role: "Tehnician" },
  { pin: "2072", name: "PUSKAS KAROLY PAL", role: "Tehnician" },
  { pin: "2087", name: "MARASESCU VIRGIL ION", role: "Tehnician" },
];
