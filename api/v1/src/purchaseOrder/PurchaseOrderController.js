const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const purchaseOrderService = require("./PurchaseOrderService");
const vendorService = require("../vendor/VendorService");
const wareHouseService = require("../wareHouse/WareHouseService");
const companyService = require("../company/CompanyService");
const {
  checkIdInCollectionsThenDelete,
  collectionArrToMatch,
} = require("../../helper/commonHelper");

const { searchKeys } = require("./PurchaseOrderSchema");
const { errorRes } = require("../../../utils/resError");
const {
  getQuery,
  getUserRoleData,
  getFieldsToDisplay,
} = require("../../helper/utils");

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
const { moduleType, actionType } = require("../../helper/enumUtils");

//add start
exports.add = async (req, res) => {
  try {
    let { poCode, vendorId, wareHouseId, purchaseOrder, companyId } = req.body;

    const isVendorExists = await vendorService.findCount({
      _id: vendorId,
      isDeleted: false,
    });
    if (!isVendorExists) {
      throw new ApiError(httpStatus.OK, "Invalid Vendor");
    }

    const isWareHouseExists = await wareHouseService.findCount({
      _id: wareHouseId,
      isDeleted: false,
    });
    if (!isWareHouseExists) {
      throw new ApiError(httpStatus.OK, "Invalid WareHouse");
    }

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
    let dataExist = await purchaseOrderService.isExists([{ poCode }]);
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }
    const output = req.body.purchaseOrder.map((order) => {
      return {
        poCode: req.body.poCode,
        vendorId: req.body.vendorId,
        wareHouseId: req.body.wareHouseId,
        purchaseOrder: {
          itemId: order.itemId,
          rate: order.rate,
          quantity: order.quantity,
          estReceivingDate: order.estReceivingDate,
        },
        companyId: req.body.companyId,
      };
    });

    //------------------create data-------------------

    let dataCreated = await purchaseOrderService.createMany(output);

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
    let { poCode, vendorId, wareHouseId, purchaseOrder, companyId } = req.body;
    let idToBeSearch = req.params.id;
    // let idToBeSearch = req.params.id;
    // let dataExist = await purchaseOrderService.isExists(
    //   [{ poCode }],
    //   idToBeSearch
    // );
    // if (dataExist.exists && dataExist.existsSummary) {
    //   throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    // }

    //------------------Find data-------------------
    // let datafound = await purchaseOrderService.getOneByMultiField({
    //   _id: idToBeSearch,
    // });
    // if (!datafound) {
    //   throw new ApiError(httpStatus.OK, `PurchaseOrder not found.`);
    // }

    const isVendorExists = await vendorService.findCount({
      _id: vendorId,
      isDeleted: false,
    });
    if (!isVendorExists) {
      throw new ApiError(httpStatus.OK, "Invalid Vendor");
    }

    const isWareHouseExists = await wareHouseService.findCount({
      _id: wareHouseId,
      isDeleted: false,
    });
    if (!isWareHouseExists) {
      throw new ApiError(httpStatus.OK, "Invalid WareHouse");
    }

    const isCompanyExists = await companyService.findCount({
      _id: companyId,
      isDeleted: false,
    });
    if (!isCompanyExists) {
      throw new ApiError(httpStatus.OK, "Invalid Company");
    }

    const dataUpdated = await purchaseOrderService.getOneAndUpdate(
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

//update start
exports.updateLevel = async (req, res) => {
  try {
    let { approval } = req.body;

    let idToBeSearch = req.params.id;
    // let dataExist = await purchaseOrderService.isExists(
    //   [{ poCode }],
    //   idToBeSearch
    // );
    // if (dataExist.exists && dataExist.existsSummary) {
    //   throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    // }

    //------------------Find data-------------------
    let datafound = await purchaseOrderService.getOneByMultiField({
      _id: idToBeSearch,
    });
    if (!datafound) {
      throw new ApiError(httpStatus.OK, `PurchaseOrder not found.`);
    }
    if (datafound.approval.length >= 2) {
      throw new ApiError(httpStatus.OK, `Can't add another`);
    }
    const dataToPush = {
      approvalLevel: approval.approvalLevel,
      approvalByName: approval.approvalByName,
      approvalById: approval.approvalById,
      time: approval.time,
    };

    const dataUpdated = await purchaseOrderService.getOneAndUpdate(
      {
        _id: idToBeSearch,
        isDeleted: false,
      },
      {
        $push: {
          approval: dataToPush,
        },
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
    let objectIdFields = ["vendorId", "wareHouseId", "companyId"];

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
     * for lookups, project, addfields, or group in aggregate pipeline form dynamic query in additionalQuery array
     */
    let additionalQuery = [
      {
        $lookup: {
          from: "vendors",
          localField: "vendorId",
          foreignField: "_id",
          as: "vendors_name",
          pipeline: [{ $project: { companyName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "warehouses",
          localField: "wareHouseId",
          foreignField: "_id",
          as: "warehouses_name",
          pipeline: [{ $project: { wareHouseName: 1 } }],
        },
      },
      {
        $addFields: {
          purchaseOrder: {
            itemName: "",
            itemId: "$purchaseOrder.itemId",
            rate: "$purchaseOrder.rate",
            quantity: "$purchaseOrder.quantity",
            estReceivingDate: "$purchaseOrder.estReceivingDate",
          },
        },
      },
      {
        $lookup: {
          from: "items",
          localField: "purchaseOrder.itemId",
          foreignField: "_id",
          as: "purchaseOrders",
          pipeline: [{ $project: { itemName: 1 } }],
        },
      },
      {
        $addFields: {
          vendorLabel: {
            $arrayElemAt: ["$vendors_name.companyName", 0],
          },
          warehouseLabel: {
            $arrayElemAt: ["$warehouses_name.wareHouseName", 0],
          },
          "purchaseOrder.itemName": {
            $arrayElemAt: ["$purchaseOrders.itemName", 0],
          },
        },
      },
      {
        $unset: ["vendors_name", "warehouses_name", "purchaseOrders"],
      },
    ];

    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    finalAggregateQuery.push({
      $match: matchQuery,
    });

    //-----------------------------------
    let dataFound = await purchaseOrderService.aggregateQuery(
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

    // Populate receivedQuantity from the goodreceivednotes collection
    finalAggregateQuery.push({
      $lookup: {
        from: "goodreceivednotes",
        let: { poCode: "$poCode", itemId: "$purchaseOrder.itemId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$poCode", "$$poCode"] },
                  { $eq: ["$itemId", "$$itemId"] },
                ],
              },
            },
          },
          {
            $group: {
              _id: null,
              totalReceivedQuantity: { $sum: "$receivedQuantity" },
            },
          },
        ],
        as: "grnData",
      },
    });

    finalAggregateQuery.push({
      $addFields: {
        "purchaseOrder.receivedQuantity": {
          $ifNull: [{ $arrayElemAt: ["$grnData.totalReceivedQuantity", 0] }, 0],
        },
      },
    });

    let userRoleData = await getUserRoleData(req, purchaseOrderService);
    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.purchaseOrder,
      userRoleData,
      actionType.pagination
    );

    let result = await purchaseOrderService.aggregateQuery(finalAggregateQuery);
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
``;

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
          from: "vendors",
          localField: "vendorId",
          foreignField: "_id",
          as: "vendors_name",
          pipeline: [{ $project: { companyName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "warehouses",
          localField: "wareHouseId",
          foreignField: "_id",
          as: "warehouses_name",
          pipeline: [{ $project: { wareHouseName: 1 } }],
        },
      },
      {
        // "tax.taxId": "$tax.taxName",
        $addFields: {
          purchaseOrder: {
            itemName: "",
            itemId: "$purchaseOrder.itemId",
            rate: "$purchaseOrder.rate",
            quantity: "$purchaseOrder.quantity",
            estReceivingDate: "$purchaseOrder.estReceivingDate",
          },
        },
      },
      {
        $lookup: {
          from: "items",
          localField: "purchaseOrder.itemId",
          foreignField: "_id",
          as: "purchaseOrders",
          pipeline: [{ $project: { itemName: 1 } }],
        },
      },
      {
        $addFields: {
          vendorLabel: {
            $arrayElemAt: ["$vendors_name.companyName", 0],
          },
          warehouseLabel: {
            $arrayElemAt: ["$warehouses_name.wareHouseName", 0],
          },
          "purchaseOrder.itemName": {
            $arrayElemAt: ["$purchaseOrders.itemName", 0],
          },
        },
      },
      {
        $unset: ["vendors_name", "warehouses_name", "purchaseOrders"],
      },
    ];

    let userRoleData = await getUserRoleData(req, purchaseOrderService);
    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.purchaseOrder,
      userRoleData,
      actionType.listAll
    );
    let dataExist = await purchaseOrderService.aggregateQuery(additionalQuery);
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
    //if no default query then pass {}
    let poCodeToBeSearch = req.params.pocode;
    let matchQuery = { isDeleted: false, poCode: poCodeToBeSearch };
    if (req.query && Object.keys(req.query).length) {
      matchQuery = getQuery(matchQuery, req.query);
    }
    let additionalQuery = [
      { $match: matchQuery },
      {
        $lookup: {
          from: "vendors",
          localField: "vendorId",
          foreignField: "_id",
          as: "vendors_name",
          pipeline: [{ $project: { companyName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "warehouses",
          localField: "wareHouseId",
          foreignField: "_id",
          as: "warehouses_name",
          pipeline: [{ $project: { wareHouseName: 1 } }],
        },
      },
      {
        // "tax.taxId": "$tax.taxName",
        $addFields: {
          purchaseOrder: {
            itemName: "",
            itemId: "$purchaseOrder.itemId",
            rate: "$purchaseOrder.rate",
            quantity: "$purchaseOrder.quantity",
            estReceivingDate: "$purchaseOrder.estReceivingDate",
          },
        },
      },
      {
        $lookup: {
          from: "items",
          localField: "purchaseOrder.itemId",
          foreignField: "_id",
          as: "purchaseOrders",
          pipeline: [{ $project: { itemName: 1 } }],
        },
      },
      {
        $addFields: {
          vendorLabel: {
            $arrayElemAt: ["$vendors_name.companyName", 0],
          },
          warehouseLabel: {
            $arrayElemAt: ["$warehouses_name.wareHouseName", 0],
          },
          "purchaseOrder.itemName": {
            $arrayElemAt: ["$purchaseOrders.itemName", 0],
          },
        },
      },
      {
        $unset: ["vendors_name", "warehouses_name", "purchaseOrders"],
      },
    ];
    let dataExist = await purchaseOrderService.aggregateQuery(additionalQuery);

    if (!dataExist || !dataExist.length) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successfull.",
        status: true,
        data: dataExist,
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
exports.getByVendorId = async (req, res) => {
  try {
    //if no default query then pass {}
    let vendorToBeSearch = req.params.id;

    let additionalQuery = [
      {
        $match: {
          vendorId: new mongoose.Types.ObjectId(vendorToBeSearch),
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: "vendors",
          localField: "vendorId",
          foreignField: "_id",
          as: "vendors_name",
          pipeline: [{ $project: { companyName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "warehouses",
          localField: "wareHouseId",
          foreignField: "_id",
          as: "warehouses_name",
          pipeline: [{ $project: { wareHouseName: 1 } }],
        },
      },
      {
        // "tax.taxId": "$tax.taxName",
        $addFields: {
          purchaseOrder: {
            itemName: "",
            itemId: "$purchaseOrder.itemId",
            rate: "$purchaseOrder.rate",
            quantity: "$purchaseOrder.quantity",
            estReceivingDate: "$purchaseOrder.estReceivingDate",
          },
        },
      },
      {
        $lookup: {
          from: "items",
          localField: "purchaseOrder.itemId",
          foreignField: "_id",
          as: "purchaseOrders",
          pipeline: [{ $project: { itemName: 1 } }],
        },
      },
      {
        $addFields: {
          vendorLabel: {
            $arrayElemAt: ["$vendors_name.companyName", 0],
          },
          warehouseLabel: {
            $arrayElemAt: ["$warehouses_name.wareHouseName", 0],
          },
          "purchaseOrder.itemName": {
            $arrayElemAt: ["$purchaseOrders.itemName", 0],
          },
        },
      },
      {
        $unset: ["vendors_name", "warehouses_name", "purchaseOrders"],
      },
    ];
    let dataExist = await purchaseOrderService.aggregateQuery(additionalQuery);

    if (!dataExist || !dataExist.length) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successfull.",
        status: true,
        data: dataExist,
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

//single view api
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
          from: "vendors",
          localField: "vendorId",
          foreignField: "_id",
          as: "vendors_name",
          pipeline: [{ $project: { companyName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "warehouses",
          localField: "wareHouseId",
          foreignField: "_id",
          as: "warehouses_name",
          pipeline: [{ $project: { wareHouseName: 1 } }],
        },
      },
      {
        // "tax.taxId": "$tax.taxName",
        $addFields: {
          purchaseOrder: {
            itemName: "",
            itemId: "$purchaseOrder.itemId",
            rate: "$purchaseOrder.rate",
            quantity: "$purchaseOrder.quantity",
            estReceivingDate: "$purchaseOrder.estReceivingDate",
          },
        },
      },
      {
        $lookup: {
          from: "items",
          localField: "purchaseOrder.itemId",
          foreignField: "_id",
          as: "purchaseOrders",
          pipeline: [{ $project: { itemName: 1 } }],
        },
      },
      {
        $addFields: {
          vendorLabel: {
            $arrayElemAt: ["$vendors_name.companyName", 0],
          },
          warehouseLabel: {
            $arrayElemAt: ["$warehouses_name.wareHouseName", 0],
          },
          "purchaseOrder.itemName": {
            $arrayElemAt: ["$purchaseOrders.itemName", 0],
          },
        },
      },
      {
        $unset: ["vendors_name", "warehouses_name", "purchaseOrders"],
      },
    ];
    let userRoleData = await getUserRoleData(req, purchaseOrderService);
    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.purchaseOrder,
      userRoleData,
      actionType.view
    );
    let dataExist = await purchaseOrderService.aggregateQuery(additionalQuery);
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
    if (!(await purchaseOrderService.getOneByMultiField({ _id }))) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    const deleteRefCheck = await checkIdInCollectionsThenDelete(
      collectionArrToMatch,
      "purchaseOrderId",
      _id
    );

    if (deleteRefCheck.status === true) {
      let deleted = await purchaseOrderService.getOneAndDelete({ _id });
      if (!deleted) {
        throw new ApiError(httpStatus.OK, "Some thing went wrong.");
      }
    }
    return res.status(httpStatus.OK).send({
      message: deleteRefCheck.message,
      status: deleteRefCheck.status,
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
    let dataExist = await purchaseOrderService.getOneByMultiField({ _id });
    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let isActive = dataExist.isActive ? false : true;

    let statusChanged = await purchaseOrderService.getOneAndUpdate(
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
