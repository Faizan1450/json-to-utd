const asyncHandler = require('express-async-handler');

const verifyMultiReceivers = asyncHandler(async (iflowJson, worksheet, headers) => {
    const iflowIdInput = iflowJson.iflowIdInput.trim().toLowerCase();
    let SENDER_INTERFACE_KEY = "";
    if (iflowIdInput.includes('_la_')) {
        SENDER_INTERFACE_KEY = process.env.SENDER_INTERFACE_LA;
    } else {
        SENDER_INTERFACE_KEY = process.env.SENDER_INTERFACE_NA;
    }
    let SENDER_INTERFACE_NAME = iflowJson[SENDER_INTERFACE_KEY];

    // Column index is 1‑based in exceljs
    const idColIndex = headers.findIndex(h =>
        h === SENDER_INTERFACE_KEY
    );
    if (idColIndex === -1) {
        const error = new Error(`❌ Column "${columnName}" not found in sheet.`);
        throw error;
    }

    let resJson = [];
    worksheet.eachRow({ includeEmpty: false }, (row) => {
        const cellVal = (row.getCell(idColIndex).value || '').toString().trim()?.toLowerCase();

        if (cellVal === SENDER_INTERFACE_NAME.toLowerCase()) {
            const obj = {};
            row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
                const header = headers[colNumber] || '';
                obj[header] = cell.value ? cell.value.toString() : '';
            });
            resJson.push(obj);
        }
    });

    let isMultiReceiver = false;

    // check in resJson indexs is any key has Descoped or descope value in any lower or upper case then remove it from array  
    resJson = resJson.filter(item => {
        return !Object.values(item).some(value => {
            return typeof value === 'string' && value.toLowerCase() === 'descoped';
        });
    });

    if (!resJson) {
        throw new Error(`❌ No match found for iFlow ID "${iflowIdInput}" Or Its Descoped`);
    }

    if (resJson.length >= 2) {
        isMultiReceiver = true;
    }

    return { isMultiReceiver, resJson };
});

module.exports = verifyMultiReceivers;