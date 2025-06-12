const asyncHandler = require('express-async-handler');
const ExcelJS = require('exceljs');
const fs = require('fs');

const searchIflow = asyncHandler(async (iflow) => {
  const iflowIdInput = iflow.trim().toLowerCase();
  if (!iflowIdInput) {
    const error = new Error("Iflow name is required");
    error.status = 400; // Bad Request
    throw error;
  }
 
  // Fetch Excel sheet path
  const filePath = process.env.XLSX_PATH;
  if (!filePath || !fs.existsSync(filePath)) {
    const error = new Error(`File not found: ${filePath}`);
    throw error;
  }

  // check that iflowIdInput string contains _NA_ or _LA_
  let sheetName = "";
  let columnName = "";
  if (iflowIdInput.includes('_la_')) {
    sheetName = process.env.SHEET_NAME_LA;
    columnName = process.env.COLUMN_NAME_LA.toUpperCase();
  } else {
    sheetName = process.env.SHEET_NAME_NA;
    columnName = process.env.COLUMN_NAME_NA.toUpperCase();
  }

  if (!sheetName || !columnName) {
    const error = new Error("Something went wrong with Sheet or Column Name");
    throw error;
  }

  /* -------------------------------------------------- */
  /* 2. Load workbook & sheet                           */
  /* -------------------------------------------------- */
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const worksheet = workbook.getWorksheet(sheetName);
  if (!worksheet) {
    const error = new Error(`Sheet "${sheetName}" not found.`);
    throw error;
  }

  /* -------------------------------------------------- */
  /* 3. Build header map (row 1)                        */
  /* -------------------------------------------------- */
  const headerRow = worksheet.getRow(1);
  const headers = headerRow.values.map(v => {
    if (v?.toString().trim()) {
      return v.toString().trim().toUpperCase();
    }
  });
  // Column index is 1‑based in exceljs
  const idColIndex = headers.findIndex(h =>
    h === columnName
  );
  if (idColIndex === -1) {
    const error = new Error(`❌ Column "${columnName}" not found in sheet.`);
    throw error;
  }

  /* -------------------------------------------------- */
  /* 4. Iterate rows until match                        */
  /* -------------------------------------------------- */
  let foundRow = null;
  let multipleHits = false;

  worksheet.eachRow({ includeEmpty: false }, (row) => {
    const cellVal = (row.getCell(idColIndex).value || '').toString().trim()?.toLowerCase();

    if (cellVal === iflowIdInput) {
      if (foundRow) {
        multipleHits = true;
        return;
      }
      const obj = {};
      row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
        const header = headers[colNumber] || '';
        obj[header] = cell.value ? cell.value.toString() : '';
      });
      foundRow = obj;
    }
  });

  /* -------------------------------------------------- */
  /* 5. Outcome                                         */
  /* -------------------------------------------------- */
  if (!foundRow) {
    throw new Error(`❌ No match found for iFlow ID "${iflowIdInput}"`);
  }
  if (multipleHits) {
    throw new Error(`❌ Multiple matches found for iFlow ID "${iflowIdInput}"`);
  }
  foundRow.iflowIdInput = iflowIdInput; // Add the iflowIdInput to the found row
  return { foundRow, worksheet, headers, iflowIdInput };
});

module.exports = searchIflow;