const toTitleCase = require('./toTitleCase');
const asyncHandler = require("express-async-handler");

const enhanceIflowJson = asyncHandler(async (iflowJson, iflowObj) => {

    //! Fetch Runtime
    iflowJson.RUNTIME = []
    iflowJson.IFLOW.forEach(obj => {
        let iflow = obj.IFLOW.toLowerCase();
        if (iflow.includes("cloud")) {
            iflowJson.RUNTIME.push({ RUNTIME: "Cloud" })
        } else if (iflow.includes("eic")) {
            iflowJson.RUNTIME.push({ RUNTIME: "EIC" })
        } else {
            iflowJson.RUNTIME.push({ RUNTIME: "" })
        }
    })

    //! Extract Sender and Receiver Adapters
    iflowJson.SENDER_ADAPTER = []
    // iflowJson.SENDER_ADAPTER = iflowJson.SENDER_CHANNEL[0].SENDER_CHANNEL.startsWith('CC') ? obj.SENDER_CHANNEL.split('_')[1] : obj.SENDER_CHANNEL.trim();
    iflowJson.SENDER_CHANNEL.forEach(obj => {
        let senderAdapter = obj.SENDER_CHANNEL.startsWith('CC') ? obj.SENDER_CHANNEL.split('_')[1] : obj.SENDER_CHANNEL.trim();
        iflowJson.SENDER_ADAPTER.push({ SENDER_ADAPTER: senderAdapter });
    });


    iflowJson.RECEIVER_ADAPTER = []
    iflowJson.RECEIVER_CHANNEL.forEach(obj => {
        let receiverAdapter = obj.RECEIVER_CHANNEL.startsWith('CC') ? obj.RECEIVER_CHANNEL.split('_')[1] : obj.RECEIVER_CHANNEL.trim();
        iflowJson.RECEIVER_ADAPTER.push({ RECEIVER_ADAPTER: receiverAdapter });
    });

    //! Extract Source and Target Systems
    let source = [];
    let source_name = [];
    let target = [];
    iflowJson.IFLOW.forEach(obj => {
        if (obj.IFLOW.toUpperCase().includes('_TO_')) {
            const systems = obj.IFLOW.toUpperCase().split('_TO_');
            source.push({ SOURCE: systems[0].split('_')[0] });
            source_name.push({ SOURCE_NAME: systems[0].replace(/_(NA|LA)_/, "_") });
            if (systems[1].includes('_IDD')) {
                target.push({ TARGET: systems[1].split('_IDD')[0] });
            } else {
                target.push({ TARGET: systems[1].split('_')[0] });
            }
        } else {
            source.push({ SOURCE: obj.IFLOW.split('_')[0] });
            source_name.push({ SOURCE_NAME: obj.IFLOW.split('_')[0] });
            target.push({ TARGET: "Target Name" });
        }
    })
    iflowJson.SOURCE = source;
    iflowJson.SOURCE_NAME = source_name;
    iflowJson.TARGET = target;

    //! Adding current date to the iflowJson in DD/MM/YYYY format
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = currentDate.getFullYear();
    iflowJson.DATE = `${day}/${month}/${year}`;

    //! Adding Reviewer Name
    let reviewerName = iflowObj.reviewerName?.trim();
    iflowJson.REVIEWER = reviewerName ? toTitleCase(reviewerName) : "Govindaraj Thangavel";

    //! Adding Sender Component if user wants
    if (iflowObj.senderComponent) {
        iflowJson.SENDER_SERVICE = [{ SENDER_SERVICE: iflowObj.senderComponent }];
    }
}
);
module.exports = enhanceIflowJson;