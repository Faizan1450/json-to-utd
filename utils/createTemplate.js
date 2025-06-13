const asyncHandler = require("express-async-handler");
const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

const createTemplate = asyncHandler(async (iflowJson) => {
    const data = iflowJson;
    let template = "";
    if (Array.isArray(iflowJson.RECEIVERSERVICE)) {
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
        iflowJson['IDD'].forEach(obj => {
            IDD += obj.IDD + "_";
        })
    } else {
        IDD = (iflowJson['IDD'] || "") + "_";
    }
    const senderInterface = iflowJson['SENDER_INTERFACE_NAME'];
    const region = iflowJson['REGION'] || '';
    const fileName = `UTD_${IDD}${region}_${senderInterface}.docx`;
    const filePath = path.resolve(process.env.OUTPUT_UTD_DESTINATION, fileName);
    fs.writeFileSync(filePath, buf);
    
    return fileName;
});

module.exports = createTemplate;