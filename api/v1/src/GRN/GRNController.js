const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const goodReceivedNoteService = require("./GRNService");
const companyService = require("../company/CompanyService");

const { searchKeys } = require("./GRNSchema");
const { errorRes } = require("../../../utils/resError");
const {
  getQuery,
  getUserRoleData,
  getFieldsToDisplay,
  getAllowedField,
} = require("../../helper/utils");
const purchaseOrderService = require("../purchaseOrder/PurchaseOrderService");

const {
  getSearchQuery,
  checkInvalidParams,
  getRangeQuery,
  getFilterQuery,
  getDateFilterQuery,
  getLimitAndTotalCount,
  getOrderByAndItsValue,
} = require("../../helper/paginationFilterHelper");
const mongoose = require("mongoose");
const { moduleType, actionType } = require("../../helper/enumUtils");

//add start
exports.add = async (req, res) => {
  try {
    let { poCode, itemId, receivedQuantity, goodQuantity, defectiveQuantity } =
      req.body;

    let updatedPurchaseOrder = await purchaseOrderService.getOneAndUpdate(
      {
        poCode: poCode,
        "purchaseOrder.itemId": new mongoose.Types.ObjectId(itemId),
      },
      { $set: { isEditable: false } }
    );
    let totalQuantity = updatedPurchaseOrder?.purchaseOrder?.quantity;
    let dataExist = await goodReceivedNoteService?.aggregateQuery([
      { $match: { poCode: poCode } },
    ]);
    let receivedQuantityIs = 0;
    dataExist?.map((ele) => {
      receivedQuantityIs += ele?.goodQuantity;
    });

    if (receivedQuantity + receivedQuantityIs > totalQuantity) {
      throw new ApiError(
        httpStatus.NOT_ACCEPTABLE,
        `Receive quantity can't be more than requested quantity`
      );
    }
    //------------------create data-------------------
    let dataCreated = await goodReceivedNoteService.createNewData({
      ...req.body,
      companyId: req.userData.companyId,
    });

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
    let { poCode, itemId, receivedQuantity, goodQuantity, defectiveQuantity } =
      req.body;

    let idToBeSearch = req.params.id;
    //------------------Find data-------------------
    let datafound = await goodReceivedNoteService.getOneByMultiField({
      _id: idToBeSearch,
    });
    if (!datafound) {
      throw new ApiError(httpStatus.OK, `GoodReceivedNote not found.`);
    }
    let foundPO = await purchaseOrderService.getOneByMultiField({
      poCode: poCode,
      "purchaseOrder.itemId": new mongoose.Types.ObjectId(itemId),
    });
    let totalQuantity = foundPO?.purchaseOrder?.quantity;
    let dataExist = await goodReceivedNoteService?.aggregateQuery([
      { $match: { poCode: poCode } },
    ]);

    let receivedQuantityIs = 0;
    dataExist?.map((ele) => {
      receivedQuantityIs += ele?.goodQuantity;
    });

    if (
      receivedQuantity + (receivedQuantityIs - datafound?.receivedQuantity) >
      totalQuantity
    ) {
      throw new ApiError(
        httpStatus.NOT_ACCEPTABLE,
        `Receive quantity can't be more than requested quantity`
      );
    }

    let dataUpdated = await goodReceivedNoteService.getOneAndUpdate(
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
    let objectIdFileds = ["itemId", "companyId"];

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
          from: "items",
          localField: "itemId",
          foreignField: "_id",
          as: "item_name",
          pipeline: [{ $project: { itemName: 1 } }],
        },
      },

      {
        $addFields: {
          itemName: {
            $arrayElemAt: ["$item_name.itemName", 0],
          },
        },
      },
      {
        $unset: ["item_name"],
      },
    ];

    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    finalAggregateQuery.push({
      $match: matchQuery,
    });

    //-----------------------------------
    let dataFound = await goodReceivedNoteService.aggregateQuery(
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
    let userRoleData = await getUserRoleData(req);
    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.grn,
      userRoleData,
      actionType.pagination
    );
    let result = await goodReceivedNoteService.aggregateQuery(
      finalAggregateQuery
    );
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
    let companyId = req.params.companyid;

    //if no default query then pass {}
    let matchQuery = {
      companyId: new mongoose.Types.ObjectId(companyId),
      isDeleted: false,
    };
    if (req.query && Object.keys(req.query).length) {
      matchQuery = getQuery(matchQuery, req.query);
    }
    let additionalQuery = [
      { $match: matchQuery },
      {
        $lookup: {
          from: "items",
          localField: "itemId",
          foreignField: "_id",
          as: "item_name",
          pipeline: [{ $project: { itemName: 1 } }],
        },
      },

      {
        $addFields: {
          itemName: {
            $arrayElemAt: ["$item_name.itemName", 0],
          },
        },
      },
      {
        $unset: ["item_name"],
      },
    ];
    let userRoleData = await getUserRoleData(req);

    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.grn,
      userRoleData,
      actionType.listAll
    );

    let dataExist = await goodReceivedNoteService.aggregateQuery(
      additionalQuery
    );
    let allowedFields = getAllowedField(fieldsToDisplay, dataExist);

    if (!allowedFields || !allowedFields?.length) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successfull.",
        status: true,
        data: allowedFields,
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

