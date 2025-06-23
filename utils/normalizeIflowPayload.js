const normalizeIflowPayload = (body) => {
    const { iflow, reviewerName, senderComponent, iflows, grouped, senderInterface } = body;

    //! Return already structured input
    if (iflows && Array.isArray(iflows)) {
        return iflows; // already in final format
    }

    //! When multiple Iflow passed at once
    if (Array.isArray(iflow)) {
        if (grouped) {
            return [body];
        }
        return iflow.map(flow => ({
            iflow: flow,
            reviewerName,
            senderComponent,
        }));
    }

    //! single iFlow/SenderInterface object found
    if (iflow?.trim()) {
        return [{ iflow, reviewerName, senderComponent }];
    } else if (senderInterface?.trim()) {
        let region = body.region?.toUpperCase() || "";
        if (region && (region === 'LA' || region === 'NA')) {
            return [{ reviewerName, senderComponent, senderInterface, region }];
        } else {
            throw new Error("Enter a Valid Region like LA or NA")
        }
    } else {
        throw new Error("Invalid Input: Supply either valid 'iflow', or BOTH 'senderInterface' and 'region'.")
    }
}

module.exports = normalizeIflowPayload;