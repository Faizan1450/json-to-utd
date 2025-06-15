/**
 * excelDataStore.js  (CommonJS, plain JS — no TypeScript)
 *
 * USAGE
 *   const store = require('./excelDataStore');
 *   await store.load();                   // at startup or on file-change
 *
 *   const matches1 = store.findByIflow('IFLOW_123');
 *   const matches2 = store.findBySender('ORDRSP_OUT_IF');
 *
 *   console.log(store.rows.length);       // full in-memory snapshot
 */

const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

/* ────────────────────────────────────────────────────────────── */
/* 1.  Config – edit or keep env vars                            */
/* ────────────────────────────────────────────────────────────── */
const XLSX_PATH = process.env.XLSX_PATH || path.join(__dirname, 'data.xlsx');
const SHEET_NAME_LA = process.env.SHEET_NAME_LA || 'LA - Iteration';
const SHEET_NAME_NA = process.env.SHEET_NAME_NA || 'NA- Iteration';

/* ────────────────────────────────────────────────────────────── */
/* 2.  Normalise header names → uniform keys                     */
/*     remove spaces, newlines, quotes, punctuation, make upper  */
/* ────────────────────────────────────────────────────────────── */
const norm = (str = '') =>
    String(str).replace(/\s+/g, '')
        .replace(/[^A-Za-z0-9]/g, '')
        .toUpperCase();

/* mapping "normalised header" → canonical key you want */
const ALIAS = {
    IDD: 'IDD',
    DESCRIPTION: 'DESCRIPTION',
    IKDRESOURCE: 'RESOURCE',
    PATTERN: 'PATTERN',
    PROCESSAREA: 'PROCESS_AREA',
    L1: 'PROCESS_AREA',        // NA sheet
    PACKAGE: 'PACKAGE',
    IFLOW: 'IFLOW',
    SENDERCHANNEL: 'SENDER_CHANNEL',
    SENDERSERVICE: 'SENDER_SERVICE',
    SENDERINTERFACENAMEDOCUMENTTYPEB2B: 'SENDER_INTERFACE',
    OPERATIONMAPPING: 'OPERATION_MAPPING',
    RECEIVERSERVICE: 'RECEIVER_SERVICE',
    RECEIVERINTERFACEDOCUMENTTYPEB2B: 'RECEIVER_INTERFACE',
    RECEIVERINTERFACE: 'RECEIVER_INTERFACE',  // just in case
};

/* ────────────────────────────────────────────────────────────── */
/* 3.  Live data holders – every require() gets same reference   */
/* ────────────────────────────────────────────────────────────── */
const rows = [];                   // full snapshot (live binding)
const byIflow = new Map();            // Map<string, Row[]>
const bySender = new Map();            // Map<string, Row[]>
let version = 0;                    // bump each reload

/* ────────────────────────────────────────────────────────────── */
/* 4.  Load / reload the workbook                                */
/* ────────────────────────────────────────────────────────────── */
async function load() {
    if (!fs.existsSync(XLSX_PATH)) {
        throw new Error(`Excel file not found at ${XLSX_PATH}`);
    }

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(XLSX_PATH);

    const sheets = [
        wb.getWorksheet(SHEET_NAME_LA),
        wb.getWorksheet(SHEET_NAME_NA),
    ].filter(Boolean);

    if (!sheets.length) {
        throw new Error(`Neither "${SHEET_NAME_LA}" nor "${SHEET_NAME_NA}" present`);
    }

    const fresh = [];          // build new snapshot first

    for (const ws of sheets) {
        /* build "column-idx → canonical key" map from header row */
        const headerRow = ws.getRow(1);
        const colIdxToKey = [];

        headerRow.eachCell((cell, col) => {
            const key = ALIAS[norm(cell.value)];
            if (key) colIdxToKey[col] = key;
        });

        ws.eachRow({ includeEmpty: false }, (row, r) => {
            if (r === 1) return;                       // skip header

            const obj = {};
            colIdxToKey.forEach((key, col) => {
                if (!key) return;
                obj[key] = (row.getCell(col).text || '').trim();
            });
            fresh.push(obj);
        });
    }

    /* ---- atomic swap so other modules keep same reference ---- */
    rows.length = 0;
    rows.push(...fresh);

    /* rebuild indexes */
    byIflow.clear();
    bySender.clear();

    for (const r of rows) {
        const iKey = (r.IFLOW || '').toLowerCase();
        const sKey = (r.SENDER_INTERFACE || '').toLowerCase();

        if (iKey) {
            if (!byIflow.has(iKey)) byIflow.set(iKey, []);
            byIflow.get(iKey).push(r);
        }
        if (sKey) {
            if (!bySender.has(sKey)) bySender.set(sKey, []);
            bySender.get(sKey).push(r);
        }
    }

    version += 1;
    console.log(`✅ Excel loaded: ${rows.length} rows (v${version})`);
}

/* ────────────────────────────────────────────────────────────── */
/* 5.  Query helpers                                             */
/* ────────────────────────────────────────────────────────────── */
const findByIflow = (id) => byIflow.get(String(id).toLowerCase()) || [];
const findBySender = (name) => bySender.get(String(name).toLowerCase()) || [];

/* ────────────────────────────────────────────────────────────── */
/* 6.  Exports (CommonJS live bindings)                          */
/* ────────────────────────────────────────────────────────────── */
module.exports = {
    /* data */
    rows,                         // live array – don’t reassign
    version: () => version,

    /* actions */
    load,                         // await load() at boot or on change
    findByIflow,
    findBySender,
};