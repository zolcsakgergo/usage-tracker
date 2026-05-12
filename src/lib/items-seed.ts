// 72-compartment layout (6 columns × 12 drawers) — Racorduri pneumatice Legris.

export type SeedItem = {
  id: string;
  name: string;
  code: string | null;
  unit: string;
  start: number;
  low: number;
};

const base = { code: null, unit: "buc", start: 0, low: 3 } as const;

export const DEFAULT_ITEMS: SeedItem[] = [
  // Row A
  { ...base, id: "drept-04-18", name: "4 Drept 1/8" },
  { ...base, id: "drept-06-18", name: "6 Drept 1/8" },
  { ...base, id: "drept-08-18", name: "8 Drept 1/8" },
  { ...base, id: "drept-10-18", name: "10 Drept 1/8" },
  { ...base, id: "drept-12-18", name: "12 Drept 1/8" },
  { ...base, id: "reductie-d6-d4", name: "REDUCTIE D6-D4" },
  // Row B
  { ...base, id: "drept-04-14", name: "4 Drept 1/4" },
  { ...base, id: "drept-06-14", name: "6 Drept 1/4" },
  { ...base, id: "drept-08-14", name: "8 Drept 1/4" },
  { ...base, id: "drept-10-14", name: "10 Drept 1/4" },
  { ...base, id: "drept-12-14", name: "12 Drept 1/4" },
  { ...base, id: "reductie-d8-d6", name: "REDUCTIE D8-D6" },
  // Row C
  { ...base, id: "cot-04-18", name: "4 COT 1/8" },
  { ...base, id: "drept-06-38", name: "6 Drept 3/8" },
  { ...base, id: "drept-08-38", name: "8 Drept 3/8" },
  { ...base, id: "drept-10-38", name: "10 Drept 3/8" },
  { ...base, id: "drept-12-38", name: "12 Drept 3/8" },
  { ...base, id: "reductie-d10-d8", name: "REDUCTIE D10-D8" },
  // Row D
  { ...base, id: "cot-04-38", name: "4 COT 3/8" },
  { ...base, id: "cot-06-38", name: "6 COT 3/8" },
  { ...base, id: "cot-08-38", name: "8 COT 3/8" },
  { ...base, id: "cot-10-38", name: "10 COT 3/8" },
  { ...base, id: "cot-12-38", name: "12 COT 3/8" },
  { ...base, id: "reductie-d12-d10", name: "REDUCTIE D12-D10" },
  // Row E
  { ...base, id: "cot-04-14", name: "4 COT 1/4" },
  { ...base, id: "cot-06-14", name: "6 COT 1/4" },
  { ...base, id: "cot-08-14", name: "8 COT 1/4" },
  { ...base, id: "cot-10-14", name: "10 COT 1/4" },
  { ...base, id: "cot-12-14", name: "12 COT 1/4" },
  { ...base, id: "dop-d4", name: "DOP D4" },
  // Row F
  { ...base, id: "cot-04-egal", name: "4 COT 4 EGAL" },
  { ...base, id: "cot-06-egal", name: "6 COT 4 EGAL" },
  { ...base, id: "cot-08-egal", name: "8 COT 4 EGAL" },
  { ...base, id: "cot-10-egal", name: "10 COT 4 EGAL" },
  { ...base, id: "cot-12-egal", name: "12 COT 4 EGAL" },
  { ...base, id: "dop-d6", name: "DOP D6" },
  // Row G
  { ...base, id: "y-04", name: "4 distribuitor Y" },
  { ...base, id: "y-06", name: "6 distribuitor Y" },
  { ...base, id: "y-08", name: "8 distribuitor Y" },
  { ...base, id: "y-10", name: "10 distribuitor Y" },
  { ...base, id: "y-12", name: "12 distribuitor Y" },
  { ...base, id: "dop-d8", name: "DOP D8" },
  // Row H
  { ...base, id: "teu-04-18", name: "4 Teu 1/8" },
  { ...base, id: "teu-06-18", name: "6 Teu 1/8" },
  { ...base, id: "teu-08-18", name: "8 Teu 1/8" },
  { ...base, id: "teu-10-18", name: "10 Teu 1/8" },
  { ...base, id: "teu-12-18", name: "12 Teu 1/8" },
  { ...base, id: "dop-d10", name: "DOP D10" },
  // Row I
  { ...base, id: "teu-05-14", name: "5 Teu 1/4" },
  { ...base, id: "teu-06-14", name: "6 Teu 1/4" },
  { ...base, id: "teu-08-14", name: "8 Teu 1/4" },
  { ...base, id: "teu-10-14", name: "10 Teu 1/4" },
  { ...base, id: "teu-12-14", name: "12 Teu 1/4" },
  { ...base, id: "dop-d12", name: "DOP D12" },
  // Row J — note: col 1 and col 2 both labelled "6 Teu 3/8" per source list
  { ...base, id: "teu-06-38-j1", name: "6 Teu 3/8" },
  { ...base, id: "teu-06-38", name: "6 Teu 3/8" },
  { ...base, id: "teu-08-38", name: "8 Teu 3/8" },
  { ...base, id: "teu-10-38", name: "10 Teu 3/8" },
  { ...base, id: "teu-12-38", name: "12 Teu 3/8" },
  { ...base, id: "amortizor-18", name: "AMORTIZOR 1/8" },
  // Row K
  { ...base, id: "teu-simplu-04", name: "4 Teu simplu" },
  { ...base, id: "teu-simplu-06", name: "6 Teu simplu" },
  { ...base, id: "teu-simplu-08", name: "8 Teu simplu" },
  { ...base, id: "teu-simplu-10", name: "10 Teu simplu" },
  { ...base, id: "teu-simplu-12", name: "12 Teu simplu" },
  { ...base, id: "amortizor-14", name: "AMORTIZOR 1/4" },
  // Row L
  { ...base, id: "legatura-04", name: "4 Legatura" },
  { ...base, id: "legatura-06", name: "6 Legatura" },
  { ...base, id: "legatura-08", name: "8 Legatura" },
  { ...base, id: "legatura-10", name: "10 Legatura" },
  { ...base, id: "legatura-12", name: "12 Legatura" },
  { ...base, id: "amortizor-38", name: "AMORTIZOR 3/8" },
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
