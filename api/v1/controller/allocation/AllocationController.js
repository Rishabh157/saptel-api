const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const mongoose = require("mongoose")
// -----------services-------------
const allocationService = require("../../services/AllocationService");
const companyService = require("../../services/CompanyService");
const assetLocationService = require("../../services/AssetLocationService")
const { searchKeys } = require("../../model/AllocationSchema");
const { errorRes } = require("../../../utils/resError");
const { getQuery } = require("../../helper/utils");

const {
    getSearchQuery,
    checkInvalidParams,
    getRangeQuery,
    getFilterQuery,
    getDateFilterQuery,
    getLimitAndTotalCount,
    getOrderByAndItsValue,
} = require("../../helper/paginationFilterHelper");

//add start
exports.add = async (req, res) => {
    try {
        let {
            allocationName,
            allocationDate,
            quantity,
            assetLocationId,
            remark,
            returnDate,
            companyId,
        } = req.body;

        /***check all ids exist */

        const isAssetLocationExist = await assetLocationService.findCount({
            _id: assetLocationId,
            isDeleted: false,
        });
        if (!isAssetLocationExist) {
            throw new ApiError(httpStatus.OK, "Invalid asset location.");
        }

        const isCompanyExists = await companyService.findCount({
            _id: companyId,
            isDeleted: false,
        });
        if (!isCompanyExists) {
            throw new ApiError(httpStatus.OK, "Invalid Company.");
        }

        //------------------create data-------------------
        let dataCreated = await allocationService.createNewData({ ...req.body });

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
        let {
            allocationName,
            allocationDate,
            quantity,
            assetLocationId,
            remark,
            returnDate,
            companyId,
        } = req.body;

        let idToBeSearch = req.params.id;

        /***check all ids exist */

        const isAssetLocationExist = await assetLocationService.findCount({
            _id: assetLocationId,
            isDeleted: false,
        });
        if (!isAssetLocationExist) {
            throw new ApiError(httpStatus.OK, "Invalid asset location.");
        }

        const isCompanyExists = await companyService.findCount({
            _id: companyId,
            isDeleted: false,
        });
        if (!isCompanyExists) {
            throw new ApiError(httpStatus.OK, "Invalid Company.");
        }

        //------------------Find data-------------------
        let datafound = await allocationService.getOneByMultiField({ _id: idToBeSearch });
        if (!datafound) {
            throw new ApiError(httpStatus.OK, `Allocation not found.`);
        }

        let dataUpdated = await allocationService.getOneAndUpdate(
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

// all filter pagination api
exports.allFilterPagination = async (req, res) => {
    try {
        var dateFilter = req.body.dateFilter;
        let searchValue = req.body.searchValue;
        let searchIn = req.body.params;
        let filterBy = req.body.filterBy;
        let rangeFilterBy = req.body.rangeFilterBy;
        let isPaginationRequired = req.body.isPaginationRequired
            ? req.body.isPaginationRequired
            : true;
        let finalAggregateQuery = [];
        let matchQuery = {
            $and: [{ isDeleted: false }],
        };
        /**
         * to send only active data on web
         */
        if (req.path.includes("/app/") || req.path.includes("/app")) {
            matchQuery.$and.push({ isActive: true });
        }

        let { orderBy, orderByValue } = getOrderByAndItsValue(
            req.body.orderBy,
            req.body.orderByValue
        );

        //----------------------------

        /**
         * check search keys valid
         **/

        let searchQueryCheck = checkInvalidParams(searchIn, searchKeys);

        if (searchQueryCheck && !searchQueryCheck.status) {
            return res.status(httpStatus.OK).send({
                ...searchQueryCheck,
            });
        }
        /**
         * get searchQuery
         */
        const searchQuery = getSearchQuery(searchIn, searchKeys, searchValue);
        if (searchQuery && searchQuery.length) {
            matchQuery.$and.push({ $or: searchQuery });
        }
        //----------------------------
        /**
         * get range filter query
         */
        const rangeQuery = getRangeQuery(rangeFilterBy);
        if (rangeQuery && rangeQuery.length) {
            matchQuery.$and.push(...rangeQuery);
        }

        //----------------------------
        /**
         * get filter query
         */
        let booleanFields = [];
        let numberFileds = ["quantity"];
        let objectIdFileds = [
            "assetLocationId",
            "companyId",
        ];

        const filterQuery = getFilterQuery(
            filterBy,
            booleanFields,
            numberFileds,
            objectIdFileds
        );
        if (filterQuery && filterQuery.length) {
            matchQuery.$and.push(...filterQuery);
        }
        //----------------------------
        //calander filter
        /**
         * ToDo : for date filter
         */

        let allowedDateFiletrKeys = ["createdAt", "updatedAt"];

        const datefilterQuery = await getDateFilterQuery(
            dateFilter,
            allowedDateFiletrKeys
        );
        if (datefilterQuery && datefilterQuery.length) {
            matchQuery.$and.push(...datefilterQuery);
        }

        //calander filter
        //----------------------------

        /**
         * for lookups , project , addfields or group in aggregate pipeline form dynamic quer in additionalQuery array
         */
        let additionalQuery = [
            {
                $lookup: {
                    from: "assetlocations",
                    localField: "assetLocationId",
                    foreignField: "_id",
                    as: "assetlocationData",
                },
            },

            {
                $addFields: {
                    assetlocationName: {
                        $arrayElemAt: ["$assetlocationData.locationName", 0],
                    },
                },
            },
            {
                $unset: ["assetlocationData"],
            },
        ];


        if (additionalQuery.length) {
            finalAggregateQuery.push(...additionalQuery);
        }

        finalAggregateQuery.push({
            $match: matchQuery,
        });

        //-----------------------------------
        let dataFound = await allocationService.aggregateQuery(finalAggregateQuery);
        if (dataFound.length === 0) {
            throw new ApiError(httpStatus.OK, `No data Found`);
        }

        let { limit, page, totalData, skip, totalpages } =
            await getLimitAndTotalCount(
                req.body.limit,
                req.body.page,
                dataFound.length,
                req.body.isPaginationRequired
            );

        finalAggregateQuery.push({ $sort: { [orderBy]: parseInt(orderByValue) } });
        if (isPaginationRequired) {
            finalAggregateQuery.push({ $skip: skip });
            finalAggregateQuery.push({ $limit: limit });
        }

        let result = await allocationService.aggregateQuery(finalAggregateQuery);
        if (result.length) {
            return res.status(httpStatus.OK).send({
                data: result,
                totalPage: totalpages,
                status: true,
                currentPage: page,
                totalItem: totalData,
                pageSize: limit,
                message: "Data Found",
            });
        } else {
            throw new ApiError(httpStatus.OK, `No data Found`);
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
//get api
exports.get = async (req, res) => {
    try {
        //if no default query then pass {}
        let matchQuery = { isDeleted: false };
        if (req.query && Object.keys(req.query).length) {
            matchQuery = getQuery(matchQuery, req.query);
        }

        let dataExist = await allocationService.aggregateQuery([
            { $match: { ...matchQuery } },
            {
                $lookup: {
                    from: "assetlocations",
                    localField: "assetLocationId",
                    foreignField: "_id",
                    as: "assetlocationData",
                },
            },
            {
                $addFields: {
                    assetlocationName: {
                        $arrayElemAt: ["$assetlocationData.locationName", 0],
                    },
                },
            },
            {
                $unset: ["assetlocationData"],
            },
        ]);
        if (!dataExist || !dataExist.length) {
            throw new ApiError(httpStatus.OK, "Data not found.");
        } else {
            return res.status(httpStatus.OK).send({
                message: "Successfull.",
                status: true,
                data: dataExist,
                code: null,
                issue: null,
            });
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

//single view api
exports.getById = async (req, res) => {
    try {
        let idToBeSearch = req.params.id;
        let additionalQuery = [
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(idToBeSearch),
                    isDeleted: false,
                },
            },
            {
                $lookup: {
                    from: "assetlocations",
                    localField: "assetLocationId",
                    foreignField: "_id",
                    as: "assetlocationData",
                },
            },
            {
                $addFields: {
                    assetlocationName: {
                        $arrayElemAt: ["$assetlocationData.locationName", 0],
                    },
                },
            },
            {
                $unset: ["assetlocationData"],
            },
        ];
        let dataExist = await allocationService.aggregateQuery(additionalQuery);

        if (!dataExist) {
            throw new ApiError(httpStatus.OK, "Data not found.");
        } else {
            return res.status(httpStatus.OK).send({
                message: "Successfull.",
                status: true,
                data: dataExist[0],
                code: null,
                issue: null,
            });
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

//delete api
exports.deleteDocument = async (req, res) => {
    try {
        let _id = req.params.id;
        if (!(await allocationService.getOneByMultiField({ _id }))) {
            throw new ApiError(httpStatus.OK, "Data not found.");
        }
        let deleted = await allocationService.getOneAndDelete({ _id });
        if (!deleted) {
            throw new ApiError(httpStatus.OK, "Some thing went wrong.");
        }
        return res.status(httpStatus.OK).send({
            message: "Successfull.",
            status: true,
            data: null,
            code: null,
            issue: null,
        });
    } catch (err) {
        let errData = errorRes(err);
        logger.info(errData.resData);
        let { message, status, data, code, issue } = errData.resData;
        return res
            .status(errData.statusCode)
            .send({ message, status, data, code, issue });
    }
};
//statusChange
exports.statusChange = async (req, res) => {
    try {
        let _id = req.params.id;
        let dataExist = await allocationService.getOneByMultiField({ _id });
        if (!dataExist) {
            throw new ApiError(httpStatus.OK, "Data not found.");
        }
        let isActive = dataExist.isActive ? false : true;

        let statusChanged = await allocationService.getOneAndUpdate(
            { _id },
            { isActive }
        );
        if (!statusChanged) {
            throw new ApiError(httpStatus.OK, "Some thing went wrong.");
        }
        return res.status(httpStatus.OK).send({
            message: "Successfull.",
            status: true,
            data: statusChanged,
            code: null,
            issue: null,
        });
    } catch (err) {
        let errData = errorRes(err);
        logger.info(errData.resData);
        let { message, status, data, code, issue } = errData.resData;
        return res
            .status(errData.statusCode)
            .send({ message, status, data, code, issue });
    }
};
