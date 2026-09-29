/**
 * Minimal dependency-free CSV helpers (RFC 4180 style).
 *
 * Handles quoted fields, escaped quotes (""), embedded commas/newlines,
 * BOM stripping and both CRLF / LF line endings.
 */

/**
 * Split raw CSV text into an array of string arrays.
 * @param {string} text
 * @returns {string[][]}
 */
const splitRecords = (text) => {
  const records = [];
  let record = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      record.push(field);
      field = "";
    } else if (char === "\r") {
      // swallow, the \n that follows terminates the record
    } else if (char === "\n") {
      record.push(field);
      records.push(record);
      record = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field !== "" || record.length > 0) {
    record.push(field);
    records.push(record);
  }

  return records;
};

/**
 * Parse CSV text into headers + row objects keyed by header.
 * Fully blank lines are skipped, and each row keeps the physical line number
 * (1-based, header included) so errors can be reported back to the uploader.
 *
 * @param {string} text
 * @returns {{ headers: string[], rows: Array<{ lineNumber: number, values: Record<string,string> }> }}
 */
export const parseCSV = (text = "") => {
  const clean = text.replace(/^﻿/, "");
  const records = splitRecords(clean);

  if (records.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = records[0].map((h) => h.trim());
  const rows = [];

  for (let i = 1; i < records.length; i++) {
    const record = records[i];
    const isBlank = record.every((cell) => cell.trim() === "");
    if (isBlank) continue;

    const values = {};
    headers.forEach((header, index) => {
      values[header] = (record[index] ?? "").trim();
    });
    rows.push({ lineNumber: i + 1, values });
  }

  return { headers, rows };
};

/**
 * Escape a single CSV cell.
 * @param {unknown} value
 * @returns {string}
 */
const escapeCell = (value) => {
  const str = value === null || value === undefined ? "" : String(value);
  return /[",\r\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
};

/**
 * Serialise an array of objects into CSV text.
 * @param {string[]} headers
 * @param {Array<Record<string, unknown>>} rows
 * @returns {string}
 */
export const toCSV = (headers, rows = []) => {
  const lines = [headers.map(escapeCell).join(",")];
  rows.forEach((row) => {
    lines.push(headers.map((header) => escapeCell(row[header])).join(","));
  });
  return lines.join("\r\n");
};
