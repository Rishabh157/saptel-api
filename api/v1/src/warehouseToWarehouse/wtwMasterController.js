const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const wtwMasterService = require("./wtwMasterService");
const WarehouseService = require("../wareHouse/WareHouseService");

const companyService = require("../company/CompanyService");
const { searchKeys } = require("./wtwMasterSchema");
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
const { getWTWCode, getWTWInvoiceNumber } = require("./wtwMasterHelper");

//add start
exports.add = async (req, res) => {
  try {
    let {
      fromWarehouseId,
      companyId,
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
    let wtNumber = await getWTWCode(companyId);

    const output = productSalesOrder.map((po) => {
      return {
        wtNumber: wtNumber,
        fromWarehouseId: fromWarehouseId,
        toWarehouseId: toWarehouseId,
        remark: remark,
        productSalesOrder: {
          productGroupId: po.productGroupId,
          rate: po.rate,
          quantity: po.quantity,
        },
        companyId: companyId,
      };
    });
    //------------------create data-------------------
    let dataCreated = await wtwMasterService.createMany(output);

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
    const { wtwData } = req.body;

    const wtwIds = wtwData?.map((ele) => ele?.id);
    const allrtvOfThisNumber = await wtwMasterService?.findAllWithQuery({
      wtNumber: wtwData[0]?.wtNumber,
    });
    const allrtvOfThisNumberResults = await Promise.all(allrtvOfThisNumber);

    // Update and set isDeleted to true for records not in wtwIds
    let orgIds = [];
    await Promise.all(
      allrtvOfThisNumber?.map(async (ele) => {
        orgIds.push(String(ele?._id));
        if (!wtwIds.includes(String(ele?._id))) {
          await wtwMasterService.getOneAndUpdate(
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
      wtwData?.map(async (ele) => {
        if (!orgIds.includes(ele.id)) {
          const { id, ...rest } = ele;

          await wtwMasterService.createNewData({ ...rest });
        }
      })
    );

    const updatePromises = wtwData?.map(async (ele) => {
      if (ele?.id !== "") {
        const dataUpdated = await wtwMasterService.getOneAndUpdate(
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
    let dataFound = await wtwMasterService.aggregateQuery(finalAggregateQuery);
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

    let result = await wtwMasterService.aggregateQuery(finalAggregateQuery);
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
    let objectIdFields = ["fromWarehouseId", "toWarehouseId", "companyId"];

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
          "productSalesOrder.groupName": {
            $arrayElemAt: ["$productSalesOrders.groupName", 0],
          },
        },
      },

      {
        $unset: ["from_warehouse", "to_warehouse", "productSalesOrders"],
      },
    ];
    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }
    let groupBywtNumber = {
      $group: {
        _id: "$wtNumber", // Group by the unique wtNumber field
        fromWarehouseLabel: { $first: "$fromWarehouseLabel" },
        toWarehouseLabel: { $first: "$toWarehouseLabel" },
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
    finalAggregateQuery.push(groupBywtNumber);

    //-----------------------------------

    let dataFound = await wtwMasterService.aggregateQuery(finalAggregateQuery);

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
      moduleType.wtwOrder,
      userRoleData,
      actionType.pagination
    );
    let result = await wtwMasterService.aggregateQuery(finalAggregateQuery);
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

    let dataExist = await wtwMasterService.findAllWithQuery(matchQuery);

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
    let wtnumberToBeSearch = req.params.wtnumber;

    let dataExist = await wtwMasterService.findAllWithQuery({
      wtNumber: wtnumberToBeSearch,
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
    let wtwnumber = req.params.wtnumber;

    let deleted = await wtwMasterService.updateMany(
      {
        wtNumber: wtwnumber,
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
    let dataExist = await wtwMasterService.getOneByMultiField({ _id });
    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let isActive = dataExist.isActive ? false : true;

    let statusChanged = await wtwMasterService.getOneAndUpdate(
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
    const {
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

    const wtNumberToBeSearch = req.params.wtNumber;

    // Find data
    const datafound = await wtwMasterService.aggregateQuery([
      {
        $match: {
          wtNumber: wtNumberToBeSearch,
        },
      },
    ]);

    if (!datafound.length) {
      throw new ApiError(httpStatus.OK, "Request not found.");
    }

    const dataToSend = {};

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

      Object.assign(dataToSend, {
        secondApprovedById,
        secondApprovedActionBy,
        secondApprovedAt,
        secondApproved,
        invoiceDate: new Date(),
        invoiceNumber: await getWTWInvoiceNumber(wtNumberToBeSearch),
      });
    } else {
      Object.assign(dataToSend, {
        firstApprovedById,
        firstApprovedActionBy,
        firstApprovedAt,
        firstApproved,
      });
    }

    // Update the WTW Master data
    const dataUpdated = await wtwMasterService.updateMany(
      {
        wtNumber: wtNumberToBeSearch,
        isDeleted: false,
      },
      { $set: dataToSend }
    );

    if (dataUpdated) {
      return res.status(httpStatus.OK).send({
        message: "Updated successfully.",
        data: dataUpdated,
        status: true,
        code: "OK",
        issue: null,
      });
    } else {
      throw new ApiError(httpStatus.NOT_IMPLEMENTED, "Something went wrong.");
    }
  } catch (err) {
    const errData = errorRes(err);
    logger.info(errData.resData);
    const { message, status, data, code, issue } = errData.resData;
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue });
  }
};

// update wtw status
exports.updatewtwStatus = async (req, res) => {
  try {
    let wtwnumber = req.params.wtwnumber;
    let status = req.params.status;
    let dataUpdated = await wtwMasterService.updateMany(
      {
        wtwNumber: wtwnumber,
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

exports.getWtInvoice = async (req, res) => {
  try {
    //if no default query then pass {}
    let wtToBeSearch = req.params.wtnumber;

    let additionalQuery = [
      {
        $match: {
          wtNumber: wtToBeSearch,
        },
      },
      {
        $lookup: {
          from: "companies",
          localField: "companyId",
          foreignField: "_id",
          as: "companyDetail",
        },
      },

      {
        $lookup: {
          from: "warehouses",
          localField: "fromWarehouseId",
          foreignField: "_id",
          as: "fromWarehouseData",
          pipeline: [
            {
              $project: {
                wareHouseName: 1,
                billingAddress: 1,
                email: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "warehouses",
          localField: "toWarehouseId",
          foreignField: "_id",
          as: "toWarehouseData",
          pipeline: [
            {
              $project: {
                wareHouseName: 1,
                billingAddress: 1,
                email: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "countries",
          localField: "fromWarehouseData.billingAddress.countryId",
          foreignField: "_id",
          as: "from_country_name",
        },
      },
      {
        $lookup: {
          from: "states",
          localField: "fromWarehouseData.billingAddress.stateId",
          foreignField: "_id",
          as: "from_state_name",
        },
      },
      {
        $lookup: {
          from: "districts",
          localField: "fromWarehouseData.billingAddress.districtId",
          foreignField: "_id",
          as: "from_district_name",
        },
      },
      {
        $lookup: {
          from: "pincodes",
          localField: "fromWarehouseData.billingAddress.pincodeId",
          foreignField: "_id",
          as: "from_pincode_name",
        },
      },

      {
        $lookup: {
          from: "countries",
          localField: "toWarehouseData.billingAddress.countryId",
          foreignField: "_id",
          as: "to_country_name",
        },
      },
      {
        $lookup: {
          from: "states",
          localField: "toWarehouseData.billingAddress.stateId",
          foreignField: "_id",
          as: "to_state_name",
        },
      },
      {
        $lookup: {
          from: "districts",
          localField: "toWarehouseData.billingAddress.districtId",
          foreignField: "_id",
          as: "to_district_name",
        },
      },
      {
        $lookup: {
          from: "pincodes",
          localField: "toWarehouseData.billingAddress.pincodeId",
          foreignField: "_id",
          as: "to_pincode_name",
        },
      },
      {
        $unwind: "$productSalesOrder",
      },
      {
        $lookup: {
          from: "productgroups",
          localField: "productSalesOrder.productGroupId",
          foreignField: "_id",
          as: "productGroup",
        },
      },
      {
        $lookup: {
          from: "productsubcategories",
          localField: "productGroup.productSubCategoryId",
          foreignField: "_id",
          as: "productSubCategoryInfo",
        },
      },
      {
        $unwind: {
          path: "$productSubCategoryInfo",
          preserveNullAndEmptyArrays: true, // Keep orders even if no productInfo
        },
      },
      {
        $unwind: {
          path: "$productGroup",
          preserveNullAndEmptyArrays: true, // Keep orders even if no productInfo
        },
      },
      {
        $addFields: {
          "productSalesOrder.dealerSalePrice": "$productGroup.dealerSalePrice",
          "productSalesOrder.gst": "$productGroup.gst",
          "productSalesOrder.cgst": "$productGroup.cgst",
          "productSalesOrder.sgst": "$productGroup.sgst",
          "productSalesOrder.igst": "$productGroup.igst",
          "productSalesOrder.utgst": "$productGroup.utgst",
          "productSalesOrder.productGroupLabel": "$productGroup.groupName",
          "productSalesOrder.productGroupCode":
            "$productGroup.productGroupCode",
          "productSalesOrder.productSubCategory":
            "$productSubCategoryInfo.subCategoryName",
          "productSalesOrder.hsnCode": "$productSubCategoryInfo.hsnCode",
          "fromWarehouseData.billingAddress.countryName": {
            $arrayElemAt: ["$from_country_name.countryName", 0],
          },
          "fromWarehouseData.billingAddress.stateName": {
            $arrayElemAt: ["$from_state_name.stateName", 0],
          },
          "fromWarehouseData.billingAddress.isUnion": {
            $arrayElemAt: ["$from_state_name.isUnion", 0],
          },
          "fromWarehouseData.billingAddress.districtName": {
            $arrayElemAt: ["$from_district_name.districtName", 0],
          },
          "fromWarehouseData.billingAddress.pincodeName": {
            $arrayElemAt: ["$from_pincode_name.pincode", 0],
          },
          "fromWarehouseData.billingAddress.panNumber": {
            $arrayElemAt: ["$from_name.document.panNumber", 0],
          },

          "toWarehouseData.billingAddress.countryName": {
            $arrayElemAt: ["$to_country_name.countryName", 0],
          },
          "toWarehouseData.billingAddress.stateName": {
            $arrayElemAt: ["$to_state_name.stateName", 0],
          },
          "toWarehouseData.billingAddress.isUnion": {
            $arrayElemAt: ["$to_state_name.isUnion", 0],
          },
          "toWarehouseData.billingAddress.districtName": {
            $arrayElemAt: ["$to_district_name.districtName", 0],
          },
          "toWarehouseData.billingAddress.pincodeName": {
            $arrayElemAt: ["$to_pincode_name.pincode", 0],
          },
          "toWarehouseData.billingAddress.panNumber": {
            $arrayElemAt: ["$to_name.document.panNumber", 0],
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          productSalesOrder: { $push: "$productSalesOrder" },
          toWarehouseData: { $first: "$toWarehouseData" },
          fromWarehouseData: { $first: "$fromWarehouseData" },

          companyDetails: { $first: "$companyDetail" },
          invoiceDate: { $first: "$invoiceDate" },
          invoiceNumber: { $first: "$invoiceNumber" },
        },
      },
      {
        $addFields: {
          companyDetails: {
            $arrayElemAt: ["$companyDetails", 0],
          },
          toWarehouseData: {
            $arrayElemAt: ["$toWarehouseData", 0],
          },
          fromWarehouseData: {
            $arrayElemAt: ["$fromWarehouseData", 0],
          },
        },
      },
      {
        $unset: [
          "from_country_name",
          "from_state_name",
          "from_district_name",
          "from_pincode_name",
          "to_country_name",
          "to_state_name",
          "to_district_name",
          "to_pincode_name",
        ],
      },
    ];

    // let userRoleData = await getUserRoleData(req);
    // let fieldsToDisplay = getFieldsToDisplay(
    //   moduleType.saleOrder,
    //   userRoleData,
    //   actionType.view
    // );
    let dataExist = await wtwMasterService.aggregateQuery(additionalQuery);
    let newData = {};
    let newProductSalesOrder = [];
    dataExist?.map((ele) => {
      const { productSalesOrder, ...rest } = ele;
      newData = { ...rest };
      newProductSalesOrder.push(...productSalesOrder);
    });
    newData.productSalesOrder = newProductSalesOrder;
    // let allowedFields = getAllowedField(fieldsToDisplay, newData);

    if (!newData) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successfull.",
        status: true,
        data: newData,
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
