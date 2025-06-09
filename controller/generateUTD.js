const searchIflow = require("../utils/searchIflow");
const genAI = require("../utils/genAI");
const createTemplate = require('../utils/createTemplate');
const asyncHandler = require("express-async-handler");
const toTitleCase = require("../utils/toTitleCase");
const enhanceIflowJson = require("../utils/enhanceIflowJson");
const normalizeIflowPayload = require("../utils/normalizeIflowPayload");

const generateUTD = asyncHandler(async (req, resp) => {
    let results = [];
    const iflowRequests = normalizeIflowPayload(req.body)
    console.log(iflowRequests);
    for (let { iflow, reviewerName, senderComponent  } of iflowRequests) {

        //! Extracting the iflow from Excel
        let iflowJson = await searchIflow(iflow);

        //* Adding Reviewer Name
        if (!reviewerName) {
            reviewerName = "Govindaraj Thangavel"
        }
        iflowJson.REVIEWER_NAME = toTitleCase(reviewerName);

        //* Adding Sender Component
        if (senderComponent) {
            iflowJson.SENDERSERVICE = senderComponent;
        }

        //! Function to update the iFlow JSON by renaming keys, adding missing fields, and correcting value formats.
        iflowJson = await enhanceIflowJson(iflowJson);

        //! Generate the description using GenAI
        const iflowOverview = await genAI(JSON.stringify(iflowJson));
        iflowJson.IFLOW_OVERVIEW = iflowOverview;

        //! Create the UTD from the Template
        await createTemplate(iflowJson);

        results.push({
            iflowName: iflow,
            status: "success",
        });
    }
    resp.status(200).json({
        status: "completed",
        results
    });
    console.log("UTDs generated successfully");
});

module.exports = generateUTD;