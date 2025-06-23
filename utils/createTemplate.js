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


    //UTD_{IDD}_{SENDERINTERFACENAME/ DOCUMENTTYPE(B2B)}

    // let IDD = "";
    // if (iflowJson['IDD'].length >= 2) {
    //     const temp = [];
    //     iflowJson['IDD'].forEach(obj => {
    //         temp.push(obj.IDD);
    //     })
    //     IDD = temp.join('_');
    // } else {
    //     IDD = iflowJson['IDD'].IDD || "";
    // }

    let temp = [];
    iflowJson['IDD'].forEach(obj => {
        temp.push(obj.IDD);
    })
    let IDD = temp.join('_');
    const region = iflowJson['REGION'] || '';
    const source = iflowJson["SOURCE_NAME"] || '';

    temp = [];
    iflowJson['TARGET'].forEach(obj => {
        temp.push(obj.TARGET);
    })
    let target = temp.join('_');
    const runtime = iflowJson.RUNTIME || '';
    // UTD name should be UTD_REGION_IDD_SENDER_TO_RECEIVER_RUNTIME.DOCX
    const fileName = `UTD_${region}_${IDD}_${source}_TO_${target}_${runtime}.docx`;
    const filePath = path.resolve(process.env.OUTPUT_UTD_DESTINATION, fileName);
    fs.writeFileSync(filePath, buf);
    return fileName;
});

module.exports = createTemplate;