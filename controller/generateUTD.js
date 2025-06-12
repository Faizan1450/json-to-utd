const searchIflow = require("../utils/searchIflow");
const genAI = require("../utils/genAI");
const createTemplate = require('../utils/createTemplate');
const asyncHandler = require("express-async-handler");
const toTitleCase = require("../utils/toTitleCase");
const enhanceIflowJson = require("../utils/enhanceIflowJson");
const normalizeIflowPayload = require("../utils/normalizeIflowPayload");
const verifyMultiReceivers = require("../utils/verifyMultiReceivers");
const mergeJsonArray = require("../utils/mergeJsonArray");
const fetchPipeline = require("../utils/fetchPipeline");

const generateUTD = asyncHandler(async (req, resp) => {
    let results = [];

    //! Normalize input json into common pattern
    const iflowRequests = normalizeIflowPayload(req.body);
    let fileName = [];
    for (let { iflow, reviewerName, senderComponent} of iflowRequests) {

        //! Extracting the iflow from Excel
        let { foundRow, worksheet, headers, iflowIdInput } = await searchIflow(iflow);
        let iflowJson = foundRow;
        

        
        //! Verify multi receivers scenerio
        const { isMultiReceiver, resJson } = await verifyMultiReceivers(iflowJson, worksheet, headers);

        //! Function to update the iFlow JSON by renaming keys, adding missing fields, and correcting value formats.
        iflowJson = await enhanceIflowJson(resJson, iflowIdInput);
        console.log("Enhance Iflow Output", iflowJson);

        if (isMultiReceiver) {
            // if isMultiReceiver is true, then below utility function will club all iflowJsons array common values into one
            iflowJson = await mergeJsonArray(iflowJson);
        }

        //* Adding Reviewer Name
        if (!reviewerName) {
            reviewerName = "Govindaraj Thangavel"
        }
        iflowJson.REVIEWER_NAME = toTitleCase(reviewerName);

        //* Adding Sender Component
        if (senderComponent) {
            iflowJson.SENDERSERVICE = senderComponent;
        }
        
        //! Check Pipline is required or not
        const pattern = iflowJson.PATTERN || '';
        if (pattern?.startsWith("OB Idoc") || pattern?.startsWith("OB Proxy")) {
            const { pipelinePackageName, pipelineIflowNames } = await fetchPipeline(iflowJson);
            if (pipelineIflowNames && pipelinePackageName) {
                iflowJson.PIPELINE_PACKAGE_NAME = pipelinePackageName;
                iflowJson.PIPELINE_IFLOW_NAME = pipelineIflowNames;
            } else {
                iflowJson.PIPELINE_PACKAGE_NAME = "";
                iflowJson.PIPELINE_IFLOW_NAME = "";
            }
        }

        //! Generate the description using GenAI
        // Removing AI call for testing purposes
        // iflowJson.IFLOW_OVERVIEW = "This is a test overview for the iFlow.";
        const iflowOverview = await genAI(JSON.stringify(iflowJson));
        iflowJson.IFLOW_OVERVIEW = iflowOverview;
    
        //! Create the UTD from the Template
        const file = await createTemplate(iflowJson)
        fileName.push(file);

        results.push({
            iflowName: iflow,
            status: "success",
        });
    }
    console.log(fileName);
    resp.status(200).json({
        status: "completed",
        fileName: fileName,
        results
    });
    console.log("UTDs generated successfully");
});

module.exports = generateUTD;