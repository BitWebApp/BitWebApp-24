import ExcelJS from "exceljs";
import { parseCSV } from "./csv.js";

/** Text of an Excel cell, whatever it holds (rich text, numbers, links). */
const cellText = (cell) => {
  const value = cell.value;
  if (value === null || value === undefined) return "";
  if (typeof value === "object") {
    if (value.richText) return value.richText.map((part) => part.text).join("");
    if (value.text !== undefined) return String(value.text);
    if (value.result !== undefined) return String(value.result);
    if (value instanceof Date) return value.toISOString();
  }
  return String(value);
};

/**
 * Read the first sheet of an .xlsx file, or a .csv file, into the same shape
 * parseCSV returns: headers from the first row and one object per data row,
 * keyed by header, with blank rows skipped.
 *
 * @param {Buffer} buffer
 * @param {string} fileName used to tell .xlsx from .csv
 * @returns {Promise<{ headers: string[], rows: Array<{ lineNumber: number, values: Record<string,string> }> }>}
 */
export const readSpreadsheet = async (buffer, fileName = "") => {
  if (/\.csv$/i.test(fileName)) {
    return parseCSV(buffer.toString("utf-8"));
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const sheet = workbook.worksheets[0];
  if (!sheet) return { headers: [], rows: [] };

  const headerRow = sheet.getRow(1);
  const headers = [];
  headerRow.eachCell({ includeEmpty: true }, (cell, column) => {
    headers[column - 1] = cellText(cell).trim();
  });

  const rows = [];
  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return;
    const values = {};
    headers.forEach((header, index) => {
      if (header) values[header] = cellText(row.getCell(index + 1)).trim();
    });
    if (Object.values(values).some((v) => v !== "")) {
      rows.push({ lineNumber: rowNumber, values });
    }
  });

  return { headers: headers.filter(Boolean), rows };
};
