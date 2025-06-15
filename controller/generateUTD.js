const searchIflow = require("../utils/searchIflow");
const genAI = require("../utils/genAI");
const createTemplate = require('../utils/createTemplate');
const asyncHandler = require("express-async-handler");
const toTitleCase = require("../utils/toTitleCase");
const enhanceIflowJson = require("../utils/enhanceIflowJson");
const normalizeIflowPayload = require("../utils/normalizeIflowPayload");
const mergeJsonArray = require("../utils/mergeJsonArray");
const fetchPipeline = require("../utils/fetchPipeline");
const getWorkSheet = require("../utils/getWorkSheet");
const searchIflow2 = require("../utils/searchIflow2");

const generateUTD = asyncHandler(async (req, resp) => {
    let results = [];

    //! Get worksheet LA/NA
    const worksheet = await getWorkSheet();
    
    //! Normalize input json into common pattern
    const iflowRequests = normalizeIflowPayload(req.body);
    
    //! Start Loop Each sent Iflow
    for (let { iflow, reviewerName, senderComponent, grouped } of iflowRequests) {
        try {
            //! Extracting the iflows from Excel
            // let iflowJson = await searchIflow(iflow, worksheet);
            let iflowJson = await searchIflow2(iflow, worksheet, grouped);
            // throw new Error("Line 26")

            //! Function to update the iFlow JSON by renaming keys, adding missing fields, and correcting value formats.
            if(grouped) {
                iflowJson = await enhanceIflowJson(iflowJson, iflow[0].toLowerCase());
            } else {
                iflowJson = await enhanceIflowJson(iflowJson, iflow.toLowerCase());
            }

            // if isMultiReceiver is true, then below utility function will club all iflowJsons array common values into one
            iflowJson = await mergeJsonArray(iflowJson);

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
            let pattern = iflowJson.PATTERN || '';
            pattern = pattern?.toUpperCase();
            iflowJson.PIPELINE_PACKAGE_NAME = "";
            iflowJson.PIPELINE_IFLOW_NAME = "";
            if (pattern.includes("OB IDOC") || pattern?.startsWith("OB PROXY")) {
                const { pipelinePackageName, pipelineIflowNames } = await fetchPipeline(iflowJson, iflow);
                if (pipelineIflowNames && pipelinePackageName) {
                    iflowJson.PIPELINE_PACKAGE_NAME = pipelinePackageName;
                    iflowJson.PIPELINE_IFLOW_NAME = pipelineIflowNames;
                }
            }
            console.log("Checking Pipeline");
            console.log(iflowJson.PIPELINE_PACKAGE_NAME)
            console.log(iflowJson.PIPELINE_IFLOW_NAME)


            //! Generate the description using GenAI
            // Removing AI call for testing purposes
            // iflowJson.IFLOW_OVERVIEW = "This is a test overview for the iFlow.";
            const iflowOverview = await genAI(JSON.stringify(iflowJson));
            iflowJson.IFLOW_OVERVIEW = iflowOverview; 

            //! Create the UTD from the Template
            const file = await createTemplate(iflowJson)

            results.push({
                iflowName: iflow,
                fileName: file,
                status: "success",
            });
        } catch (err) {
            console.error(`❌  ${iflow} failed:`, err);
            results.push({
                iflowName: iflow,
                status: "error",
                error: err.message || "Unknown error"
            });
        }
    }
    resp.status(200).json({
        status: "completed",
        results
    });
    console.log("UTDs generated successfully");
});

module.exports = generateUTD;