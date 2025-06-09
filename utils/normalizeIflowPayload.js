function normalizeIflowPayload(body) {
    const { iflow, reviewerName, senderComponent, iflows } = body;

    if (Array.isArray(iflows)) {
        return iflows; // already in final format
    }

    if (Array.isArray(iflow)) {
        return iflow.map(flow => ({
            iflow: flow,
            reviewerName,
            senderComponent
        }));
    }

    // single iFlow object
    return [{
        iflow,
        reviewerName,
        senderComponent
    }];
}

module.exports = normalizeIflowPayload;