const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const mongoose = require("mongoose");
const dealerSupervisorService = require("../../services/DealerSupervisorService");
const dealerService = require("../../services/DealerService");
const { searchKeys } = require("../../model/DealerSupervisorSchema");
const { errorRes } = require("../../../utils/resError");

//add start
exports.add = async (req, res) => {
    try {
        let { dealerId, supervisorName } = req.body;

        const isDealerExists = await dealerService.findCount({
            _id: dealerId,
            isDeleted: false,
        });
        if (!isDealerExists) {
            throw new ApiError(httpStatus.OK, "Invalid Dealer");
        }

        //------------------create data-------------------

        let dataCreated = await dealerSupervisorService.createNewData({ ...req.body });

        if (dataCreated) {
            return res.status(httpStatus.CREATED).send({
                message: "Added successfully.",
                data: dataCreated,
                status: true,
                code: null,
                issue: null,
            });
        } else {
            throw new ApiError(httpStatus.NOT_IMPLEMENTED, `Something went wrong.`);
        }
    } catch (err) {
        let errData = errorRes(err);
        logger.info(errData.resData);
        let { message, status, data, code, issue } = errData.resData;
        return res
            .status(errData.statusCode)
            .send({ message, status, data, code, issue });
    }
};

//update start
exports.update = async (req, res) => {
    try {
        let { dealerId, supervisorName } = req.body;

        let idToBeSearch = req.params.id;

        const isDealerExists = await dealerService.findCount({
            _id: dealerId,
            isDeleted: false,
        });
        if (!isDealerExists) {
            throw new ApiError(httpStatus.OK, "Invalid Dealer");
        }

        //------------------Find data-------------------
        let datafound = await dealerSupervisorService.getOneByMultiField({
            _id: idToBeSearch,
            isDeleted: false
        });
        if (!datafound) {
            throw new ApiError(httpStatus.OK, `Dealer supervisor not found.`);
        }

        let dataUpdated = await dealerSupervisorService.getOneAndUpdate(
            {
                _id: idToBeSearch,
                isDeleted: false,
            },
            {
                $set: {
                    ...req.body,
                },
            }
        );

        if (dataUpdated) {
            return res.status(httpStatus.CREATED).send({
                message: "Updated successfully.",
                data: dataUpdated,
                status: true,
                code: null,
                issue: null,
            });
        } else {
            throw new ApiError(httpStatus.NOT_IMPLEMENTED, `Something went wrong.`);
        }
    } catch (err) {
        let errData = errorRes(err);
        logger.info(errData.resData);
        let { message, status, data, code, issue } = errData.resData;
        return res
            .status(errData.statusCode)
            .send({ message, status, data, code, issue });
    }
};
