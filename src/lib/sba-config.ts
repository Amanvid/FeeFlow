"use server";

import { GoogleSheetsService } from "./google-sheets";

export interface SBAConfig {
  campus: string;
  totalAttendance: number;
  closingTerm: string;
  nextTermBegins: string;
  termName: string;
  position: string;
  includePosition: boolean;
  feesByGroup?: Record<string, number>;
  totalScoreByGroup?: Record<string, number>;
}

export async function getSBAConfig(): Promise<SBAConfig> {
  const defaults: SBAConfig = {
    campus: "Duase",
    totalAttendance: 65,
    closingTerm: "17-Apr-25",
    nextTermBegins: "12-May-25",
    termName: "Second",
    position: "4th",
    includePosition: true,
    feesByGroup: {},
    totalScoreByGroup: {}
  };

  try {
    const sheets = new GoogleSheetsService();
    const result = await sheets.getSheetData("SBA Config");
    if (!result.success || !result.data || result.data.length === 0) {
      return defaults;
    }

    const rows: any[][] = result.data;
    const config: SBAConfig = { ...defaults };

    const normalizeHeader = (s: string) =>
      s.replace(/:/g, "").replace(/\s+/g, " ").trim().toLowerCase();

    if (rows.length >= 2 && Array.isArray(rows[0]) && rows[0].length > 1) {
      const headers = rows[0].map((h: any) => String(h || "").trim());
      const values = rows[1];
      const idx = (names: string[]) => {
        const normalized = headers.map((h) => normalizeHeader(h));
        for (const name of names) {
          const i = normalized.findIndex((h) => h === normalizeHeader(name));
          if (i >= 0) return i;
        }
        return -1;
      };

      const campusIdx = idx(["Campus"]);
      const attIdx = idx(["Total Attendance"]);
      const closingIdx = idx(["Closing Term", "Closing Date"]);
      const nextIdx = idx(["Next Term Begins"]);
      const termIdx = idx(["Term", "Semester / Term"]);
      const includePosIdx = idx(["To include Position"]);

      if (campusIdx >= 0) config.campus = String(values[campusIdx] || config.campus).trim();
      if (attIdx >= 0) {
        const n = Number(String(values[attIdx] || "").replace(/[^\d.]/g, ""));
        config.totalAttendance = Number.isFinite(n) && n > 0 ? n : config.totalAttendance;
      }
      if (closingIdx >= 0) config.closingTerm = String(values[closingIdx] || config.closingTerm).trim();
      if (nextIdx >= 0) config.nextTermBegins = String(values[nextIdx] || config.nextTermBegins).trim();
      if (termIdx >= 0) config.termName = String(values[termIdx] || config.termName).trim();
      if (includePosIdx >= 0) {
        const v = String(values[includePosIdx] || "").trim();
        config.includePosition = /^(yes|true|1)$/i.test(v);
      }

      const normalizedHeaders = headers.map((h) => normalizeHeader(h));
      const feeGroups: Record<string, number> = {};
      for (let i = 0; i < normalizedHeaders.length; i++) {
        const h = normalizedHeaders[i];
        const valStr = String(values[i] || "").trim();
        const valNum = Number(valStr.replace(/[^\d.]/g, ""));
        if (!Number.isFinite(valNum) || valNum <= 0) continue;
        if (h.includes("creche")) feeGroups["Creche"] = valNum;
        else if (h.includes("nursery") && h.includes("1") && h.includes("2")) feeGroups["Nursery 1 & 2"] = valNum;
        else if (h.includes("kg") && h.includes("1") && h.includes("2")) feeGroups["KG 1 & 2"] = valNum;
        else if (h.includes("bs") && ((h.includes("1") && h.includes("3")) || h.includes("1 to 3") || h.includes("1-3"))) feeGroups["BS 1 to 3"] = valNum;
        else if (h.includes("bs") && ((h.includes("4") && h.includes("6")) || h.includes("4 to 6") || h.includes("4-6"))) feeGroups["BS 4 to 6"] = valNum;
      }
      if (Object.keys(feeGroups).length > 0) config.feesByGroup = feeGroups;
    }

    // Fallback: scan for a dedicated fees header row elsewhere in the sheet
    const findFeesFromSheet = () => {
      for (let r = 0; r < rows.length - 1; r++) {
        const hdrRow = rows[r] || [];
        const valRow = rows[r + 1] || [];
        if (!hdrRow || hdrRow.length === 0) continue;
        const normalizedHeaders = hdrRow.map((h: any) => normalizeHeader(String(h || "")));
        const hasGroupHints =
          normalizedHeaders.some((h) => h.includes("creche")) ||
          normalizedHeaders.some((h) => h.includes("nursery")) ||
          normalizedHeaders.some((h) => h.includes("kg")) ||
          normalizedHeaders.some((h) => h.includes("bs"));
        if (!hasGroupHints) continue;
        const feeGroups: Record<string, number> = {};
        for (let i = 0; i < normalizedHeaders.length; i++) {
          const h = normalizedHeaders[i];
          const valStr = String(valRow[i] || "").trim();
          const valNum = Number(valStr.replace(/[^\d.]/g, ""));
          if (!Number.isFinite(valNum) || valNum <= 0) continue;
          if (h.includes("creche")) feeGroups["Creche"] = valNum;
          else if (h.includes("nursery") && (h.includes("1") || h.includes("one")) && (h.includes("2") || h.includes("two")))
            feeGroups["Nursery 1 & 2"] = valNum;
          else if (h.includes("kg") && (h.includes("1") || h.includes("one")) && (h.includes("2") || h.includes("two")))
            feeGroups["KG 1 & 2"] = valNum;
          else if (h.includes("bs") && (h.includes("1 to 3") || (h.includes("1") && h.includes("3")) || h.includes("1-3")))
            feeGroups["BS 1 to 3"] = valNum;
          else if (h.includes("bs") && (h.includes("4 to 6") || (h.includes("4") && h.includes("6")) || h.includes("4-6")))
            feeGroups["BS 4 to 6"] = valNum;
        }
        if (Object.keys(feeGroups).length > 0) {
          config.feesByGroup = feeGroups;
          return true;
        }
      }
      return false;
    };
    findFeesFromSheet();

    for (const row of rows) {
      const cell = String((row && row[0]) || "").trim();
      if (!cell) continue;

      const normalize = (s: string) => s.replace(/\s+/g, " ").trim();
      const valueAfterColon = (s: string) => normalize(s.split(":").slice(1).join(":")).trim();

      if (/^Campus\b/i.test(cell)) {
        config.campus = cell.includes(":") ? valueAfterColon(cell) : normalize(cell.replace(/^Campus\b/i, ""));
      } else if (/^Total Attendance\b/i.test(cell)) {
        const numMatch = cell.match(/(\d+)/);
        config.totalAttendance = numMatch ? Number(numMatch[1]) : defaults.totalAttendance;
      } else if (/^(Closing Term|Closing Date)\b/i.test(cell)) {
        config.closingTerm = cell.includes(":") ? valueAfterColon(cell) : normalize(cell.replace(/^(Closing Term|Closing Date)\b/i, ""));
      } else if (/^Next Term Begins\b/i.test(cell)) {
        config.nextTermBegins = cell.includes(":") ? valueAfterColon(cell) : normalize(cell.replace(/^Next Term Begins\b/i, ""));
      } else if (/^(Semester|Term|Semester \/ Term)\b/i.test(cell)) {
        config.termName = cell.includes(":") ? valueAfterColon(cell) : normalize(cell.replace(/^(Semester|Term|Semester \/ Term)\b/i, ""));
      } else if (/^Position\b/i.test(cell)) {
        config.position = cell.includes(":") ? valueAfterColon(cell) : normalize(cell.replace(/^Position\b/i, ""));
      } else if (/^To include Position\b/i.test(cell)) {
        const v = cell.includes(":") ? valueAfterColon(cell) : normalize(cell.replace(/^To include Position\b/i, ""));
        config.includePosition = /^(yes|true|1)$/i.test(v);
      }
    }

    try {
      const totalsRange = await sheets.getSheetData("SBA Config", "N1:Q3");
      if (totalsRange.success && totalsRange.data && totalsRange.data.length >= 2) {
        const headerRow = totalsRange.data[0] as any[];
        const valuesRow = totalsRange.data[1] as any[];
        const map: Record<string, number> = {};
        for (let i = 0; i < headerRow.length; i++) {
          const keyRaw = String(headerRow[i] || "").trim();
          const valRaw = String(valuesRow[i] || "").trim();
          const key = keyRaw.toLowerCase();
          const val = Number(valRaw.replace(/[^\d.]/g, ""));
          if (!key || !Number.isFinite(val) || val <= 0) continue;
          if (key.includes("creche")) map["Creche"] = val;
          else if (key.includes("nursery")) map["Nursery 1 & 2"] = val;
          else if (key.includes("kg")) map["KG 1 & 2"] = val;
          else if (key.includes("bs")) map["BS 1 to 6"] = val;
        }
        if (Object.keys(map).length > 0) {
          defaults.totalScoreByGroup = map;
          (config as SBAConfig).totalScoreByGroup = map;
        }
      }
    } catch {}

    return config;
  } catch (error) {
    console.error("Error fetching SBA Config:", error);
    return defaults;
  }
}
