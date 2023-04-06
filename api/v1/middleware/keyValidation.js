exports.keyValidation = (req, res, reqparams, requiredkeys) => {
    let reqName = req.baseUrl.replace("/", "")
    if (Object.keys(req.body).length === 0) {
        return {
            message: reqName + " information is required",
            status: false,
        };
    }
    for (key in req.body) {
        if (!reqparams.includes(key)) {
            return {
                message: key + " key does not exists",
                status: false,
            };
        }
    }

    var inputKeys = Object.keys(req.body);
    if (requiredkeys.length > 0) {
        for (let ind in requiredkeys) {
            if (!inputKeys.includes(requiredkeys[ind])) {

                return {
                    message: requiredkeys[ind] + " is required.",
                    status: false,
                };
            } else {

                if (typeof req.body[requiredkeys[ind]] !== "string") {
                    if (req.body[requiredkeys[ind]] === null) {


                        return {
                            message: requiredkeys[ind] + " is required.",
                            status: false,
                        };
                    }
                }
                else {
                    if (
                        req.body[requiredkeys[ind]] === undefined ||
                        req.body[requiredkeys[ind]] === null
                    ) {
                        return {
                            message: requiredkeys[ind] + " is required.",
                            status: false,
                        };
                    }
                }
            }
        }
    }
    return {
        message: "all good",
        status: true,
    };
};