const asyncHandler = require("express-async-handler");
const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

const createTemplate = asyncHandler(async (iflowJson) => {
    const data = iflowJson;
    let template = "";
    
    if (Array.isArray(iflowJson.RECEIVERSERVICE) || Array.isArray(iflowJson.IFLOW_NAME) || Array.isArray(iflowJson.NEW)) {
        template = process.env.UTD_TEMPLATE2;
    } else {
        template = process.env.UTD_TEMPLATE;
    }
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

    let IDD = "";
    if (Array.isArray(iflowJson['IDD'])) {
        const temp = [];
        iflowJson['IDD'].forEach(obj => {
            temp.push(obj.IDD);
        })
        IDD = temp.join('_');
    } else {
        IDD = iflowJson['IDD'] || "";
    }
    const region = iflowJson['REGION'] || '';
    const source = iflowJson["SOURCE_SYSTEM"];
    let target = "";
    if (Array.isArray(iflowJson['TARGET_SYSTEM'])) {
        const temp = [];
        iflowJson['TARGET_SYSTEM'].forEach(obj => {
            temp.push(obj.TARGET_SYSTEM);
        })
        target = temp.join('_');
    } else {
        target = iflowJson['TARGET_SYSTEM'] || "";
    }
    const env = iflowJson.RUNTIME
    console.log(iflowJson)
    // UTD name should be UTD_REGION_IDD_SENDER_TO_RECEIVER_RUNTIME.DOCX
    const fileName = `UTD_${region}_${IDD}_${source}_TO_${target}_${env}.docx`;
    const filePath = path.resolve(process.env.OUTPUT_UTD_DESTINATION, fileName);
    fs.writeFileSync(filePath, buf);
    return fileName;
});

module.exports = createTemplate;