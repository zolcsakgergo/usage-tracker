// Shared CSV column contract + parser for the Articole bulk import/export.
// Kept free of Next-only imports so it can run in the browser (import parsing)
// and on the server (export building).

export const ITEM_CSV_COLUMNS = [
  { key: "id", header: "id" },
  { key: "slot", header: "Slot" },
  { key: "name", header: "Nume" },
  { key: "code", header: "Cod" },
  { key: "accountingCode", header: "Cod Contabilitate" },
  { key: "unit", header: "Unitate" },
  { key: "count", header: "Stoc" },
  { key: "low", header: "Prag alarmă" },
] as const;

export type ItemCsvKey = (typeof ITEM_CSV_COLUMNS)[number]["key"];

// "A1" -> 0, "L6" -> 71. Returns null for anything malformed.
export function slotToIndex(label: string): number | null {
  const m = /^\s*([A-Za-z])\s*([0-9]{1,2})\s*$/.exec(label);
  if (!m) return null;
  const row = m[1].toUpperCase().charCodeAt(0) - 65;
  const col = Number(m[2]) - 1;
  if (row < 0 || col < 0 || col > 5) return null;
  return row * 6 + col;
}

// One parsed, format-validated row from the uploaded file.
export type ParsedItemRow = {
  rowNum: number; // 1-based, counting the header as row 1
  id: string;
  slot: string;
  slotIndex: number;
  name: string;
  code: string | null;
  accountingCode: string | null;
  unit: string;
  count: number;
  low: number;
};

export type ParseResult = {
  rows: ParsedItemRow[];
  errors: string[];
};

// Minimal RFC-4180-ish parser that also tolerates Excel quirks:
//  - leading UTF-8 BOM
//  - ';' delimiter (Romanian-locale Excel) auto-detected from the header line
//  - quoted fields with embedded delimiters/newlines and "" escapes
//  - CRLF or LF line endings
function parseDelimited(text: string): string[][] {
  let s = text;
  if (s.charCodeAt(0) === 0xfeff) s = s.slice(1); // strip BOM

  const headerLine = s.slice(0, s.search(/\r?\n/) === -1 ? s.length : s.search(/\r?\n/));
  const delimiter = headerLine.split(";").length > headerLine.split(",").length ? ";" : ",";

  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inQuotes) {
      if (c === '"') {
        if (s[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
      continue;
    }
    if (c === '"') {
      inQuotes = true;
    } else if (c === delimiter) {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      field = "";
      row = [];
    } else if (c === "\r") {
      // swallow; the following \n closes the row
    } else {
      field += c;
    }
  }
  // flush trailing field/row if the file didn't end with a newline
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function nonNegInt(raw: string): number | null {
  const t = raw.trim();
  if (t === "") return null;
  // accept "5" / "5.0" but reject "abc", negatives, fractions
  if (!/^\d+(\.0+)?$/.test(t)) return null;
  return Math.trunc(Number(t));
}

export function parseItemsCsv(text: string): ParseResult {
  const grid = parseDelimited(text);
  const errors: string[] = [];
  if (grid.length === 0) {
    return { rows: [], errors: ["Fișierul este gol."] };
  }

  const header = grid[0].map((h) => h.trim());
  const colIndex: Partial<Record<ItemCsvKey, number>> = {};
  for (const { key, header: name } of ITEM_CSV_COLUMNS) {
    const idx = header.findIndex((h) => h.toLowerCase() === name.toLowerCase());
    if (idx !== -1) colIndex[key] = idx;
  }

  const required: ItemCsvKey[] = ["slot", "name", "unit", "count", "low"];
  const missing = required.filter((k) => colIndex[k] === undefined);
  if (missing.length > 0) {
    const labels = missing.map(
      (k) => ITEM_CSV_COLUMNS.find((c) => c.key === k)!.header
    );
    return {
      rows: [],
      errors: [`Lipsesc coloanele obligatorii: ${labels.join(", ")}.`],
    };
  }

  const get = (cells: string[], key: ItemCsvKey): string => {
    const i = colIndex[key];
    return i === undefined ? "" : (cells[i] ?? "").trim();
  };

  const rows: ParsedItemRow[] = [];
  const seenSlots = new Set<string>();

  for (let r = 1; r < grid.length; r++) {
    const cells = grid[r];
    // skip fully empty lines
    if (cells.every((c) => c.trim() === "")) continue;
    const rowNum = r + 1;

    const slot = get(cells, "slot");
    const slotIndex = slotToIndex(slot);
    if (slotIndex === null) {
      errors.push(`Rândul ${rowNum}: slot invalid „${slot}”.`);
      continue;
    }
    const slotKey = slot.toUpperCase().replace(/\s+/g, "");
    if (seenSlots.has(slotKey)) {
      errors.push(`Rândul ${rowNum}: slot duplicat „${slot}”.`);
      continue;
    }
    seenSlots.add(slotKey);

    const name = get(cells, "name");
    if (name === "") {
      errors.push(`Rândul ${rowNum} (${slot}): numele nu poate fi gol.`);
      continue;
    }
    const unit = get(cells, "unit");
    if (unit === "") {
      errors.push(`Rândul ${rowNum} (${slot}): unitatea nu poate fi goală.`);
      continue;
    }

    const count = nonNegInt(get(cells, "count"));
    if (count === null) {
      errors.push(
        `Rândul ${rowNum} (${slot}): stocul trebuie să fie un număr întreg ≥ 0.`
      );
      continue;
    }
    const low = nonNegInt(get(cells, "low"));
    if (low === null) {
      errors.push(
        `Rândul ${rowNum} (${slot}): pragul de alarmă trebuie să fie un număr întreg ≥ 0.`
      );
      continue;
    }

    const code = get(cells, "code");
    const accountingCode = get(cells, "accountingCode");

    rows.push({
      rowNum,
      id: get(cells, "id"),
      slot,
      slotIndex,
      name,
      code: code === "" ? null : code,
      accountingCode: accountingCode === "" ? null : accountingCode,
      unit,
      count,
      low,
    });
  }

  return { rows, errors };
}
