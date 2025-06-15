const asyncHandler = require('express-async-handler');

const searchIflow2 = asyncHandler(async (iflows, sheet, grouped) => {

  if (!grouped) {
    iflows = [iflows];
  }
  let resJson = [];
  iflows.forEach(iflow => {
    const iflowIdInput = iflow.trim().toLowerCase();
    if (!iflowIdInput) {
      const error = new Error("Iflow name is required");
      error.status = 400; // Bad Request
      throw error;
    }

    // check that iflowIdInput string contains _NA_ or _LA_
    if (iflowIdInput.includes('_la_')) {
      worksheet = sheet.LA
      columnName = process.env.COLUMN_NAME_LA.toUpperCase();
    } else {
      worksheet = sheet.NA;
      columnName = process.env.COLUMN_NAME_NA.toUpperCase();
    }

    if (!worksheet || !columnName) {
      const error = new Error("Something went wrong with Worksheet or Column Name");
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
    const iflowIndex = headers.findIndex(h =>
      h === columnName
    );
    if (iflowIndex === -1) {
      const error = new Error(`❌ Column "${columnName}" not found in sheet.`);
      throw error;
    }

    /* -------------------------------------------------- */
    /* 4. Iterate rows until match                        */
    /* -------------------------------------------------- */


    worksheet.eachRow({ includeEmpty: false }, (row) => {
      const cellVal = (row.getCell(iflowIndex).value || '').toString().trim()?.toLowerCase();
      if (cellVal === iflowIdInput) {
        const obj = {};
        row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
          const header = headers[colNumber] || '';
          obj[header] = cell.value ? cell.value.toString() : '';
        });
        resJson.push(obj);
      }
    });
  })

  /* -------------------------------------------------- */
  /* 5. Outcome                                         */
  /* -------------------------------------------------- */
  if (!resJson) {
    throw new Error(`❌ No match found for iFlow ID "${iflowIdInput}" Or Its Descoped`);
  }

  return resJson;
});

module.exports = searchIflow2;