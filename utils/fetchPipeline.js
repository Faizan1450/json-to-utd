const asyncHandler = require("express-async-handler");

const fetchPipeline = asyncHandler(async (iflowJson, iflowInputID) => {
    const pattern = iflowJson.PATTERN || '';
    let pipelinePackageName = '';
    let pipelineIflowNames = '';
    // check is Pattern starts with either "OB Idoc" or "OB Proxy"
    if (iflowInputID.includes("Cloud")) {
        pipelinePackageName = `1. MDLZ - Pipeline - Generic Integration Flows & Templates Cloud`;

        if (pattern.startsWith("OB Idoc")) {
            pipelineIflowNames = `1. MDLZ - Step00 - Handle Idoc Requests Cloud\n2. MDLZ - Step01 - Inbound Processing for Idoc Generic IDoc Cloud\n3. MDLZ - Step02 - Inbound Processing Cloud\n4. MDLZ - Step04 - Receiver Determination Cloud\n5. MDLZ - Step06 - Outbound Processing Cloud`;
        } else if (pattern.startsWith("OB Proxy")) {
            pipelineIflowNames = `1. MDLZ - Step00 - Handle Idoc Requests Cloud\n2. MDLZ - Step01 - Inbound Processing for XI Cloud\n3. MDLZ - Step02 - Inbound Processing Cloud\n4. MDLZ - Step04 - Receiver Determination Cloud\n5. MDLZ - Step06 - Outbound Processing Cloud`;
        }
    } else if (iflowInputID.includes("EIC")) {
        pipelinePackageName = `1. MDLZ - Pipeline - Generic Integration Flows & Templates Edge`;
        if (pattern.startsWith("OB Idoc")) {
            pipelineIflowNames = `1. MDLZ - Step00 - Handle Idoc Requests Edge\n2. MDLZ - Step01 - Inbound Processing for Idoc Generic IDoc Edge\n3. MDLZ - Step02 - Inbound Processing Edge\n4. MDLZ - Step04 - Receiver Determination Edge\n5. MDLZ - Step06 - Outbound Processing Edge`;
        } else if (pattern.startsWith("OB Proxy")) {
            pipelineIflowNames = `1. MDLZ - Step00 - Handle Idoc Requests Edge\n2. MDLZ - Step01 - Inbound Processing for XI Edge\n3. MDLZ - Step02 - Inbound Processing Edge\n4. MDLZ - Step04 - Receiver Determination Edge\n5. MDLZ - Step06 - Outbound Processing Edge`;
        }
    }

    return {
        pipelinePackageName,
        pipelineIflowNames
    };
});

module.exports = fetchPipeline;