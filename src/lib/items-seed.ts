// Authoritative 48-compartment layout from "cutie stoc legris.xlsx" sheet 2.
// 6 columns × 8 drawers — Legris pneumatic fittings.

export type SeedItem = {
  id: string;
  name: string;
  code: string | null;
  unit: string;
  start: number;
  low: number;
};

export const DEFAULT_ITEMS: SeedItem[] = [
  // Row A
  { id: "pcci-04-m5", name: "4 Drept M5", code: "PCCI 04-M5", unit: "buc", start: 0, low: 3 },
  { id: "pcci-06-18", name: "6 Drept 1/8", code: "PCCI 06-18", unit: "buc", start: 0, low: 3 },
  { id: "pcci-08-18", name: "8 Drept 1/8", code: "PCCI 08-18", unit: "buc", start: 0, low: 3 },
  { id: "pcci-10-18", name: "10 Drept 1/8", code: "PCCI 10-18", unit: "buc", start: 0, low: 3 },
  { id: "pcci-12-14", name: "12 Drept 1/4", code: "PCCI 12-14", unit: "buc", start: 0, low: 3 },
  { id: "pul-04", name: "4 L", code: "PUL 04", unit: "buc", start: 0, low: 3 },
  // Row B
  { id: "pcci-04-18", name: "4 Drept 1/8", code: "PCCI 04-18", unit: "buc", start: 0, low: 3 },
  { id: "pcci-06-14", name: "6 Drept 1/4", code: "PCCI 06-14", unit: "buc", start: 0, low: 3 },
  { id: "pcci-08-14", name: "8 Drept 1/4", code: "PCCI 08-14", unit: "buc", start: 0, low: 3 },
  { id: "pcci-10-14", name: "10 Drept 1/4", code: "PCCI 10-14", unit: "buc", start: 0, low: 3 },
  { id: "puc-12", name: "12 Legătură", code: "PUC 12", unit: "buc", start: 0, low: 3 },
  { id: "py-04", name: "4 Y", code: "PY 04", unit: "buc", start: 0, low: 3 },
  // Row C
  { id: "pcci-04-14", name: "4 Drept 1/4", code: "PCCI 04-14", unit: "buc", start: 0, low: 3 },
  { id: "pcci-06-38", name: "6 Drept 3/8", code: "PCCI 06-38", unit: "buc", start: 0, low: 3 },
  { id: "pcci-08-38", name: "8 Drept 3/8", code: "PCCI 08-38", unit: "buc", start: 0, low: 3 },
  { id: "pcci-10-38", name: "10 Drept 3/8", code: "PCCI 10-38", unit: "buc", start: 0, low: 3 },
  { id: "ptci-12-14", name: "12 T 1/4", code: "PTCI 12-14", unit: "buc", start: 0, low: 3 },
  { id: "pul-06", name: "6 L", code: "PUL 06", unit: "buc", start: 0, low: 3 },
  // Row D
  { id: "puc-04", name: "4 Legătură", code: "PUC 04", unit: "buc", start: 0, low: 3 },
  { id: "puc-06", name: "6 Legătură", code: "PUC 06", unit: "buc", start: 0, low: 3 },
  { id: "puc-08", name: "8 Legătură", code: "PUC 08", unit: "buc", start: 0, low: 3 },
  { id: "pcci-10-12", name: "10 Drept 1/2", code: "PCCI 10-12", unit: "buc", start: 0, low: 3 },
  { id: "ptci-12-38", name: "12 T 3/8", code: "PTCI 12-38", unit: "buc", start: 0, low: 3 },
  { id: "py-06", name: "6 Y", code: "PY 06", unit: "buc", start: 0, low: 3 },
  // Row E
  { id: "ptci-04-m5", name: "4 T M5", code: "PTCI 04-M5", unit: "buc", start: 0, low: 3 },
  { id: "ptci-06-18", name: "6 T 1/8", code: "PTCI 06-18", unit: "buc", start: 0, low: 3 },
  { id: "ptci-08-18", name: "8 T 1/8", code: "PTCI 08-18", unit: "buc", start: 0, low: 3 },
  { id: "puc-10", name: "10 Legătură", code: "PUC 10", unit: "buc", start: 0, low: 3 },
  { id: "put-12", name: "12 T simplu", code: "PUT 12", unit: "buc", start: 0, low: 3 },
  { id: "pul-08", name: "8 L", code: "PUL 08", unit: "buc", start: 0, low: 3 },
  // Row F
  { id: "ptci-04-18", name: "4 T 1/8", code: "PTCI 04-18", unit: "buc", start: 0, low: 3 },
  { id: "ptci-06-14", name: "6 T 1/4", code: "PTCI 06-14", unit: "buc", start: 0, low: 3 },
  { id: "ptci-08-14", name: "8 T 1/4", code: "PTCI 08-14", unit: "buc", start: 0, low: 3 },
  { id: "ptci-10-38", name: "10 T 3/8", code: "PTCI 10-38", unit: "buc", start: 0, low: 3 },
  { id: "plci-12-14", name: "12 Cot 1/4", code: "PLCI 12-14", unit: "buc", start: 0, low: 3 },
  { id: "py-08", name: "8 Y", code: "PY 08", unit: "buc", start: 0, low: 3 },
  // Row G
  { id: "plci-04-m5", name: "4 Cot M5", code: "PLCI 04-M5", unit: "buc", start: 0, low: 3 },
  { id: "ptci-06-38", name: "6 T 3/8", code: "PTCI 06-38", unit: "buc", start: 0, low: 3 },
  { id: "put-08", name: "8 T simplu", code: "PUT 08", unit: "buc", start: 0, low: 3 },
  { id: "put-10", name: "10 T simplu", code: "PUT 10", unit: "buc", start: 0, low: 3 },
  { id: "plci-12-38", name: "12 Cot 3/8", code: "PLCI 12-38", unit: "buc", start: 0, low: 3 },
  { id: "pul-10", name: "10 L", code: "PUL 10", unit: "buc", start: 0, low: 3 },
  // Row H
  { id: "put-04", name: "4 T simplu", code: "PUT 04", unit: "buc", start: 0, low: 3 },
  { id: "plci-06-18", name: "6 Cot 1/8", code: "PLCI 06-18", unit: "buc", start: 0, low: 3 },
  { id: "plci-08-18", name: "8 Cot 1/8", code: "PLCI 08-18", unit: "buc", start: 0, low: 3 },
  { id: "plci-10-14", name: "10 Cot 1/4", code: "PLCI 10-14", unit: "buc", start: 0, low: 3 },
  { id: "reserve-h5", name: "Liber · rezervă", code: null, unit: "buc", start: 0, low: 0 },
  { id: "py-10", name: "10 Y", code: "PY 10", unit: "buc", start: 0, low: 3 },
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
