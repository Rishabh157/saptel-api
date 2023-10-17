const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const rtvMasterService = require("./RtvMasterService");
const { searchKeys } = require("./RtvMasterSchema");
const { errorRes } = require("../../../utils/resError");
const {
  getQuery,
  getUserRoleData,
  getFieldsToDisplay,
  getAllowedField,
} = require("../../helper/utils");
const companyService = require("../company/CompanyService");
const mongoose = require("mongoose");

const {
  getSearchQuery,
  checkInvalidParams,
  getRangeQuery,
  getFilterQuery,
  getDateFilterQuery,
  getLimitAndTotalCount,
  getOrderByAndItsValue,
} = require("../../helper/paginationFilterHelper");
const {
  moduleType,
  actionType,
  approvalType,
} = require("../../helper/enumUtils");

//add start
exports.add = async (req, res) => {
  try {
    let {
      rtvNumber,
      vendorId,
      warehouseId,
      companyId,
      remark,
      productSalesOrder,
    } = req.body;
    /**
     * check duplicate exist
     */
    const isCompanyExists = await companyService.findCount({
      _id: companyId,
      isDeleted: false,
    });
    if (!isCompanyExists) {
      throw new ApiError(httpStatus.OK, "Invalid Company");
    }

    /**
     * check duplicate exist
     */
    let dataExist = await rtvMasterService.isExists([{ rtvNumber }]);
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }
    const output = productSalesOrder.map((po) => {
      return {
        rtvNumber: rtvNumber,
        warehouseId: warehouseId,
        vendorId: vendorId,
        productSalesOrder: {
          productGroupId: po.productGroupId,
          rate: po.rate,
          quantity: po.quantity,
        },
        companyId: companyId,
        remark: remark,
      };
    });
    //------------------create data-------------------
    let dataCreated = await rtvMasterService.createMany(output);

    if (dataCreated) {
      return res.status(httpStatus.CREATED).send({
        message: "Added successfully.",
        data: dataCreated,
        status: true,
        code: "CREATED",
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
    const { rtvData } = req.body;

    const rtvIds = rtvData?.map((ele) => ele?.id);
    const allrtvOfThisNumber = await rtvMasterService?.findAllWithQuery({
      rtvNumber: rtvData[0]?.rtvNumber,
    });
    const allrtvOfThisNumberResults = await Promise.all(allrtvOfThisNumber);

    // Update and set isDeleted to true for records not in rtvIds
    let orgIds = [];
    await Promise.all(
      allrtvOfThisNumber?.map(async (ele) => {
        orgIds.push(String(ele?._id));
        if (!rtvIds.includes(String(ele?._id))) {
          console.log("updateing.........");
          await rtvMasterService.getOneAndUpdate(
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
      rtvData?.map(async (ele) => {
        if (!orgIds.includes(ele.id)) {
          const { id, ...rest } = ele;
          console.log("creating", rest);

          await rtvMasterService.createNewData({ ...rest });
        }
      })
    );

    const updatePromises = rtvData?.map(async (ele) => {
      if (ele?.id !== "") {
        const dataUpdated = await rtvMasterService.getOneAndUpdate(
          {
            _id: new mongoose.Types.ObjectId(ele?.id), // Changed from ele?.id to ele?._id
            isDeleted: false,
          },
          {
            $set: {
              ...ele,
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
    let booleanFields = [];
    let numberFileds = [];
    let objectIdFields = ["vendorId", "warehouseId", "productGroupId"];
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
    let dataFound = await rtvMasterService.aggregateQuery(finalAggregateQuery);
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

    let result = await rtvMasterService.aggregateQuery(finalAggregateQuery);
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

// group by
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
    let finalAggregateQuery = [];
    let matchQuery = {
      $and: [{ isDeleted: false }],
    };
    /**
     * to send only active data on web
     */
    console.log("here");
    if (req.path.includes("/app/") || req.path.includes("/app")) {
      matchQuery.$and.push({ isActive: true });
    }
    console.log("here 2");
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
    let booleanFields = ["firstApproved", "secondApproved"];
    let numberFileds = [];
    let objectIdFields = ["vendorId", "warehouseId", "companyId"];

    const filterQuery = getFilterQuery(
      filterBy,
      booleanFields,
      numberFileds,
      objectIdFields
    );
    console.log(filterQuery, "filterQuery");
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
          from: "vendors",
          localField: "vendorId",
          foreignField: "_id",
          as: "vendor_name",
          pipeline: [{ $project: { companyName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "warehouses",
          localField: "warehouseId",
          foreignField: "_id",
          as: "warehouseData",
          pipeline: [{ $project: { wareHouseName: 1 } }],
        },
      },

      {
        // "tax.taxId": "$tax.taxName",
        $addFields: {
          productSalesOrder: {
            groupName: "",
            productGroupId: "$productSalesOrder.productGroupId",
            quantity: "$productSalesOrder.quantity",
            rate: "$productSalesOrder.rate",
          },
        },
      },
      {
        $lookup: {
          from: "productgroups",
          localField: "productSalesOrder.productGroupId",
          foreignField: "_id",
          as: "productSalesOrders",
          pipeline: [{ $project: { groupName: 1 } }],
        },
      },
      {
        $addFields: {
          vendorLabel: {
            $arrayElemAt: ["$vendor_name.companyName", 0],
          },

          warehouseLabel: {
            $arrayElemAt: ["$warehouseData.wareHouseName", 0],
          },
          "productSalesOrder.groupName": {
            $arrayElemAt: ["$productSalesOrders.groupName", 0],
          },
        },
      },

      {
        $unset: ["vendor_name", "warehouseData", "productSalesOrders"],
      },
    ];
    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }
    let groupByrtvNumber = {
      $group: {
        _id: "$rtvNumber", // Group by the unique rtvNumber field
        warehouseLabel: { $first: "$warehouseLabel" },
        vendorLabel: { $first: "$vendorLabel" },
        firstApproved: { $first: "$firstApproved" },
        firstApprovedActionBy: { $first: "$firstApprovedActionBy" },
        firstApprovedAt: { $first: "$firstApprovedAt" },
        secondApprovedActionBy: { $first: "$secondApprovedActionBy" },
        secondApprovedAt: { $first: "$secondApprovedAt" },
        secondApproved: { $first: "$secondApproved" },
        createdAt: { $first: "$createdAt" },
        updatedAt: { $first: "$updatedAt" },
        status: { $first: "$status" },
        isDeleted: { $first: "$isDeleted" },
        companyId: { $first: "$companyId" },
        vendorId: { $first: "$vendorId" },
        warehouseId: { $first: "$warehouseId" },
        // count: { $sum: 1 }, // Count the documents in each group
        documents: { $push: "$$ROOT" }, // Store the documents in an array
      },
    };

    finalAggregateQuery.push(groupByrtvNumber);
    finalAggregateQuery.push({
      $match: matchQuery,
    });

    console.log(matchQuery, "matchQuery");
    //-----------------------------------
    let dataFound = await rtvMasterService.aggregateQuery(finalAggregateQuery);
    console.log(dataFound, "data");
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
    let userRoleData = await getUserRoleData(req, rtvMasterService);
    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.rtvOrder,
      userRoleData,
      actionType.pagination
    );
    let result = await rtvMasterService.aggregateQuery(finalAggregateQuery);
    let allowedFields = getAllowedField(fieldsToDisplay, result);

    if (allowedFields?.length) {
      return res.status(200).send({
        data: allowedFields,
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

    let dataExist = await rtvMasterService.findAllWithQuery(matchQuery);

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
exports.getByRtvNumber = async (req, res) => {
  try {
    let rtvnumberToBeSearch = req.params.rtvnumber;
    let dataExist = await rtvMasterService.findAllWithQuery({
      rtvNumber: rtvnumberToBeSearch,
      isDeleted: false,
    });

    if (!dataExist) {
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

// update rtv status

exports.updateRtvStatus = async (req, res) => {
  try {
    let rtvnumber = req.params.rtvnumber;
    let status = req.params.status;
    let dataUpdated = await rtvMasterService.updateMany(
      {
        rtvNumber: rtvnumber,
        isDeleted: false,
      },
      {
        $set: {
          status: status,
        },
      }
    );

    if (!dataUpdated) {
      throw new ApiError(httpStatus.OK, "Something went wrong.");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successfull.",
        status: true,
        data: dataUpdated,
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
    let rtvnumber = req.params.rtvnumber;
    console.log(rtvnumber, "rtvnumber");
    // const rtvExists = await rtvMasterService.getOneByMultiField({
    //   rtvNumber: rtvnumber,
    // });
    // if (!rtvExists) {
    //   throw new ApiError(httpStatus.OK, "Data not found.");
    // }
    // const deleteRefCheck = await checkIdInCollectionsThenDelete(
    //   collectionArrToMatch,
    //   "salesOrderId",
    //   rtvExists._id
    // );

    // if (deleteRefCheck.status === true) {
    let deleted = await rtvMasterService.updateMany(
      {
        rtvNumber: rtvnumber,
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
    // }
    return res.status(httpStatus.OK).send({
      message: "Deleted successfully",
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
//statusChange
exports.statusChange = async (req, res) => {
  try {
    let _id = req.params.id;
    let dataExist = await rtvMasterService.getOneByMultiField({ _id });
    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let isActive = dataExist.isActive ? false : true;

    let statusChanged = await rtvMasterService.getOneAndUpdate(
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

//update start
exports.updateLevel = async (req, res) => {
  try {
    let {
      firstApprovedAt,
      secondApprovedAt,
      type,
      firstApprovedById,
      secondApprovedById,
      firstApprovedActionBy,
      secondApproved,
      secondApprovedActionBy,
      firstApproved,
    } = req.body;

    let rtvNumberToBeSearch = req.params.rtvNumber;

    let dataToSend = {};
    if (type === approvalType.second) {
      (dataToSend.secondApprovedById = secondApprovedById),
        (dataToSend.secondApprovedActionBy = secondApprovedActionBy),
        (dataToSend.secondApprovedAt = secondApprovedAt);
      dataToSend.secondApproved = secondApproved;
    } else {
      (dataToSend.firstApprovedById = firstApprovedById),
        (dataToSend.firstApprovedActionBy = firstApprovedActionBy),
        (dataToSend.firstApprovedAt = firstApprovedAt);
      dataToSend.firstApproved = firstApproved;
    }

    //------------------Find data-------------------
    let datafound = await rtvMasterService.getOneByMultiField({
      rtvNumber: rtvNumberToBeSearch,
    });
    if (!datafound) {
      throw new ApiError(httpStatus.OK, `RTV not found.`);
    }

    const dataUpdated = await rtvMasterService.updateMany(
      {
        rtvNumber: rtvNumberToBeSearch,
        isDeleted: false,
      },
      {
        $set: dataToSend,
      }
    );

    //------------------create data-------------------

    if (dataUpdated) {
      return res.status(httpStatus.OK).send({
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
