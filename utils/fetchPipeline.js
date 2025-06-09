const fetchPipeline = async (iflowJson) => {
    const pattern = iflowJson.PATTERN || '';
    let pipelinePackageName = '';
    let pipelineIflowNames = '';
    // check is Pattern starts with either "OB Idoc" or "OB Proxy"

    if (iflowJson.IFLOW_NAME.includes("Cloud")) {
        pipelinePackageName = `1. MDLZ - Pipeline - Generic Integration Flows & Templates Cloud
                             2. ${iflowJson.PACKAGE_NAME}`;
        if (pattern.startsWith("OB Idoc")) {
            pipelineIflowNames = `1. MDLZ - Step00 - Handle Idoc Requests Cloud
                      2. MDLZ - Step01 - Inbound Processing for Idoc Generic IDoc Cloud
                      3. MDLZ - Step02 - Inbound Processing Cloud
                      4. MDLZ - Step04 - Receiver Determination Cloud
                      5. MDLZ - Step06 - Outbound Processing Cloud
                      6. ${iflowJson.IFLOW_NAME}`;
        } else if (pattern.startsWith("OB Proxy")) {
            pipelineIflowNames = `1. MDLZ - Step00 - Handle Idoc Requests Cloud
                      2. MDLZ - Step01 - Inbound Processing for XI Cloud
                      3. MDLZ - Step02 - Inbound Processing Cloud
                      4. MDLZ - Step04 - Receiver Determination Cloud
                      5. MDLZ - Step06 - Outbound Processing Cloud
                      6. ${iflowJson.IFLOW_NAME}`;
        }
    } else if (iflowJson.IFLOW_NAME.includes("EIC")) {
        pipelinePackageName = `1. MDLZ - Pipeline - Generic Integration Flows & Templates Edge
                             2. ${iflowJson.PACKAGE_NAME}`;
        if (pattern.startsWith("OB Idoc")) {
            pipelineIflowNames = `1. MDLZ - Step00 - Handle Idoc Requests Edge
                      2. MDLZ - Step01 - Inbound Processing for Idoc Generic IDoc Edge
                      3. MDLZ - Step02 - Inbound Processing Edge
                      4. MDLZ - Step04 - Receiver Determination Edge
                      5. MDLZ - Step06 - Outbound Processing Edge
                      6. ${iflowJson.IFLOW_NAME}`;
        } else if (pattern.startsWith("OB Proxy")) {
            pipelineIflowNames = `1. MDLZ - Step00 - Handle Idoc Requests Edge
                      2. MDLZ - Step01 - Inbound Processing for XI Edge
                      3. MDLZ - Step02 - Inbound Processing Edge
                      4. MDLZ - Step04 - Receiver Determination Edge
                      5. MDLZ - Step06 - Outbound Processing Edge
                      6. ${iflowJson.IFLOW_NAME}`;
        }
    }

    return {
        pipelinePackageName,
        pipelineIflowNames
    };
};

module.exports = fetchPipeline;