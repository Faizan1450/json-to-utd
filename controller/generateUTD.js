const searchIflow = require("../utils/searchIflow");
const genAI = require("../utils/genAI");
const createTemplate = require('../utils/createTemplate');
const asyncHandler = require("express-async-handler");
const enhanceIflowJson = require("../utils/enhanceIflowJson");
const normalizeIflowPayload = require("../utils/normalizeIflowPayload");
const mergeJsonArray = require("../utils/mergeJsonArray");
const fetchPipeline = require("../utils/fetchPipeline");
const validateJson = require("../utils/validateJson");

const generateUTD = asyncHandler(async (req, resp) => {
    console.clear();
    let results = [];

    //! Normalize input json into common pattern
    const iflowRequests = normalizeIflowPayload(req.body);
    console.log("Input", iflowRequests);
    //! Start Loop Each sent Iflow
    for (let iflowObj of iflowRequests) {
        try {

            //! Extracting the iflows from Excel
            let iflowJson = await searchIflow(iflowObj);
            console.log("After SEarch enhance")
            console.log(iflowJson)
            //! Function will club all iflowJson array common values into one
            iflowJson = await mergeJsonArray(iflowJson);
            console.log("After mergeJson enhance")
            console.log(iflowJson)
            //! Adding missing fields, and correcting value formats.
            await enhanceIflowJson(iflowJson, iflowObj);
            console.log("After Enhance iflow");
            console.log(iflowJson)

            //! Validate Json
            await validateJson(iflowJson);

            //! Check Pipline is required or not
            await fetchPipeline(iflowJson);

            //! Generate the description using GenAI
            iflowJson.IFLOW_OVERVIEW = "This is a test overview for the iFlow.";
            // const iflowOverview = await genAI(JSON.stringify(iflowJson));
            // iflowJson.IFLOW_OVERVIEW = iflowOverview;

            //! Create the UTD from the Template
            const file = await createTemplate(iflowJson)

            results.push({
                GivenInput: iflowObj,
                fileName: file,
                status: "success",
            });
        } catch (err) {
            console.error(`❌  ${iflowObj} failed:`, err);
            results.push({
                iflowName: iflowObj,
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