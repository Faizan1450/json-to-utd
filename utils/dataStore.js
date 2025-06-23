// dataStore.js  (✔ JS only, no TS)
const ExcelJS = require('exceljs');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

const FILE_PATH = process.env.XLSX_PATH;
const SHEET_LA = process.env.SHEET_NAME_LA;
const SHEET_NA = process.env.SHEET_NAME_NA;

// --- Standard headers you want to see in the final objects -------------
const TARGET_HEADERS = [
    'IDD',
    'DESCRIPTION',
    'RESOURCE',
    'PATTERN',
    'PROCESS_AREA',
    'PACKAGE',
    'IFLOW',
    'SENDER_CHANNEL',
    'SENDER_SERVICE',
    'SENDER_INTERFACE',
    'SENDER_NAMESPACE',
    'OPERATION_MAPPING',
    'RECEIVER_SERVICE',
    'RECEIVER_INTERFACE',
    'RECEIVER_CHANNEL',
];

// --- Possible spellings per sheet --------------------------------------
const HEADER_ALIASES = {
    IDD: ['IDD'],
    DESCRIPTION: ['Description'],
    RESOURCE: ['M.Resource'],
    PATTERN: ['Pattern'],
    PROCESS_AREA: ['ProcessArea', 'L1'],      // <- NA calls it L1
    PACKAGE: ['Package', 'NA Package'],
    IFLOW: ['Iflow', 'NA Iflow'],        // stray space in LA
    SENDER_CHANNEL: ['SENDERCHANNEL'],
    SENDER_SERVICE: ['SenderService', 'SENDERSERVICE'],
    SENDER_INTERFACE: ['SENDERINTERFACENAME/ DocumentType(B2B)', 'SenderInterface (Doc Type)'],
    SENDER_NAMESPACE: ['SENDERINTERFACENS'],
    OPERATION_MAPPING: ['OPERATIONMAPPING'],
    RECEIVER_SERVICE: ['RECEIVERSERVICE'],
    RECEIVER_INTERFACE: ['RECEIVERINTERFACE DocumentType(B2B)', 'RECEIVERINTERFACE (Doc Type)'],
    RECEIVER_CHANNEL: ['Receiver Channel', 'RECEIVERCHANNEL']
};

// ------------------ In-memory stores -----------------------------------
let rows = [];                         // flat list of row objects
let byIflow = new Map();               // Map<string, row[]>
let bySenderInterface = new Map();     // Map<string, row[]>

// ------------------ Helpers --------------------------------------------
function normalise(str = '') {
    return str.replace(/\s+/g, ' ').trim().toUpperCase();  // collapses \n too
}

function addToIndex(map, key, obj) {
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(obj);
}

// ------------------ Loader ---------------------------------------------
async function loadExcelIntoMemory() {
    if (!fs.existsSync(FILE_PATH)) {
        throw new Error(`Excel file not found at ${FILE_PATH}`);
    }

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(FILE_PATH);

    rows = [];
    byIflow.clear();
    bySenderInterface.clear();

    for (const sheetName of [SHEET_LA, SHEET_NA]) {
        const ws = wb.getWorksheet(sheetName);
        if (!ws) throw new Error(`Sheet ${sheetName} not found in workbook`);

        // Map column index → standard header
        const colMap = {};
        ws.getRow(1).eachCell((cell, colNumber) => {
            const hdr = normalise(cell.value);
            for (const stdHdr of TARGET_HEADERS) {
                if (HEADER_ALIASES[stdHdr].some(alias => normalise(alias) === hdr)) {
                    colMap[colNumber] = stdHdr;
                }
            }
        });

        // Guard: every target header must be present in this sheet
        for (const h of TARGET_HEADERS) {
            if (!Object.values(colMap).includes(h)) {
                console.warn(`⚠ ${h} missing in sheet ${sheetName}`);
            }
        }

        // Iterate rows (skip header row = 1)
        ws.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber === 1) return;          // skip header

            const obj = {};   // keep origin if useful
            for (const [col, stdHdr] of Object.entries(colMap)) {
                obj[stdHdr] = (row.getCell(+col).text || '').trim();
            }

            obj.REGION = sheetName.includes('LA') ? 'LA' : 'NA';

            rows.push(obj);
            addToIndex(byIflow, obj.IFLOW.toLowerCase(), obj);
            addToIndex(bySenderInterface, obj.SENDER_INTERFACE.toLowerCase(), obj);
        });
    }

    console.log(`Fetched ${rows.length} rows from workbook ✅`);
}

// ------------------ Public API -----------------------------------------
function getRowsByIflow(iflowName) {
    return byIflow.get(iflowName.toLowerCase()) || [];
}

function getRowsBySenderInterface(senderName, region) {
    const list = bySenderInterface.get(senderName.toLowerCase()) || [];
    if (!region) return list;                       // old behaviour
    const key = region.toUpperCase();              // 'LA' or 'NA'
    return list.filter(r => (r.REGION || '').toUpperCase() === key);
}


// ------------------ Reloder -----------------------------------------

// fs.watch(FILE_PATH, { persistent: false }, async (evt) => {
//     if (evt === 'change') {
//         console.log('Workbook changed ↻  reloading...');
//         try { await loadExcelIntoMemory(); }
//         catch (e) { console.error('Reload failed:', e.message); }
//     }
// });

module.exports = {
    loadExcelIntoMemory,
    getRowsByIflow,
    getRowsBySenderInterface,
};