const toTitleCase = require('./toTitleCase');
const asyncHandler = require("express-async-handler");

const enhanceIflowJson = asyncHandler(async (iflowJsonArray, iflowIdInput) => {

    //* Code to conditionally normalizes key names in an iFlow JSON. Based on the region i.e LA or NA
    let result = [];
    for (let iflowJson of iflowJsonArray) {
        if (iflowIdInput.includes('_la_')) {
            iflowJson.IFLOW_NAME = iflowJson['IFLOW'];
            iflowJson.PACKAGE_NAME = iflowJson['PACKAGE'];
            iflowJson.SENDER_INTERFACE_NAME = iflowJson['SENDERINTERFACENAME/ DOCUMENTTYPE(B2B)'];
            iflowJson.RECEIVERCHANNEL = iflowJson['RECEIVER CHANNEL'];

            delete iflowJson['IFLOW'];
            delete iflowJson['PACKAGE'];
            delete iflowJson['SENDERINTERFACENAME/ DOCUMENTTYPE(B2B)'];
            delete iflowJson['RECEIVER CHANNEL'];
        } else {
            iflowJson.IFLOW_NAME = iflowJson['NA IFLOW'];
            iflowJson.PACKAGE_NAME = iflowJson['NA PACKAGE'];
            iflowJson.SENDER_INTERFACE_NAME = iflowJson['SENDERINTERFACE (DOC TYPE)'];

            delete iflowJson['NA IFLOW'];
            delete iflowJson['NA PACKAGE'];
            delete iflowJson['SENDERINTERFACE (DOC TYPE)'];
        }

        if (!iflowJson.IFLOW_NAME) {
            return;
        }
        iflowIdInput = iflowJson.IFLOW_NAME?.toLowerCase().trim();
        // Adding Enironment to the JSON
        if (iflowIdInput.includes("cloud")) {
            iflowJson.RUNTIME = "Cloud"
        } else if (iflowIdInput.includes("eic")){
            iflowJson.RUNTIME = "EIC"
        } else {
            iflowJson.RUNTIME = ""
        }

        //* Handling the RESOURCE Name
        if (!iflowJson['M.RESOURCE']) {
            iflowJson['M.RESOURCE'] = "Not Assigned"
        }
        iflowJson.RESOURCE_NAME = toTitleCase(iflowJson['M.RESOURCE']);
        // iflowJson.RESOURCE_NAME = "Syed Faizan Ali";
        delete iflowJson['M.RESOURCE', "Resource"];


        //* Extract Sender and Receiver Adapters
        if (iflowJson.SENDERCHANNEL) {
            iflowJson.SENDER_ADAPTER = iflowJson.SENDERCHANNEL.startsWith('CC') ? iflowJson.SENDERCHANNEL.split('_')[1] : iflowJson.SENDERCHANNEL
        } else {
            iflowJson.SENDER_ADAPTER = "SenderAdapter";
        }

        if (iflowJson.RECEIVERCHANNEL) {
            iflowJson.RECEIVER_ADAPTER = iflowJson.RECEIVERCHANNEL.startsWith('CC') ? iflowJson.RECEIVERCHANNEL.split('_')[1] : iflowJson.RECEIVERCHANNEL
        }
        else {
            iflowJson.RECEIVER_ADAPTER = "ReceiverAdapter";
        }

        //* Extract Source and Target Systems
        if (iflowIdInput.includes('_to_')) {
            const systems = iflowIdInput.split('_to_');
            iflowJson.SOURCE_SYSTEM = systems[0].split('_')[0].toUpperCase();
            iflowJson.TARGET_SYSTEM = systems[1].split('_')[0].toUpperCase();
        } else {
            iflowJson.SOURCE_SYSTEM = iflowIdInput.split('_')[0].toUpperCase();
            iflowJson.TARGET_SYSTEM = "[Target Name]";
        }

        //* Fetching Region
        if (iflowIdInput.includes('_la_')) {
            iflowJson.REGION = "LA";
        } else if (iflowIdInput.includes('_na_')) {
            iflowJson.REGION = "NA";
        } else {
            iflowJson.REGION = "";
        }

        //! Adding current date to the iflowJson in DD/MM/YYYY format
        const currentDate = new Date();
        const day = String(currentDate.getDate()).padStart(2, '0');
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const year = currentDate.getFullYear();
        iflowJson.DATE = `${day}/${month}/${year}`;



        result.push(iflowJson);
    }

    return result;
}
);
module.exports = enhanceIflowJson;