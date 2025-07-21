const toTitleCase = require('./toTitleCase');
const asyncHandler = require("express-async-handler");

const enhanceIflowJson = asyncHandler(async (iflowJson) => {

    //! Fetch Runtime
    let iflow = iflowJson.IFLOW.toLowerCase().trim();
    if (iflow.includes("cloud")) {
        iflowJson.RUNTIME =  "Cloud";
    } else if (iflow.includes("eic")) {
        iflowJson.RUNTIME =  "EIC";
    } else {
        iflowJson.RUNTIME = "";
    }

    //! Extract Sender and Receiver Adapters
    iflowJson.SENDER_ADAPTER = iflowJson.SENDER_CHANNEL.startsWith('CC') ? iflowJson.SENDER_CHANNEL.split('_')[1] : iflowJson.SENDER_CHANNEL.trim();


    iflowJson.RECEIVER_ADAPTER = iflowJson.RECEIVER_CHANNEL.startsWith('CC') ? iflowJson.RECEIVER_CHANNEL.split('_')[1] : iflowJson.RECEIVER_CHANNEL.trim();
    

    //! Extract Source and Target Systems
    if (iflowJson.IFLOW.toUpperCase().includes('_TO_')) {
        const systems = iflowJson.IFLOW.toUpperCase().split('_TO_');
        iflowJson.SOURCE =  systems[0].split('_')[0];
        iflowJson.SOURCE_NAME = systems[0].replace(/_(NA|LA)_/, "_");
        if (systems[1].includes('_IDD')) {
            iflowJson.TARGET =  systems[1].split('_IDD')[0];
        } else {
            iflowJson.TARGET =  systems[1].split('_')[0];
        }
    } else {
        iflowJson.SOURCE = iflowJson.IFLOW.split('_')[0]
        iflowJson.SOURCE_NAME =  obj.IFLOW.split('_')[0]
        iflowJson.TARGET = "Target Name";
    }

    //! Adding current date to the iflowJson in DD/MM/YYYY format
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = currentDate.getFullYear();
    iflowJson.DATE = `${day}/${month}/${year}`;

    //! Adding Reviewer Name
    let reviewerName = iflowJson.reviewerName?.trim();
    iflowJson.REVIEWER = reviewerName ? toTitleCase(reviewerName) : "Govindaraj Thangavel";
}
);
module.exports = enhanceIflowJson;