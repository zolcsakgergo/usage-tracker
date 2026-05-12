// Maps each compartment slot (0..71) to a static image file in /public/items/.
// Source mapping was provided per-slot (A1..L6) and is purely positional —
// it has nothing to do with item identity, so we resolve by slot index.

import { slotFor } from "./i18n";

const SLOT_TO_IMAGE: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  const set = (slots: string[], file: string) => slots.forEach((s) => (map[s] = file));

  set(
    ["A1", "A2", "A3", "A4", "A5",
     "B1", "B2", "B3", "B4", "B5",
     "C2", "C3", "C4", "C5"],
    "yellow.jpeg"
  );
  set(
    ["C1",
     "D1", "D2", "D3", "D4", "D5",
     "E1", "E2", "E3", "E4", "E5"],
    "blue.jpeg"
  );
  set(["F1", "F2", "F3", "F4", "F5"], "darkgreen.jpeg");
  set(["G1", "G2", "G3", "G4", "G5"], "orange.jpeg");
  set(
    ["H1", "H2", "H3", "H4", "H5",
     "I1", "I2", "I3", "I4", "I5",
     "J1", "J2", "J3", "J4", "J5"],
    "lightgreen.jpeg"
  );
  set(["K1", "K2", "K3", "K4", "K5"], "brown.jpeg");
  set(["L1", "L2", "L3", "L4", "L5"], "red.jpeg");
  set(["A6", "B6", "C6", "D6"], "lightblue.jpeg");
  set(["J6", "K6", "L6"], "black.jpeg");
  set(["E6", "F6", "G6", "H6", "I6"], "grey.jpeg");

  return map;
})();

export function imageForSlot(slot: number): string | null {
  const label = slotFor(slot);
  const file = SLOT_TO_IMAGE[label];
  return file ? `/items/${file}` : null;
}
