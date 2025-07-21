const normalizeIflowPayload = (body) => {
    const iflowJson = {
        IDD: 'IDD100006',
        DESCRIPTION: 'ECC_AM_Common_to_B2B',
        RESOURCE: 'Faizan',
        PATTERN: 'OB Idoc \\JMS',
        PROCESS_AREA: 'B2B',
        PACKAGE: 'B2B_LA_RTR_STP_OTC_SAPS4',
        IFLOW: 'SAPS4_LA_BATMAS_To_B2B_IDD100006_EIC',
        SENDER_CHANNEL: 'CC_IDOC_S_AM_ECC100',
        SENDER_SERVICE: 'SYS_ECCP_100_AM',
        SENDER_INTERFACE: 'BATMAS.YMTI_SKU_STATUS',
        SENDER_NAMESPACE: 'urn:sap-com:document:sap:idoc:messages',
        OPERATION_MAPPING: '',
        RECEIVER_SERVICE: 'SYS_B2B_AM',
        RECEIVER_INTERFACE: 'BATMAS.YMTI_SKU_STATUS',
        RECEIVER_CHANNEL: 'CC_JMS_R_AM_ECC_To_B2B_3PL_Common',
        REGION: 'LA',
        RUNTIME: 'EIC',
        IFLOW_OVERVIEW: 'This interface receives IDOC messages regarding SKU status from the SAP S/4HANA system and transmits them to a B2B system via a JMS queue for further processing.'
    }

    return iflowJson;
}

module.exports = normalizeIflowPayload;