const asyncHandler = require("express-async-handler");
const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

const createTemplate = asyncHandler(async (iflowJson) => {
    const data = iflowJson;

    const content = fs.readFileSync(
        process.env.UTD_TEMPLATE, "binary"
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
    const IDD = iflowJson['IDD'] || '';
    const senderInterface = iflowJson['SENDER_INTERFACE_NAME'];
    const region = iflowJson['REGION'] || '';
    const fileName = `UTD_${IDD}_${region}_${senderInterface}.docx`;
    const filePath = path.resolve(process.env.OUTPUT_UTD_DESTINATION, fileName);
    fs.writeFileSync(filePath, buf);
    
    return `File created successfully: ${filePath}`;
});

module.exports = createTemplate;