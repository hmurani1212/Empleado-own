import { getExcelSignature } from "../services/officeSignatureService";

/**
 * Appends an "Excel signature" row (from `get_signature` API) to an ExcelJS worksheet.
 * @param {import('exceljs').Worksheet} sheet
 * @param {number} mergeAcrossColumns 1-based column count to merge (signature spans full width)
 */
export async function appendExcelSignatureRowExcelJS(sheet, mergeAcrossColumns) {
  const text = await getExcelSignature();
  if (!sheet || !text) return;

  const cols = Math.max(1, parseInt(String(mergeAcrossColumns), 10) || 1);

  sheet.addRow([]);
  const spacer = sheet.addRow([]);
  spacer.height = 4;

  const row = sheet.addRow([]);
  const rowNumber = row.number;
  sheet.getRow(rowNumber).height = 32;

  if (cols > 1) {
    try {
      sheet.mergeCells(rowNumber, 1, rowNumber, cols);
    } catch {
      /* ignore invalid merge */
    }
  }

  const cell = sheet.getCell(rowNumber, 1);
  cell.value = {
    richText: [
      {
        font: { name: "Calibri", bold: true, size: 16, color: { argb: "FF0F172A" } },
        text: "Signature: ",
      },
      {
        font: { name: "Calibri", bold: true, size: 16, color: { argb: "FF0F172A" } },
        text,
      },
    ],
  };
  cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
}

/**
 * Appends an "Excel signature" row to the first column of a SheetJS workbook sheet.
 * @param {typeof import('xlsx')} XLSX
 * @param {import('xlsx').WorkBook} workbook
 * @param {string} [sheetName] defaults to first sheet
 */
export async function appendExcelSignatureRowXLSX(XLSX, workbook, sheetName) {
  const text = await getExcelSignature();
  if (!text || !workbook?.SheetNames?.length) return;

  const name = sheetName || workbook.SheetNames[0];
  const ws = workbook.Sheets[name];
  if (!ws) return;

  const display = `Signature: ${text}`;

  if (!ws["!ref"]) {
    ws.A1 = { t: "s", v: display };
    ws["!ref"] = "A1";
    return;
  }

  const range = XLSX.utils.decode_range(ws["!ref"]);
  const newR = range.e.r + 2;
  const cellRef = XLSX.utils.encode_cell({ r: newR, c: 0 });
  ws[cellRef] = { t: "s", v: display };
  range.e.r = newR;
  ws["!ref"] = XLSX.utils.encode_range(range);
}
