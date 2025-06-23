const asyncHandler = require("express-async-handler");

const fetchPipeline = asyncHandler(async (iflowJson) => {
    // Intialize PIPELINES
    iflowJson.PIPELINE_PACKAGE = "";
    iflowJson.PIPELINE_IFLOW = "";
    iflowJson.SENDER_PING_TEST = "";

    //! Validating pattern before generating pipeline
    let pattern = iflowJson.PATTERN[0].PATTERN.toUpperCase();
    if (pattern.includes("OB IDOC")) {
        pattern = "OB IDOC";
    } else if (pattern.includes("OB PROXY")) {
        pattern = "OB PROXY";
    } else {
        return;
    }

    let isMultiPattern = false;
    for (obj of iflowJson.PATTERN) {
        if (!obj.PATTERN.toUpperCase().includes(pattern)) {
            isMultiPattern = true;
            break;
        }
    }
    if (isMultiPattern) {
        console.error("Multiple Patterns Involved");
        return;
    }

    // const pattern = iflowJson.PATTERN[0].PATTERN?.toUpperCase() || '';
    const runtime = iflowJson.RUNTIME?.toUpperCase() || '';
    let pipelinePackageName = '';
    let pipelineIflowNames = '';
    // check is Pattern starts with either "OB Idoc" or "OB Proxy"
    if (runtime.includes("CLOUD")) {
        pipelinePackageName = `\n1. MDLZ - Pipeline - Generic Integration Flows & Templates Cloud`;

        if (pattern === "OB IDOC") {
            pipelineIflowNames = `\nMDLZ - Step00 - Handle Idoc Requests Cloud\nMDLZ - Step01 - Inbound Processing for Idoc Generic IDoc Cloud\nMDLZ - Step02 - Inbound Processing Cloud\nMDLZ - Step04 - Receiver Determination Cloud\nMDLZ - Step06 - Outbound Processing Cloud`;
        } else if (pattern === "OB PROXY") {
            pipelineIflowNames = `\nMDLZ - Step00 - Handle Idoc Requests Cloud\nMDLZ - Step01 - Inbound Processing for XI Cloud\nMDLZ - Step02 - Inbound Processing Cloud\nMDLZ - Step04 - Receiver Determination Cloud\nMDLZ - Step06 - Outbound Processing Cloud`;
        }
    } else if (runtime.includes("EIC")) {
        pipelinePackageName = `\nMDLZ - Pipeline - Generic Integration Flows & Templates Edge`;
        if (pattern === "OB IDOC") {
            pipelineIflowNames = `\nMDLZ - Step00 - Handle Idoc Requests Edge\nMDLZ - Step01 - Inbound Processing for Idoc Generic IDoc Edge\nMDLZ - Step02 - Inbound Processing Edge\nMDLZ - Step04 - Receiver Determination Edge\nMDLZ - Step06 - Outbound Processing Edge`;
        } else if (pattern === "OB Proxy") {
            pipelineIflowNames = `\nMDLZ - Step00 - Handle Idoc Requests Edge\nMDLZ - Step01 - Inbound Processing for XI Edge\nMDLZ - Step02 - Inbound Processing Edge\nMDLZ - Step04 - Receiver Determination Edge\nMDLZ - Step06 - Outbound Processing Edge`;
        }
    }

    if (pipelinePackageName && pipelineIflowNames) {
        iflowJson.PIPELINE_PACKAGE = pipelinePackageName;
        iflowJson.PIPELINE_IFLOW = pipelineIflowNames;
        iflowJson.SENDER_PING_TEST = 'Ping test is not applicable as the sender adapter is Process Direct.';
    } else {
        iflowJson.PIPELINE_PACKAGE = "";
        iflowJson.PIPELINE_IFLOW = "";
        iflowJson.SENDER_PING_TEST = "";
    }

});

module.exports = fetchPipeline;