const createTemplate = require('../utils/createTemplate');
const asyncHandler = require("express-async-handler");
const enhanceIflowJson = require("../utils/enhanceIflowJson");
const normalizeIflowPayload = require("../utils/normalizeIflowPayload");
const fetchPipeline = require("../utils/fetchPipeline");

const generateUTD = asyncHandler(async (req, resp) => {
    
    //! Normalize input json into common pattern
    const iflowJson = normalizeIflowPayload(req.body);
        try {
            //! Adding missing fields, and correcting value formats.
            await enhanceIflowJson(iflowJson);

            //! Check Pipline is required or not
            await fetchPipeline(iflowJson);

            //! Create the UTD from the Template
            const filePath = await createTemplate(iflowJson)
            resp.download(filePath);
        } catch (err) {
            console.error(`❌  ${iflowObj} failed:`, err);
            resp.status(500).send(err.message || "Internal Server Error");
        }
    
    console.log("Request Executed successfully");
});

module.exports = generateUTD;