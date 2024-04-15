const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const dtdTransferService = require("./DTDTransferService");
const { searchKeys } = require("./DTDTransferSchema");
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
const { default: mongoose } = require("mongoose");

//add start
exports.add = async (req, res) => {
  try {
    let { dtdNumber, toDealerId, remark, productDetails } = req.body;
    /**
     * check duplicate exist
     */
    let dataExist = await dtdTransferService.isExists([{ dtdNumber }]);
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }
    //------------------create data-------------------

    const output = productDetails.map((po) => {
      return {
        dtdNumber: dtdNumber,
        fromDealerId: req.userData.Id,
        toDealerId: toDealerId,
        remark: remark,
        productDetails: {
          productGroupId: po.productGroupId,
          rate: po.rate,
          quantity: po.quantity,
        },
        requestCreatedBy: req.userData.Id,
        companyId: req.userData.companyId,
      };
    });
    //------------------create data-------------------
    let dataCreated = await dtdTransferService.createMany(output);

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
    const { dtdData } = req.body;
    const dtdIds = dtdData?.map((ele) => ele?.id);
    const alldtdOfThisNumber = await dtdTransferService?.findAllWithQuery({
      dtdNumber: dtdData[0]?.dtdNumber,
    });
    const alldtdOfThisNumberResults = await Promise.all(alldtdOfThisNumber);

    // Update and set isDeleted to true for records not in dtdIds
    let orgIds = [];
    await Promise.all(
      alldtdOfThisNumber?.map(async (ele) => {
        orgIds.push(String(ele?._id));
        if (!dtdIds.includes(String(ele?._id))) {
          await dtdTransferService.getOneAndUpdate(
            {
              _id: new mongoose.Types.ObjectId(ele?._id), // Changed from ele?.id to ele?._id
              isDeleted: false,
            },
            {
              $set: {
                isDeleted: true,
              },
            }
          );
        }
      })
    );

    // inserting new
    await Promise.all(
      dtdData?.map(async (ele) => {
        if (!orgIds.includes(ele.id)) {
          const { id, ...rest } = ele;

          await dtdTransferService.createNewData({
            ...rest,
            companyId: req?.userData.companyId,
            requestCreatedBy: req?.userData?.Id,
          });
        }
      })
    );

    const updatePromises = dtdData?.map(async (ele) => {
      if (ele?.id !== "") {
        const dataUpdated = await dtdTransferService.getOneAndUpdate(
          {
            _id: new mongoose.Types.ObjectId(ele?.id), // Changed from ele?.id to ele?._id
            isDeleted: false,
          },
          {
            $set: {
              ...ele,
              companyId: req?.userData.companyId,
            },
          }
        );
        return dataUpdated;
      }
    });

    const updateResults = await Promise.all(updatePromises);

    // Check if any data was successfully updated
    const updatedDataFound = updateResults.some(
      (dataUpdated) => dataUpdated !== null
    );

    if (updatedDataFound) {
      return res.status(httpStatus.OK).send({
        message: "Updated successfully.",
        data: updateResults,
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
    let booleanFields = ["requestApproved"];
    let numberFileds = [];
    let objectIdFields = [
      "fromDealerId",
      "toDealerId",
      "requestCreatedBy",
      "requestApprovedBy",
      "companyId",
    ];
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
    let additionalQuery = [
      {
        $lookup: {
          from: "users",
          localField: "requestCreatedBy",
          foreignField: "_id",
          as: "req_created_data",
          pipeline: [{ $project: { firstName: 1, lastName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "requestApprovedBy",
          foreignField: "_id",
          as: "req_approved_data",
          pipeline: [{ $project: { firstName: 1, lastName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "dealers",
          localField: "fromDealerId",
          foreignField: "_id",
          as: "from_dealer_data",
          pipeline: [{ $project: { firstName: 1, lastName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "dealers",
          localField: "toDealerId",
          foreignField: "_id",
          as: "to_dealer_data",
          pipeline: [{ $project: { firstName: 1, lastName: 1 } }],
        },
      },
      {
        $addFields: {
          requestCreatedByLabel: {
            $concat: [
              { $arrayElemAt: ["$req_created_data.firstName", 0] },
              " ",
              { $arrayElemAt: ["$req_created_data.lastName", 0] },
            ],
          },
          requestApprovedByLabel: {
            $concat: [
              { $arrayElemAt: ["$req_approved_data.firstName", 0] },
              " ",
              { $arrayElemAt: ["$req_approved_data.lastName", 0] },
            ],
          },
          fromDealerLabelLabel: {
            $concat: [
              { $arrayElemAt: ["$from_dealer_data.firstName", 0] },
              " ",
              { $arrayElemAt: ["$from_dealer_data.lastName", 0] },
            ],
          },
          toDealerLabelLabel: {
            $concat: [
              { $arrayElemAt: ["$to_dealer_data.firstName", 0] },
              " ",
              { $arrayElemAt: ["$to_dealer_data.lastName", 0] },
            ],
          },
        },
      },

      {
        $unset: [
          "req_created_data",
          "req_approved_data",
          "from_dealer_data",
          "to_dealer_data",
        ],
      },
    ];

    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    finalAggregateQuery.push({
      $match: matchQuery,
    });

    //-----------------------------------
    let dataFound = await dtdTransferService.aggregateQuery(
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

    let result = await dtdTransferService.aggregateQuery(finalAggregateQuery);
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

//group by

exports.allFilterGroupPagination = async (req, res) => {
  try {
    var dateFilter = req.body.dateFilter;
    let searchValue = req.body.searchValue;
    let searchIn = req.body.params;
    let filterBy = req.body.filterBy;
    let rangeFilterBy = req.body.rangeFilterBy;
    let isPaginationRequired = req.body.isPaginationRequired
      ? req.body.isPaginationRequired
      : true;
    let myRequestId = req.body.myRequestId;

    let finalAggregateQuery = [];
    let matchQuery = {
      $and: [{ isDeleted: false }],
    };

    if (myRequestId) {
      matchQuery.$and.push({
        $or: [
          {
            fromDealerId: new mongoose.Types.ObjectId(myRequestId),
          },
          { toDealerId: new mongoose.Types.ObjectId(myRequestId) },
        ],
      });
    }

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
    let booleanFields = ["requestApproved"];
    let numberFileds = [];
    let objectIdFields = [
      "fromDealerId",
      "toDealerId",
      "requestCreatedBy",
      "requestApprovedBy",
      "companyId",
    ];

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
    let additionalQuery = [
      {
        $lookup: {
          from: "users",
          localField: "requestCreatedBy",
          foreignField: "_id",
          as: "req_created_data",
          pipeline: [{ $project: { firstName: 1, lastName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "requestApprovedBy",
          foreignField: "_id",
          as: "req_approved_data",
          pipeline: [{ $project: { firstName: 1, lastName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "dealers",
          localField: "fromDealerId",
          foreignField: "_id",
          as: "from_dealer_data",
          pipeline: [{ $project: { firstName: 1, lastName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "dealers",
          localField: "toDealerId",
          foreignField: "_id",
          as: "to_dealer_data",
          pipeline: [{ $project: { firstName: 1, lastName: 1 } }],
        },
      },

      {
        // "tax.taxId": "$tax.taxName",
        $addFields: {
          productDetails: {
            groupName: "",
            productGroupId: "$productDetails.productGroupId",
            quantity: "$productDetails.quantity",
            rate: "$productDetails.rate",
          },
        },
      },
      {
        $lookup: {
          from: "productgroups",
          localField: "productDetails.productGroupId",
          foreignField: "_id",
          as: "productDetailss",
          pipeline: [{ $project: { groupName: 1 } }],
        },
      },
      {
        $addFields: {
          requestCreatedByLabel: {
            $concat: [
              { $arrayElemAt: ["$req_created_data.firstName", 0] },
              " ",
              { $arrayElemAt: ["$req_created_data.lastName", 0] },
            ],
          },
          requestApprovedByLabel: {
            $concat: [
              { $arrayElemAt: ["$req_approved_data.firstName", 0] },
              " ",
              { $arrayElemAt: ["$req_approved_data.lastName", 0] },
            ],
          },
          fromDealerLabelLabel: {
            $concat: [
              { $arrayElemAt: ["$from_dealer_data.firstName", 0] },
              " ",
              { $arrayElemAt: ["$from_dealer_data.lastName", 0] },
            ],
          },
          toDealerLabelLabel: {
            $concat: [
              { $arrayElemAt: ["$to_dealer_data.firstName", 0] },
              " ",
              { $arrayElemAt: ["$to_dealer_data.lastName", 0] },
            ],
          },
          "productDetails.groupName": {
            $arrayElemAt: ["$productDetailss.groupName", 0],
          },
        },
      },

      {
        $unset: [
          "productDetailss",
          "req_created_data",
          "req_approved_data",
          "from_dealer_data",
          "to_dealer_data",
        ],
      },
    ];
    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }
    let groupBydtdNumber = {
      $group: {
        _id: "$dtdNumber", // Group by the unique wtNumber field
        fromDealerId: { $first: "$fromDealerId" },
        toDealerId: { $first: "$toDealerId" },
        remark: { $first: "$remark" },
        requestCreatedByLabel: { $first: "$requestCreatedByLabel" },
        requestApprovedByLabel: { $first: "$requestApprovedByLabel" },
        firstApprovedActionBy: { $first: "$firstApprovedActionBy" },
        requestApproved: { $first: "$requestApproved" },
        companyId: { $first: "$companyId" },

        createdAt: { $first: "$createdAt" },
        updatedAt: { $first: "$updatedAt" },
        // count: { $sum: 1 }, // Count the documents in each group
        documents: { $push: "$$ROOT" }, // Store the documents in an array
      },
    };

    finalAggregateQuery.push({
      $match: matchQuery,
    });
    finalAggregateQuery.push(groupBydtdNumber);

    //-----------------------------------
    let dataFound = await dtdTransferService.aggregateQuery(
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
    // let userRoleData = await getUserRoleData(req);
    // let fieldsToDisplay = getFieldsToDisplay(
    //   moduleType.wtcOrder,
    //   userRoleData,
    //   actionType.pagination
    // );
    let result = await dtdTransferService.aggregateQuery(finalAggregateQuery);
    // let allowedFields = getAllowedField(fieldsToDisplay, result);

    if (result?.length) {
      return res.status(200).send({
        data: result,
        totalPage: totalpages,
        status: true,
        currentPage: page,
        totalItem: totalData,
        pageSize: limit,
        message: "Data Found",
        code: "OK",
        issue: null,
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
    let additionalQuery = [
      { $match: matchQuery },
      {
        $lookup: {
          from: "users",
          localField: "requestCreatedBy",
          foreignField: "_id",
          as: "req_created_data",
          pipeline: [{ $project: { firstName: 1, lastName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "requestApprovedBy",
          foreignField: "_id",
          as: "req_approved_data",
          pipeline: [{ $project: { firstName: 1, lastName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "dealers",
          localField: "fromDealerId",
          foreignField: "_id",
          as: "from_dealer_data",
          pipeline: [{ $project: { firstName: 1, lastName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "dealers",
          localField: "toDealerId",
          foreignField: "_id",
          as: "to_dealer_data",
          pipeline: [{ $project: { firstName: 1, lastName: 1 } }],
        },
      },
      {
        $addFields: {
          requestCreatedByLabel: {
            $concat: [
              { $arrayElemAt: ["$req_created_data.firstName", 0] },
              " ",
              { $arrayElemAt: ["$req_created_data.lastName", 0] },
            ],
          },
          requestApprovedByLabel: {
            $concat: [
              { $arrayElemAt: ["$req_approved_data.firstName", 0] },
              " ",
              { $arrayElemAt: ["$req_approved_data.lastName", 0] },
            ],
          },
          fromDealerLabelLabel: {
            $concat: [
              { $arrayElemAt: ["$from_dealer_data.firstName", 0] },
              " ",
              { $arrayElemAt: ["$from_dealer_data.lastName", 0] },
            ],
          },
          toDealerLabelLabel: {
            $concat: [
              { $arrayElemAt: ["$to_dealer_data.firstName", 0] },
              " ",
              { $arrayElemAt: ["$to_dealer_data.lastName", 0] },
            ],
          },
        },
      },

      {
        $unset: [
          "req_created_data",
          "req_approved_data",
          "from_dealer_data",
          "to_dealer_data",
        ],
      },
    ];

    let dataExist = await dtdTransferService.aggregateQuery(additionalQuery);

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

//get by id
exports.getById = async (req, res) => {
  try {
    let dtdNoToBeSearch = req.params.dtdNo;

    let additionalQuery = [
      {
        $match: {
          dtdNumber: dtdNoToBeSearch,
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "requestCreatedBy",
          foreignField: "_id",
          as: "req_created_data",
          pipeline: [{ $project: { firstName: 1, lastName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "requestApprovedBy",
          foreignField: "_id",
          as: "req_approved_data",
          pipeline: [{ $project: { firstName: 1, lastName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "dealers",
          localField: "fromDealerId",
          foreignField: "_id",
          as: "from_dealer_data",
          pipeline: [{ $project: { firstName: 1, lastName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "dealers",
          localField: "toDealerId",
          foreignField: "_id",
          as: "to_dealer_data",
          pipeline: [{ $project: { firstName: 1, lastName: 1 } }],
        },
      },
      {
        $addFields: {
          requestCreatedByLabel: {
            $concat: [
              { $arrayElemAt: ["$req_created_data.firstName", 0] },
              " ",
              { $arrayElemAt: ["$req_created_data.lastName", 0] },
            ],
          },
          requestApprovedByLabel: {
            $concat: [
              { $arrayElemAt: ["$req_approved_data.firstName", 0] },
              " ",
              { $arrayElemAt: ["$req_approved_data.lastName", 0] },
            ],
          },
          fromDealerLabelLabel: {
            $concat: [
              { $arrayElemAt: ["$from_dealer_data.firstName", 0] },
              " ",
              { $arrayElemAt: ["$from_dealer_data.lastName", 0] },
            ],
          },
          toDealerLabelLabel: {
            $concat: [
              { $arrayElemAt: ["$to_dealer_data.firstName", 0] },
              " ",
              { $arrayElemAt: ["$to_dealer_data.lastName", 0] },
            ],
          },
        },
      },

      {
        $unset: [
          "req_created_data",
          "req_approved_data",
          "from_dealer_data",
          "to_dealer_data",
        ],
      },
    ];
    let dataExist = await dtdTransferService.aggregateQuery(additionalQuery);

    if (!dataExist?.length) {
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

//delete api
exports.deleteDocument = async (req, res) => {
  try {
    let dtdNo = req.params.dtdNo;
    if (!(await dtdTransferService.getOneByMultiField({ dtdNumber: dtdNo }))) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }

    let deleted = await dtdTransferService.updateMany(
      {
        dtdNumber: dtdNo,
        isDeleted: false,
      },
      {
        $set: {
          isDeleted: true,
        },
      }
    );
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
    let dataExist = await dtdTransferService.getOneByMultiField({ _id });
    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let isActive = dataExist.isActive ? false : true;

    let statusChanged = await dtdTransferService.getOneAndUpdate(
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

// approve

exports.updateApprove = async (req, res) => {
  try {
    let dtdNumberToBeSearch = req.params.dtdNo;
    let status = req.params.status;
    let dataExist = await dtdTransferService.getOneByMultiField({
      dtdNumber: dtdNumberToBeSearch,
    });
    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }

    const dataUpdated = await dtdTransferService.updateMany(
      {
        dtdNumber: dtdNumberToBeSearch,
        isDeleted: false,
      },
      {
        $set: { requestApprovedBy: req.userData.Id, requestApproved: status },
      }
    );

    if (!dataUpdated) {
      throw new ApiError(httpStatus.OK, "Some thing went wrong.");
    }
    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      status: true,
      data: dataUpdated,
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