//get api
exports.getByPoCode = async (req, res) => {
  try {
    let pocode = req.query.pocode;
    let itemId = req.query.itemid;

    let matchQuery = {
      poCode: pocode,
      itemId: new mongoose.Types.ObjectId(itemId),
      isDeleted: false,
    };

    let additionalQuery = [
      { $match: matchQuery },
      {
        $lookup: {
          from: "items",
          localField: "itemId",
          foreignField: "_id",
          as: "item_name",
          pipeline: [{ $project: { itemName: 1 } }],
        },
      },

      {
        $addFields: {
          itemName: {
            $arrayElemAt: ["$item_name.itemName", 0],
          },
        },
      },
      {
        $unset: ["item_name"],
      },
    ];
    let dataExist = await goodReceivedNoteService.aggregateQuery(
      additionalQuery
    );
    let recievedQuantity = 0;
    const recQuntArr = dataExist?.map((ele) => {
      return ele?.receivedQuantity;
    });
    for (let i = 0; i < recQuntArr.length; i++) {
      recievedQuantity += recQuntArr[i];
    }

    if (!dataExist || !dataExist.length) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successfull.",
        status: true,
        data: dataExist,
        totalRecievedQuantity: recievedQuantity,
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
      {
        $lookup: {
          from: "items",
          localField: "itemId",
          foreignField: "_id",
          as: "item_name",
          pipeline: [{ $project: { itemName: 1 } }],
        },
      },

      {
        $addFields: {
          itemName: {
            $arrayElemAt: ["$item_name.itemName", 0],
          },
        },
      },
      {
        $unset: ["item_name"],
      },
    ];
    let userRoleData = await getUserRoleData(req);

    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.grn,
      userRoleData,
      actionType.view
    );
    let dataExist = await goodReceivedNoteService.aggregateQuery(
      additionalQuery
    );
    let allowedFields = getAllowedField(fieldsToDisplay, dataExist);

    if (!allowedFields?.length) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successfull.",
        status: true,
        data: allowedFields[0],
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
//delete api
exports.deleteDocument = async (req, res) => {
  try {
    let _id = req.params.id;
    if (!(await goodReceivedNoteService.getOneByMultiField({ _id }))) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let deleted = await goodReceivedNoteService.getOneAndDelete({ _id });
    if (!deleted) {
      throw new ApiError(httpStatus.OK, "Some thing went wrong.");
    }
    return res.status(httpStatus.OK).send({
      message: "Successfull.",
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
    let dataExist = await goodReceivedNoteService.getOneByMultiField({ _id });
    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let isActive = dataExist.isActive ? false : true;

    let statusChanged = await goodReceivedNoteService.getOneAndUpdate(
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
