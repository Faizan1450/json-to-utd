const fetchPipeline = async (iflowJson) => {
    const pattern = iflowJson.PATTERN || '';
    let pipelinePackageName = '';
    let pipelineIflowNames = '';
    // check is Pattern starts with either "OB Idoc" or "OB Proxy"
    if (iflowJson.IFLOW_NAME[0].IFLOW_NAME.includes("Cloud")) {
        pipelinePackageName = `1. MDLZ - Pipeline - Generic Integration Flows & Templates Cloud`;

        if (pattern.startsWith("OB Idoc")) {
            pipelineIflowNames = `1. MDLZ - Step00 - Handle Idoc Requests Cloud
                      2. MDLZ - Step01 - Inbound Processing for Idoc Generic IDoc Cloud
                      3. MDLZ - Step02 - Inbound Processing Cloud
                      4. MDLZ - Step04 - Receiver Determination Cloud
                      5. MDLZ - Step06 - Outbound Processing Cloud`;
        } else if (pattern.startsWith("OB Proxy")) {
            pipelineIflowNames = `1. MDLZ - Step00 - Handle Idoc Requests Cloud
                      2. MDLZ - Step01 - Inbound Processing for XI Cloud
                      3. MDLZ - Step02 - Inbound Processing Cloud
                      4. MDLZ - Step04 - Receiver Determination Cloud
                      5. MDLZ - Step06 - Outbound Processing Cloud`;
        }
    } else if (iflowJson.IFLOW_NAME[0].IFLOW_NAME.includes("EIC")) {
        pipelinePackageName = `1. MDLZ - Pipeline - Generic Integration Flows & Templates Edge`;
        if (pattern.startsWith("OB Idoc")) {
            pipelineIflowNames = `1. MDLZ - Step00 - Handle Idoc Requests Edge
                      2. MDLZ - Step01 - Inbound Processing for Idoc Generic IDoc Edge
                      3. MDLZ - Step02 - Inbound Processing Edge
                      4. MDLZ - Step04 - Receiver Determination Edge
                      5. MDLZ - Step06 - Outbound Processing Edge`;
        } else if (pattern.startsWith("OB Proxy")) {
            pipelineIflowNames = `1. MDLZ - Step00 - Handle Idoc Requests Edge\n2. MDLZ - Step01 - Inbound Processing for XI Edge\n3. MDLZ - Step02 - Inbound Processing Edge\n4. MDLZ - Step04 - Receiver Determination Edge\n5. MDLZ - Step06 - Outbound Processing Edge`;
        }
    }
    
    return {
        pipelinePackageName,
        pipelineIflowNames
    };
};

module.exports = fetchPipeline;