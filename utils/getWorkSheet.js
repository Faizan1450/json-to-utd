const asyncHandler = require("express-async-handler");
const ExcelJS = require('exceljs');
const fs = require('fs');

const getWorkSheet = asyncHandler(async () => {
    // Fetch Excel sheet path
    const filePath = process.env.XLSX_PATH;
    if (!filePath || !fs.existsSync(filePath)) {
        const error = new Error(`File not found: ${filePath}`);
        throw error;
    }

    const sheetNameLA = process.env.SHEET_NAME_LA;
    const sheetNameNA = process.env.SHEET_NAME_NA;

    /* -------------------------------------------------- */
    /* 2. Load workbook & sheet                           */
    /* -------------------------------------------------- */
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const worksheetLA = workbook.getWorksheet(sheetNameLA);
    if (!worksheetLA) {
        const error = new Error(`Sheet "${sheetNameLA}" not found.`);
        throw error;
    }

    const worksheetNA = workbook.getWorksheet(sheetNameNA);
    if (!worksheetNA) {
        const error = new Error(`Sheet "${sheetNameNA}" not found.`);
        throw error;
    }

    return {NA:worksheetNA, LA:worksheetLA};
});

module.exports = getWorkSheet;