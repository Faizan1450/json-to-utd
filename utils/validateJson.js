const asyncHandler = require("express-async-handler");

const validateJson = asyncHandler(async (iflowJson) => {
    //! Validating Runtime (Although RUNTIME Cannot be an Array)
    let runtime = iflowJson.RUNTIME[0].RUNTIME.toUpperCase();
    if (runtime.includes("CLOUD")) {
        runtime = "Cloud";
    } else if (runtime.includes("EIC")) {
        runtime = "EIC";
    } else {
        console.error("Runtime Not Detected")
        runtime = "";
    }
    iflowJson.RUNTIME.forEach(obj => {
        if (runtime === "" || runtime === obj.RUNTIME) {
            return;
        }
        const error = new Error(`Not Allowed the creation of common UTD for both ${JSON.stringify(iflowJson.RUNTIME)}`);
        error.statusCode = 422;
        error.status = "Validation Failed"
        throw error;
    });
    iflowJson.RUNTIME = runtime;

    //! Validating Region
    if (iflowJson.REGION.length >= 2) {
        const error = new Error(`Not Allowed the creation of common UTD for both ${JSON.stringify(iflowJson.REGION)}! Check the sheet for correct input`);
        error.statusCode = 422;
        error.status = "Validation Failed"
        throw error;
    }
    iflowJson.REGION = iflowJson.REGION[0].REGION.toUpperCase();

    //! Validating Senders Interface
    if (iflowJson.SENDER_INTERFACE.length >= 2) {
        const error = new Error(`Multiple Sender Interface Involved! ${JSON.stringify(iflowJson.SENDER_INTERFACE)} Two Saperate UTDs recommended`);
        error.statusCode = 422;
        error.status = "Validation Failed"
        throw error;
    }
    iflowJson.SENDER_INTERFACE = iflowJson.SENDER_INTERFACE[0].SENDER_INTERFACE;

    //! Validating SENDER CHANNEL
    if (iflowJson.SENDER_CHANNEL.length >= 2) {
        const error = new Error(`Multiple Sender Channels Involved! ${JSON.stringify(iflowJson.SENDER_CHANNEL)} Two Saperate UTDs recommended`);
        error.statusCode = 422;
        error.status = "Validation Failed"
        throw error;
    }
    iflowJson.SENDER_CHANNEL = iflowJson.SENDER_CHANNEL[0].SENDER_CHANNEL;

    //! Validating SENDER NAMESPACE
    if (iflowJson.SENDER_NAMESPACE.length >= 2) {
        const error = new Error(`Multiple Sender Namespaces Involved! ${JSON.stringify(iflowJson.SENDER_NAMESPACE)} Two Saperate UTDs recommended`);
        error.statusCode = 422;
        error.status = "Validation Failed"
        throw error;
    }
    iflowJson.SENDER_NAMESPACE = iflowJson.SENDER_NAMESPACE[0].SENDER_NAMESPACE;

    //! Validating SENDER SERVICE
    if (iflowJson.SENDER_SERVICE.length >= 2) {
        const error = new Error(`Multiple Sender Services Involved! ${JSON.stringify(iflowJson.SENDER_SERVICE)} Two Saperate UTDs recommended`);
        error.statusCode = 422;
        error.status = "Validation Failed"
        throw error;
    }
    iflowJson.SENDER_SERVICE = iflowJson.SENDER_SERVICE[0].SENDER_SERVICE;

    //! Validating SENDER ADAPTER
    if (iflowJson.SENDER_ADAPTER.length >= 2) {
        const error = new Error(`Multiple Sender Adapters Involved! ${JSON.stringify(iflowJson.SENDER_ADAPTER)} Two Saperate UTDs recommended`);
        error.statusCode = 422;
        error.status = "Validation Failed"
        throw error;
    }
    iflowJson.SENDER_ADAPTER = iflowJson.SENDER_ADAPTER[0].SENDER_ADAPTER;

    //! Validating SOURCE
    if (iflowJson.SOURCE.length >= 2) {
        let sourceValue = iflowJson.SOURCE[0].SOURCE;
        iflowJson.SOURCE.forEach(obj => {
            if (sourceValue != obj.SOURCE) {
                const error = new Error(`Multiple Sender Partners Involved! ${JSON.stringify(iflowJson.SOURCE)} Two Saperate UTDs recommended`);
                error.statusCode = 422;
                error.status = "Validation Failed"
                throw error;
            }
        })
    }
    iflowJson.SOURCE = iflowJson.SOURCE[0].SOURCE

    //! Validating SOURCE NAME
    if (iflowJson.SOURCE_NAME.length >= 2) {

        let sourceValue = iflowJson.SOURCE_NAME[0].SOURCE_NAME;
        iflowJson.SOURCE_NAME.forEach(obj => {
            if (sourceValue != obj.SOURCE_NAME) {
                const error = new Error(`Multiple Sender Partners Involved! ${JSON.stringify(iflowJson.SOURCE_NAME)} Two Saperate UTDs recommended`);
                error.statusCode = 422;
                error.status = "Validation Failed"
                throw error;
            }
        })
    }
    iflowJson.SOURCE_NAME = iflowJson.SOURCE_NAME[0].SOURCE_NAME

    //! Validating Resource Name
    iflowJson.RESOURCE = iflowJson.RESOURCE ? iflowJson.RESOURCE : "Not Assigned"
});

module.exports = validateJson;