function normalizeIflowPayload(body) {
    const { iflow, reviewerName, senderComponent, iflows, grouped } = body;

    if (iflows && Array.isArray(iflows)) {
        return iflows; // already in final format
    }

    if (Array.isArray(iflow)) {
        if(grouped) {
            return [body];
        }
        return iflow.map(flow => ({
            iflow: flow,
            reviewerName,
            senderComponent,
            grouped:false
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