const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const mongoose = require("mongoose");
const userRoleService = require("./UserRoleService");
const { searchKeys } = require("./UserRoleSchema");
const { errorRes } = require("../../../utils/resError");
const { getQuery } = require("../../helper/utils");
const companyService = require("../company/CompanyService");
const { checkIdInCollectionsThenDelete, collectionArrToMatch } = require("../../helper/commonHelper")

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
        let { roleName, companyId } = req.body;

        /**
        * check duplicate exist
        */
        let dataExist = await userRoleService.isExists([{ roleName }]);
        if (dataExist.exists && dataExist.existsSummary) {
            throw new ApiError(httpStatus.OK, dataExist.existsSummary);
        }

        const isCompanyExists = await companyService.findCount({
            _id: companyId,
            isDeleted: false,
        });
        if (!isCompanyExists) {
            throw new ApiError(httpStatus.OK, "Invalid Company");
        }
        //------------------create data-------------------

        let dataCreated = await userRoleService.createNewData({ ...req.body });

        if (dataCreated) {
            return res.status(httpStatus.CREATED).send({
                message: "Added successfully.",
                data: dataCreated,
                status: true,
                code: "OK",
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
        let { roleName, companyId } = req.body;

        let idToBeSearch = req.params.id;

        const isCompanyExists = await companyService.findCount({
            _id: companyId,
            isDeleted: false,
        });
        if (!isCompanyExists) {
            throw new ApiError(httpStatus.OK, "Invalid Company");
        }

        //------------------Find data-------------------
        let datafound = await userRoleService.getOneByMultiField({
            _id: idToBeSearch,
            isDeleted: false
        });
        if (!datafound) {
            throw new ApiError(httpStatus.OK, `Dealer role not found.`);
        }

        let dataUpdated = await userRoleService.getOneAndUpdate(
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
                code: "OK",
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
        let numberFileds = [];
        let objectIdFields = [];

        const filterQuery = getFilterQuery(
            filterBy,
            booleanFields,
            numberFileds,
            objectIdFields
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
        let additionalQuery = [];
        if (additionalQuery.length) {
            finalAggregateQuery.push(...additionalQuery);
        }

        finalAggregateQuery.push({
            $match: matchQuery,
        });

        //-----------------------------------
        let dataFound = await userRoleService.aggregateQuery(
            finalAggregateQuery
        );
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

        let result = await userRoleService.aggregateQuery(finalAggregateQuery);
        if (result.length) {
            return res.status(200).send({
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

//delete api
exports.deleteDocument = async (req, res) => {
    try {
        let _id = req.params.id;
        if (!(await userRoleService.getOneByMultiField({ _id }))) {
            throw new ApiError(httpStatus.OK, "Data not found.");
        }
        const deleteRefCheck = await checkIdInCollectionsThenDelete(collectionArrToMatch, 'userRoleId', _id)

        if (deleteRefCheck.status === true) {
            let deleted = await userRoleService.getOneAndDelete({ _id });
            if (!deleted) {
                throw new ApiError(httpStatus.OK, "Some thing went wrong.");
            }
        }
        return res.status(httpStatus.OK).send({
            message: deleteRefCheck.message,
            status: true,
            data: null,
            code: "OK",
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

// get by id
exports.getById = async (req, res) => {
    try {
        //if no default query then pass {}
        let idToBeSearch = req.params.id;

        let additionalQuery = [
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(idToBeSearch),
                    isDeleted: false,
                },
            },
        ];
        let dataExist = await userRoleService.aggregateQuery(additionalQuery);
        if (!dataExist.length) {
            throw new ApiError(httpStatus.OK, "Data not found.");
        } else {
            return res.status(httpStatus.OK).send({
                message: "Successfull.",
                status: true,
                data: dataExist[0],
                code: "OK",
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

//statusChange
exports.statusChange = async (req, res) => {
    try {
        let _id = req.params.id;
        let dataExist = await userRoleService.getOneByMultiField({ _id });
        if (!dataExist) {
            throw new ApiError(httpStatus.OK, "Data not found.");
        }
        let isActive = dataExist.isActive ? false : true;

        let statusChanged = await userRoleService.getOneAndUpdate(
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
            code: "OK",
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