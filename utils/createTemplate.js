const asyncHandler = require("express-async-handler");
const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

const createTemplate = asyncHandler(async (iflowJson) => {
    const data = iflowJson;
    // let template = "";

    // if (iflowJson.COUNT <= 1) {
    //     template = process.env.UTD_TEMPLATE;
    // } else {
    //     template = process.env.UTD_TEMPLATE2;
    // }
    let template = process.env.UTD_TEMPLATE;
    const content = fs.readFileSync(
        template, "binary"
    );

    // Unzip the content of the file
    const zip = new PizZip(content);

    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
    });

    doc.render(data);
    const buf = doc.toBuffer();


    const IDD = iflowJson['IDD'];
    const region = iflowJson['REGION'] || '';
    const source = iflowJson["SOURCE_NAME"] || '';
    const target = iflowJson['TARGET']
    const runtime = iflowJson.RUNTIME || '';
    // UTD name should be UTD_REGION_IDD_SENDER_TO_RECEIVER_RUNTIME.DOCX
    let fileName = `UTD_${region}_${IDD}_${source}_TO_${target}_${runtime}`;
    if (fileName.length > 250) {
        console.log("File Name Character Length Exceed");
        fileName = fileName.substring(0, 250);
    }
    fileName += `.docx`;
    const filePath = path.resolve(process.env.OUTPUT_UTD_DESTINATION, fileName);
    fs.writeFileSync(filePath, buf);
    console.log("Template Created ✅")
    return filePath;
});

module.exports = createTemplate;