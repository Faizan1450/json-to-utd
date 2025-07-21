const asyncHandler = require("express-async-handler");

const fetchPipeline = asyncHandler(async (iflowJson) => {
    // Intialize PIPELINES
    iflowJson.PIPELINE_PACKAGE = "";
    iflowJson.PIPELINE_IFLOW = "";
    iflowJson.SENDER_PING_TEST = "";

    //! Validating pattern before generating pipeline
    let pattern = iflowJson.PATTERN.toUpperCase();
    if (pattern.includes("OB IDOC")) {
        pattern = "OB IDOC";
    } else if (pattern.includes("OB PROXY")) {
        pattern = "OB PROXY";
    } else {
        return;
    }

    const runtime = iflowJson.RUNTIME?.toUpperCase() || '';
    let pipelinePackageName = '';
    let pipelineIflowNames = '';
    // check is Pattern starts with either "OB Idoc" or "OB Proxy"
    if (runtime.includes("CLOUD")) {
        pipelinePackageName = `\n1. ACCENTURE - Pipeline - Generic Integration Flows & Templates Cloud`;

        if (pattern === "OB IDOC") {
            pipelineIflowNames = `\nACCENTURE - Step00 - Handle Idoc Requests Cloud\nACCENTURE - Step01 - Inbound Processing for Idoc Generic IDoc Cloud\nACCENTURE - Step02 - Inbound Processing Cloud\nACCENTURE - Step04 - Receiver Determination Cloud\nACCENTURE - Step06 - Outbound Processing Cloud`;
        } else if (pattern === "OB PROXY") {
            pipelineIflowNames = `\nACCENTURE - Step00 - Handle Idoc Requests Cloud\nACCENTURE - Step01 - Inbound Processing for XI Cloud\nACCENTURE - Step02 - Inbound Processing Cloud\nACCENTURE - Step04 - Receiver Determination Cloud\nACCENTURE - Step06 - Outbound Processing Cloud`;
        }
    } else if (runtime.includes("EIC")) {
        pipelinePackageName = `\nACCENTURE - Pipeline - Generic Integration Flows & Templates Edge`;
        if (pattern === "OB IDOC") {
            pipelineIflowNames = `\nACCENTURE - Step00 - Handle Idoc Requests Edge\nACCENTURE - Step01 - Inbound Processing for Idoc Generic IDoc Edge\nACCENTURE - Step02 - Inbound Processing Edge\nACCENTURE - Step04 - Receiver Determination Edge\nACCENTURE - Step06 - Outbound Processing Edge`;
        } else if (pattern === "OB Proxy") {
            pipelineIflowNames = `\nACCENTURE - Step00 - Handle Idoc Requests Edge\nACCENTURE - Step01 - Inbound Processing for XI Edge\nACCENTURE - Step02 - Inbound Processing Edge\nACCENTURE - Step04 - Receiver Determination Edge\nACCENTURE - Step06 - Outbound Processing Edge`;
        }
    }

    if (pipelinePackageName && pipelineIflowNames) {
        iflowJson.PIPELINE_PACKAGE = pipelinePackageName;
        iflowJson.PIPELINE_IFLOW = pipelineIflowNames;
        iflowJson.SENDER_PING_TEST = 'Ping test is not applicable as the sender adapter is Process Direct.';
        console.log("Pipeline Exists ✅")
    } else {
        iflowJson.PIPELINE_PACKAGE = "";
        iflowJson.PIPELINE_IFLOW = "";
        iflowJson.SENDER_PING_TEST = "";
    }

});

module.exports = fetchPipeline;