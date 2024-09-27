const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const wtcMasterService = require("./wtcMasterService");
const WarehouseService = require("../wareHouse/WareHouseService");
const companyService = require("../company/CompanyService");

const { searchKeys } = require("./wtcMasterSchema");
const { errorRes } = require("../../../utils/resError");
const {
  getQuery,
  getUserRoleData,
  getFieldsToDisplay,
  getAllowedField,
} = require("../../helper/utils");
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
const {
  checkFreezeQuantity,
  addRemoveFreezeQuantity,
} = require("../productGroupSummary/ProductGroupSummaryHelper");
const { getWTCCode } = require("./wtcMasterHelper");

//add start
exports.add = async (req, res) => {
  try {
    let {
      fromWarehouseId,
      companyId,
      toCompanyId,
      toWarehouseId,
      productSalesOrder,
      remark,
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
    const isToCompanyExists = await companyService.findCount({
      _id: toCompanyId,
      isDeleted: false,
    });
    if (!isToCompanyExists) {
      throw new ApiError(httpStatus.OK, "Invalid Company");
    }
    const isWarehouseExists = await WarehouseService.findCount({
      _id: fromWarehouseId,
      isDeleted: false,
    });
    if (!isWarehouseExists) {
      throw new ApiError(httpStatus.OK, "Invalid From Warehouse");
    }
    const isToWarehouseExists = await WarehouseService.findCount({
      _id: toWarehouseId,
      isDeleted: false,
    });
    if (!isToWarehouseExists) {
      throw new ApiError(httpStatus.OK, "Invalid To Warehouse");
    }

    /**
     * check duplicate exist
     */
    let wtcNumber = await getWTCCode(companyId);
    let dataExist = await wtcMasterService.isExists([{ wtcNumber }]);
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }
    const output = productSalesOrder.map((po) => {
      return {
        wtcNumber: wtcNumber,
        fromWarehouseId: fromWarehouseId,
        toWarehouseId: toWarehouseId,
        remark: remark,
        productSalesOrder: {
          productGroupId: po.productGroupId,
          rate: po.rate,
          quantity: po.quantity,
        },
        companyId: companyId,
        toCompanyId: toCompanyId,
      };
    });
    //------------------create data-------------------
    let dataCreated = await wtcMasterService.createMany(output);

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
    const { wtcData } = req.body;

    const wtcIds = wtcData?.map((ele) => ele?.id);
    const allwtcOfThisNumber = await wtcMasterService?.findAllWithQuery({
      wtcNumber: wtcData[0]?.wtcNumber,
    });
    const allwtcOfThisNumberResults = await Promise.all(allwtcOfThisNumber);

    // Update and set isDeleted to true for records not in wtcIds
    let orgIds = [];
    await Promise.all(
      allwtcOfThisNumber?.map(async (ele) => {
        orgIds.push(String(ele?._id));
        if (!wtcIds.includes(String(ele?._id))) {
          await wtcMasterService.getOneAndUpdate(
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
      wtcData?.map(async (ele) => {
        if (!orgIds.includes(ele.id)) {
          const { id, ...rest } = ele;

          await wtcMasterService.createNewData({ ...rest });
        }
      })
    );

    const updatePromises = wtcData?.map(async (ele) => {
      if (ele?.id !== "") {
        const dataUpdated = await wtcMasterService.getOneAndUpdate(
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
    let objectIdFields = ["fromWarehouseId", "toWarehouseId", "productGroupId"];
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
    let dataFound = await wtcMasterService.aggregateQuery(finalAggregateQuery);
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

    let result = await wtcMasterService.aggregateQuery(finalAggregateQuery);
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
    let booleanFields = ["firstApproved", "secondApproved"];
    let numberFileds = [];
    let objectIdFields = [
      "fromWarehouseId",
      "toWarehouseId",
      "companyId",
      "toCompanyId",
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
          from: "warehouses",
          localField: "fromWarehouseId",
          foreignField: "_id",
          as: "from_warehouse",
          pipeline: [{ $project: { wareHouseName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "warehouses",
          localField: "toWarehouseId",
          foreignField: "_id",
          as: "to_warehouse",
          pipeline: [{ $project: { wareHouseName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "companies",
          localField: "companyId",
          foreignField: "_id",
          as: "from_company",
          pipeline: [{ $project: { companyName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "companies",
          localField: "toCompanyId",
          foreignField: "_id",
          as: "to_company",
          pipeline: [{ $project: { companyName: 1 } }],
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
          fromWarehouseLabel: {
            $arrayElemAt: ["$from_warehouse.wareHouseName", 0],
          },

          toWarehouseLabel: {
            $arrayElemAt: ["$to_warehouse.wareHouseName", 0],
          },
          fromCompanyLabel: {
            $arrayElemAt: ["$from_company.companyName", 0],
          },

          toCompanyLabel: {
            $arrayElemAt: ["$to_company.companyName", 0],
          },
          "productSalesOrder.groupName": {
            $arrayElemAt: ["$productSalesOrders.groupName", 0],
          },
        },
      },

      {
        $unset: [
          "from_warehouse",
          "to_warehouse",
          "from_company",
          "to_company",
          "productSalesOrders",
        ],
      },
    ];
    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }
    let groupBywtcNumber = {
      $group: {
        _id: "$wtcNumber", // Group by the unique wtNumber field
        fromWarehouseLabel: { $first: "$fromWarehouseLabel" },
        toWarehouseLabel: { $first: "$toWarehouseLabel" },
        fromCompanyLabel: { $first: "$fromCompanyLabel" },
        toCompanyLabel: { $first: "$toCompanyLabel" },
        firstApproved: { $first: "$firstApproved" },
        firstApprovedActionBy: { $first: "$firstApprovedActionBy" },
        firstApprovedAt: { $first: "$firstApprovedAt" },
        secondApprovedActionBy: { $first: "$secondApprovedActionBy" },
        secondApprovedAt: { $first: "$secondApprovedAt" },
        secondApproved: { $first: "$secondApproved" },
        createdAt: { $first: "$createdAt" },
        updatedAt: { $first: "$updatedAt" },
        // count: { $sum: 1 }, // Count the documents in each group
        documents: { $push: "$$ROOT" }, // Store the documents in an array
      },
    };

    finalAggregateQuery.push({
      $match: matchQuery,
    });
    finalAggregateQuery.push(groupBywtcNumber);

    //-----------------------------------
    let dataFound = await wtcMasterService.aggregateQuery(finalAggregateQuery);

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
    let userRoleData = await getUserRoleData(req);
    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.wtcOrder,
      userRoleData,
      actionType.pagination
    );
    let result = await wtcMasterService.aggregateQuery(finalAggregateQuery);
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

    let dataExist = await wtcMasterService.findAllWithQuery(matchQuery);

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
exports.getByWtcNumber = async (req, res) => {
  try {
    let wtcnumberToBeSearch = req.params.wtcnumber;
    let dataExist = await wtcMasterService.findAllWithQuery({
      wtcNumber: wtcnumberToBeSearch,
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

//delete api
exports.deleteDocument = async (req, res) => {
  try {
    let wtcnumber = req.params.wtcnumber;

    let deleted = await wtcMasterService.updateMany(
      {
        wtcNumber: wtcnumber,
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
    let dataExist = await wtcMasterService.getOneByMultiField({ _id });
    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let isActive = dataExist.isActive ? false : true;

    let statusChanged = await wtcMasterService.getOneAndUpdate(
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

    let wtcNumberToBeSearch = req.params.wtcNumber;

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
    let datafound = await wtcMasterService.aggregateQuery([
      {
        $match: {
          wtcNumber: wtcNumberToBeSearch,
        },
      },
    ]);
    if (!datafound.length) {
      throw new ApiError(httpStatus.OK, `Request not found.`);
    }

    if (type === approvalType.second && secondApproved) {
      await Promise.all(
        datafound.map(async (item) => {
          const productSummary = await checkFreezeQuantity(
            req.userData.companyId,
            item.fromWarehouseId,
            item.productSalesOrder.productGroupId,
            item.productSalesOrder.quantity
          );

          if (!productSummary.status) {
            throw new ApiError(httpStatus.OK, productSummary.msg);
          }
        })
      );
      await Promise.all(
        datafound.map(async (item) => {
          const createdData = await addRemoveFreezeQuantity(
            req.userData.companyId,
            item.fromWarehouseId,
            item.productSalesOrder.productGroupId,
            item.productSalesOrder.quantity,
            "ADD"
          );

          if (!createdData.status) {
            throw new ApiError(httpStatus.OK, createdData.msg);
          }
        })
      );
    }

    const dataUpdated = await wtcMasterService.updateMany(
      {
        wtcNumber: wtcNumberToBeSearch,
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

// update wtc status
// update wtc status

exports.updatewtcStatus = async (req, res) => {
  try {
    let wtcnumber = req.params.wtcnumber;
    let status = req.params.status;
    let dataUpdated = await wtcMasterService.updateMany(
      {
        wtcNumber: wtcnumber,
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
