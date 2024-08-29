const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const barCodeService = require("./BarCodeService");
const companyService = require("../company/CompanyService");
const barcodeFlowService = require("../barCodeFlow/BarCodeFlowService");
const salesOrderService = require("../salesOrder/SalesOrderService");
const WarehouseService = require("../wareHouse/WareHouseService");
const wtwMasterService = require("../warehouseToWarehouse/wtwMasterService");
const dtdMasterService = require("../dtdTransfer/DTDTransferService");
const dealerService = require("../dealer/DealerService");
const reprintOuterBoxSevice = require("../reprintOuterBox/ReprintOuterBoxService");

const wtcMasterService = require("../warehouseToCompany/wtcMasterService");
const wtsMasterService = require("../warehouseToSample/wtsMasterService");
const dtwMasterService = require("../dealerToWarehouse/dtwMasterService");
const vendorService = require("../vendor/VendorService");

const orderInquiryService = require("../orderInquiry/OrderInquiryService");
const customerWhReturnService = require("../customerWHReturn/CustomerWHReturnService");
const orderInquiryFlowService = require("../orderInquiryFlow/OrderInquiryFlowService");
const ProductGroupService = require("../productGroup/ProductGroupService");
const rtvMasterService = require("../rtvMaster/RtvMasterService");
const { searchKeys } = require("./BarCodeSchema");
const { errorRes } = require("../../../utils/resError");
const {
  getQuery,
  getUserRoleData,
  getFieldsToDisplay,
  getAllowedField,
} = require("../../helper/utils");
const {
  getInquiryNumber,
} = require("../reprintOuterBox/ReprintOuterBoxHelper");

const { getDealerData } = require("../../middleware/authenticationCheck");
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
const {
  moduleType,
  actionType,
  barcodeStatusType,
  productStatus,
  orderStatusEnum,
  preferredCourierPartner,
} = require("../../helper/enumUtils");
const { addToBarcodeFlow } = require("../barCodeFlow/BarCodeFlowHelper");
const {
  addToOrderFlow,
} = require("../orderInquiryFlow/OrderInquiryFlowHelper");
const XLSX = require("xlsx");
//add start
exports.add = async (req, res) => {
  try {
    let {
      productGroupId,
      barcodeGroupNumber,
      quantity,
      lotNumber,
      expiryDate,
      invoiceNumber,
      status,
    } = req.body;

    /**
     * check duplicate exist
     */
    // let dataExist = await barCodeService.isExists([
    //   { lotNumber },
    //   { barcodeGroupNumber },
    // ]);
    // if (dataExist.exists && dataExist.existsSummary) {
    //   throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    // }
    let lastObject = await barCodeService.aggregateQuery([
      {
        $match: {
          lotNumber: lotNumber,
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 1 },
    ]);

    if (
      lastObject[0]?.lotNumber === lotNumber &&
      lastObject[0]?.productGroupId.toString() !== productGroupId.toString()
    ) {
      throw new ApiError(
        httpStatus.OK,
        `Can not assign this product to lot number ${lotNumber}`
      );
    }

    let currentBarcode = "";
    console.log(lastObject, "lastObject");
    if (lastObject.length) {
      currentBarcode = parseInt(lastObject[0]?.barcodeNumber) + 1;
    } else {
      currentBarcode = lotNumber + "000001";
    }

    let output = [];
    let barcodeFlowData = [];

    for (let i = 0; i < quantity; i++) {
      if (i > 0) {
        console.log(currentBarcode, "currentBarcode");
        paddeeBarcode = JSON.stringify(parseInt(currentBarcode) + 1);
        console.log(paddeeBarcode, "paddeeBarcode");
        currentBarcode = paddeeBarcode.toString().padStart(6, "0");
      }
      output.push({
        productGroupId,
        barcodeGroupNumber,
        barcodeNumber: currentBarcode,
        lotNumber,
        wareHouseId: null,
        companyId: req.userData.companyId,
        invoiceNumber,
        expiryDate,
        status: "",
      });
      barcodeFlowData.push({
        productGroupId,
        barcodeGroupNumber,
        barcodeNumber: lotNumber + currentBarcode,
        lotNumber,
        wareHouseId: null,
        companyId: req.userData.companyId,
        invoiceNumber,
        expiryDate,
        status: "",
        barcodeLog: "Barcode created in warehouse",
      });
    }

    //------------------create data-------------------
    let dataCreated = await barCodeService.createMany(output);
    await barcodeFlowService.createMany(barcodeFlowData);
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
    let { productGroupId, wareHouseId, companyId } = req.body;

    let idToBeSearch = req.params.id;
    // let dataExist = await barCodeService.isExists(
    //   [{ barcodeNumber }],
    //   idToBeSearch
    // );
    // if (dataExist.exists && dataExist.existsSummary) {
    //   throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    // }
    const isCompanyExists = await companyService.findCount({
      _id: companyId,
      isDeleted: false,
    });
    if (!isCompanyExists) {
      throw new ApiError(httpStatus.OK, "Invalid Company");
    }

    const isWarehouseExists = await WarehouseService.findCount({
      _id: wareHouseId,
      isDeleted: false,
    });
    if (!isWarehouseExists) {
      throw new ApiError(httpStatus.OK, "Invalid Warehouse");
    }
    /**
     * check duplicate exist
     */
    // let isdataExist = await barCodeService.isExists(
    //   [{ lotNumber }],
    //   idToBeSearch
    // );
    // if (isdataExist.exists && isdataExist.existsSummary) {
    //   throw new ApiError(httpStatus.OK, isdataExist.existsSummary);
    // }

    //------------------Find data-------------------
    let datafound = await barCodeService.getOneByMultiField({
      _id: idToBeSearch,
    });
    if (!datafound) {
      throw new ApiError(httpStatus.OK, `BarCode not found.`);
    }

    let dataUpdated = await barCodeService.getOneAndUpdate(
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

    await addToBarcodeFlow(dataUpdated, "Barcode updated");

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
    let booleanFields = ["isDeleted"];
    let numberFileds = [];
    let objectIdFields = ["productGroupId", "companyId"];

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
          from: "productgroups",
          localField: "productGroupId",
          foreignField: "_id",
          as: "product_group",
          pipeline: [
            { $match: { isDeleted: false } },
            { $project: { groupName: 1 } },
          ],
        },
      },
      {
        $lookup: {
          from: "warehouses",
          localField: "wareHouseId",
          foreignField: "_id",
          as: "warehouse_data",
          pipeline: [
            { $match: { isDeleted: false } },
            {
              $project: {
                wareHouseName: 1,
              },
            },
          ],
        },
      },

      {
        $addFields: {
          productGroupLabel: {
            $arrayElemAt: ["$product_group.groupName", 0],
          },
          wareHouseLabel: {
            $arrayElemAt: ["$warehouse_data.wareHouseName", 0],
          },
        },
      },
      { $unset: ["product_group", "warehouse_data"] },
    ];

    finalAggregateQuery.push({
      $match: matchQuery,
    });
    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    //-----------------------------------
    let dataFound = await barCodeService.aggregateQuery(finalAggregateQuery);
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
      moduleType.barcode,
      userRoleData,
      actionType.pagination
    );
    let result = await barCodeService.aggregateQuery(finalAggregateQuery);
    let allowedFields = getAllowedField(fieldsToDisplay, result);

    if (allowedFields?.length) {
      return res.status(httpStatus.OK).send({
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
// all filter pagination api
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
    let booleanFields = [];
    let numberFileds = ["productGroupId"];

    const filterQuery = getFilterQuery(filterBy, booleanFields, numberFileds);
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
          from: "productgroups",
          localField: "productGroupId",
          foreignField: "_id",
          as: "product_group",
          pipeline: [
            { $match: { isDeleted: false } },
            { $project: { groupName: 1 } },
          ],
        },
      },

      {
        $lookup: {
          from: "warehouses",
          localField: "wareHouseId",
          foreignField: "_id",
          as: "warehouse_data",
          pipeline: [
            { $match: { isDeleted: false } },
            {
              $project: {
                wareHouseName: 1,
              },
            },
          ],
        },
      },

      {
        $addFields: {
          productGroupLabel: {
            $arrayElemAt: ["$product_group.groupName", 0],
          },
          wareHouseLabel: {
            $arrayElemAt: ["$warehouse_data.wareHouseName", 0],
          },
        },
      },
      { $unset: ["product_group", "warehouse_data"] },
    ];

    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    finalAggregateQuery.push({
      $match: matchQuery,
    });
    finalAggregateQuery.push({
      $group: {
        _id: "$barcodeGroupNumber",
        // data: { $push: "$$ROOT" },
        barcodeGroupNumber: { $first: "$barcodeGroupNumber" },
        companyId: { $first: "$companyId" },
        createdAt: { $first: "$createdAt" },
        productGroupLabel: { $first: "$productGroupLabel" },
      },
    });
    //-----------------------------------
    let dataFound = await barCodeService.aggregateQuery(finalAggregateQuery);
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

    // return res.send(finalAggregateQuery);
    let result = await barCodeService.aggregateQuery(finalAggregateQuery);
    if (result.length) {
      return res.status(httpStatus.OK).send({
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
    let matchQuery = {
      isDeleted: false,
    };
    if (req.query && Object.keys(req.query).length) {
      matchQuery = getQuery(matchQuery, req.query);
    }
    let additionalQuery = [
      { $match: matchQuery },
      {
        $lookup: {
          from: "productgroups",
          localField: "productGroupId",
          foreignField: "_id",
          as: "product_group",
          pipeline: [
            { $match: { isDeleted: false } },
            { $project: { groupName: 1 } },
          ],
        },
      },

      {
        $lookup: {
          from: "warehouses",
          localField: "wareHouseId",
          foreignField: "_id",
          as: "warehouse_data",
          pipeline: [
            { $match: { isDeleted: false } },
            {
              $project: {
                wareHouseName: 1,
              },
            },
          ],
        },
      },

      {
        $addFields: {
          productGroupLabel: {
            $arrayElemAt: ["$product_group.groupName", 0],
          },
          wareHouseLabel: {
            $arrayElemAt: ["$warehouse_data.wareHouseName", 0],
          },
        },
      },
      { $unset: ["product_group", "warehouse_data"] },
    ];

    let userRoleData = await getUserRoleData(req);
    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.barcode,
      userRoleData,
      actionType.listAll
    );
    let dataExist = await barCodeService.aggregateQuery(additionalQuery);
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

exports.checkBarcode = async (req, res) => {
  try {
    //if no default query then pass {}

    let { barcode, orderId, status, latitude, longitude } = req.body;

    let additionalQuery = [
      {
        $match: {
          isDeleted: false,
          barcodeNumber: barcode,
          dealerId: new mongoose.Types.ObjectId(req.userData.dealerId),
        },
      },
    ];

    let dataExist = await barCodeService.aggregateQuery(additionalQuery);
    if (!dataExist.length) {
      throw new ApiError(httpStatus.OK, "Barcode not found");
    }
    let orderInquiryData = await orderInquiryService.getOneByMultiField({
      isDeleted: false,
      _id: orderId,
    });
    if (!orderInquiryData) {
      throw new ApiError(httpStatus.OK, "Order not found");
    }
    if (
      dataExist[0]?.productGroupId?.toString() !==
      orderInquiryData?.productGroupId?.toString()
    ) {
      throw new ApiError(httpStatus.OK, "Invalid Barcode");
    }

    if (dataExist) {
      let orderInquiry = await orderInquiryService.getOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(orderId),
        },
        {
          $set: {
            status,
            latitude,
            longitude,
          },
          $push: {
            barcodeData: {
              barcodeId: dataExist[0]?._id,
              barcode: dataExist[0]?.barcodeNumber,
            },
          },
        }
      );
      await addToOrderFlow(orderInquiry);

      if (!orderInquiry) {
        throw new ApiError(
          httpStatus.OK,
          "Barcode with this orderId not found"
        );
      } else {
        let dataUpdated = await barCodeService.getOneAndUpdate(
          {
            isDeleted: false,
            barcodeNumber: barcode,
            dealerId: new mongoose.Types.ObjectId(req.userData.dealerId),
          },
          {
            $set: {
              status: barcodeStatusType.delivered,
            },
          }
        );

        await addToBarcodeFlow(
          dataUpdated,
          `Barcode status updated to Delivered`
        );
        return res.status(httpStatus.OK).send({
          message: "Successfull.",
          status: true,
          data: dataExist,
          code: "OK",
          issue: null,
        });
      }
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

// scan barcode and deliver dealer app

exports.checkBarcodeDealerApp = async (req, res) => {
  try {
    //if no default query then pass {}

    let { barcode, orderId, status } = req.body;

    let additionalQuery = [
      {
        $match: {
          isDeleted: false,
          barcodeNumber: barcode,
          dealerId: new mongoose.Types.ObjectId(req.userData.Id),
        },
      },
    ];

    let dataExist = await barCodeService.aggregateQuery(additionalQuery);

    if (!dataExist.length) {
      throw new ApiError(httpStatus.OK, "Barcode not found");
    }
    let orderInquiryData = await orderInquiryService.getOneByMultiField({
      isDeleted: false,
      _id: orderId,
    });
    if (!orderInquiryData) {
      throw new ApiError(httpStatus.OK, "Order not found");
    }
    if (
      dataExist[0]?.productGroupId?.toString() !==
      orderInquiryData?.productGroupId?.toString()
    ) {
      throw new ApiError(httpStatus.OK, "Invalid Barcode");
    }

    if (dataExist) {
      let orderInquiry = await orderInquiryService.getOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(orderId),
        },
        {
          $set: {
            status,
          },
          $push: {
            barcodeData: {
              barcodeId: dataExist[0]?._id,
              barcode: dataExist[0]?.barcodeNumber,
            },
          },
        }
      );
      await addToOrderFlow(orderInquiry);

      if (!orderInquiry) {
        throw new ApiError(
          httpStatus.OK,
          "Barcode with this orderId not found"
        );
      } else {
        let dataUpdated = await barCodeService.getOneAndUpdate(
          {
            isDeleted: false,
            barcodeNumber: barcode,
            dealerId: new mongoose.Types.ObjectId(req.userData.Id),
          },
          {
            $set: {
              status: barcodeStatusType.delivered,
            },
          }
        );
        await addToBarcodeFlow(
          dataUpdated,
          `Barcode Delivered from Dealer ${req.userData.firstName} ${req.userData.lastName}`
        );

        return res.status(httpStatus.OK).send({
          message: "Successfull.",
          status: true,
          data: dataExist,
          code: "OK",
          issue: null,
        });
      }
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
exports.getAllByGroup = async (req, res) => {
  try {
    //if no default query then pass {}
    let groupId = req.params.id;
    let matchQuery = {
      isDeleted: false,
      barcodeGroupNumber: groupId,
    };
    if (req.query && Object.keys(req.query).length) {
      matchQuery = getQuery(matchQuery, req.query);
    }
    let additionalQuery = [
      { $match: matchQuery },

      {
        $lookup: {
          from: "productgroups",
          localField: "productGroupId",
          foreignField: "_id",
          as: "product_group",
          pipeline: [
            { $match: { isDeleted: false } },
            { $project: { groupName: 1 } },
          ],
        },
      },

      {
        $lookup: {
          from: "warehouses",
          localField: "wareHouseId",
          foreignField: "_id",
          as: "warehouse_data",
          pipeline: [
            { $match: { isDeleted: false } },
            {
              $project: {
                wareHouseName: 1,
              },
            },
          ],
        },
      },

      {
        $addFields: {
          productGroupLabel: {
            $arrayElemAt: ["$product_group.groupName", 0],
          },
          wareHouseLabel: {
            $arrayElemAt: ["$warehouse_data.wareHouseName", 0],
          },
        },
      },
      { $unset: ["product_group", "warehouse_data"] },
    ];

    let dataExist = await barCodeService.aggregateQuery(additionalQuery);

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
        _id: new mongoose.Types.ObjectId(idToBeSearch),
        isDeleted: false,
      },
      {
        $lookup: {
          from: "productgroups",
          localField: "productGroupId",
          foreignField: "_id",
          as: "product_group",
          pipeline: [
            { $match: { isDeleted: false } },
            { $project: { groupName: 1 } },
          ],
        },
      },

      {
        $lookup: {
          from: "warehouses",
          localField: "wareHouseId",
          foreignField: "_id",
          as: "warehouse_data",
          pipeline: [
            { $match: { isDeleted: false } },
            {
              $project: {
                wareHouseName: 1,
              },
            },
          ],
        },
      },

      {
        $addFields: {
          productGroupLabel: {
            $arrayElemAt: ["$product_group.groupName", 0],
          },
          wareHouseLabel: {
            $arrayElemAt: ["$warehouse_data.wareHouseName", 0],
          },
        },
      },
      { $unset: ["product_group", "warehouse_data"] },
    ];

    let userRoleData = await getUserRoleData(req);
    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.barcode,
      userRoleData,
      actionType.view
    );
    let dataExist = await barCodeService.aggregateQuery(additionalQuery);
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

//single view api
exports.getByBarcode = async (req, res) => {
  try {
    const barcodeToBeSearch = req.params.barcode;
    const productGroupId = req.params.productgroupid;
    const status = req.params.status;
    const cid = req.userData.companyId;

    const barcodeFlowData = await barcodeFlowService?.aggregateQuery([
      {
        $match: {
          barcodeNumber: barcodeToBeSearch,
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 1 },
    ]);

    let additionalQueryForAll = [
      {
        $match: {
          outerBoxbarCodeNumber: barcodeToBeSearch,
          isUsed: true,
          status: status,
          productGroupId: new mongoose.Types.ObjectId(productGroupId),
          companyId: new mongoose.Types.ObjectId(cid),
          isFreezed: false,
        },
      },
      {
        $lookup: {
          from: "productgroups",
          localField: "productGroupId",
          foreignField: "_id",
          as: "product_group",
          pipeline: [
            { $match: { isDeleted: false } },
            { $project: { groupName: 1 } },
          ],
        },
      },

      {
        $lookup: {
          from: "warehouses",
          localField: "wareHouseId",
          foreignField: "_id",
          as: "warehouse_data",
          pipeline: [
            { $match: { isDeleted: false } },
            {
              $project: {
                wareHouseName: 1,
              },
            },
          ],
        },
      },

      {
        $addFields: {
          productGroupLabel: {
            $arrayElemAt: ["$product_group.groupName", 0],
          },
          wareHouseLabel: {
            $arrayElemAt: ["$warehouse_data.wareHouseName", 0],
          },
        },
      },
      { $unset: ["product_group", "warehouse_data"] },
    ];
    let additionalQueryForOne = [
      {
        $match: {
          barcodeNumber: barcodeToBeSearch,
          isUsed: true,
          status: status,
          productGroupId: new mongoose.Types.ObjectId(productGroupId),
          companyId: new mongoose.Types.ObjectId(cid),
          isFreezed: false,
        },
      },
      {
        $lookup: {
          from: "productgroups",
          localField: "productGroupId",
          foreignField: "_id",
          as: "product_group",
          pipeline: [
            { $match: { isDeleted: false } },
            { $project: { groupName: 1 } },
          ],
        },
      },

      {
        $lookup: {
          from: "warehouses",
          localField: "wareHouseId",
          foreignField: "_id",
          as: "warehouse_data",
          pipeline: [
            { $match: { isDeleted: false } },
            {
              $project: {
                wareHouseName: 1,
              },
            },
          ],
        },
      },

      {
        $addFields: {
          productGroupLabel: {
            $arrayElemAt: ["$product_group.groupName", 0],
          },
          wareHouseLabel: {
            $arrayElemAt: ["$warehouse_data.wareHouseName", 0],
          },
        },
      },
      { $unset: ["product_group", "warehouse_data"] },
    ];
    let ResponseData = [];
    const dataExist = await barCodeService.aggregateQuery(
      additionalQueryForAll
    );

    if (dataExist.length === 0) {
      const foundBarcode = await barCodeService.aggregateQuery(
        additionalQueryForOne
      );
      if (foundBarcode[0] !== null && foundBarcode[0] !== undefined) {
        ResponseData.push(foundBarcode[0]);
      }
    } else {
      ResponseData = dataExist;
    }

    if (ResponseData.length === 0) {
      console.log(barcodeFlowData, "barcodeFlowData");
      throw new ApiError(
        httpStatus.OK,
        `${
          barcodeFlowData.length
            ? barcodeFlowData[0]?.barcodeLog
            : "Invalid barcode"
        }`
      );
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successful.",
        status: true,
        data: ResponseData,
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

// barcode for customer return

exports.getBarcodeForCustomerReturn = async (req, res) => {
  try {
    const barcodeToBeSearch = req.params.barcode;
    const status = req.params.status;
    const cid = req.userData.companyId;

    let additionalQueryForOne = [
      {
        $match: {
          barcodeNumber: barcodeToBeSearch,
          isUsed: true,
          status: status,
          companyId: new mongoose.Types.ObjectId(cid),
        },
      },
      {
        $lookup: {
          from: "productgroups",
          localField: "productGroupId",
          foreignField: "_id",
          as: "product_group",
          pipeline: [
            { $match: { isDeleted: false } },
            { $project: { groupName: 1 } },
          ],
        },
      },

      {
        $lookup: {
          from: "warehouses",
          localField: "wareHouseId",
          foreignField: "_id",
          as: "warehouse_data",
          pipeline: [
            { $match: { isDeleted: false } },
            {
              $project: {
                wareHouseName: 1,
              },
            },
          ],
        },
      },

      {
        $addFields: {
          productGroupLabel: {
            $arrayElemAt: ["$product_group.groupName", 0],
          },
          wareHouseLabel: {
            $arrayElemAt: ["$warehouse_data.wareHouseName", 0],
          },
        },
      },
      { $unset: ["product_group", "warehouse_data"] },
    ];

    console.log(additionalQueryForOne, "additionalQueryForOne");

    const foundBarcode = await barCodeService.aggregateQuery(
      additionalQueryForOne
    );
    console.log(foundBarcode, "foundBarcode");

    if (foundBarcode.length === 0) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successful.",
        status: true,
        data: foundBarcode,
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

// customer return barcode from order no

exports.getBarcodeForCustomerReturnFromOrderNumber = async (req, res) => {
  try {
    const orderno = req.params.orderno;
    const cid = req.userData.companyId;
    console.log(cid, "company");
    const orderData = await orderInquiryService.getOneByMultiField({
      orderNumber: orderno,
    });

    if (!orderData) {
      throw new ApiError(httpStatus.NOT_FOUND, "Order not found.");
    }

    console.log(orderData, "orderData");

    let orderBarcode = orderData?.barcodeData?.map((ele) => ele?.barcode);
    console.log(orderBarcode, "orderBarcode");

    if (!orderBarcode || orderBarcode.length === 0) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "No barcodes found for the order."
      );
    }

    let allBarcodes = [];
    for (const ele of orderBarcode) {
      console.log(`Processing barcode: ${ele}`);

      const additionalQueryForOne = [
        {
          $match: {
            barcodeNumber: ele,
            isUsed: true,
            companyId: new mongoose.Types.ObjectId(cid),
          },
        },
        {
          $lookup: {
            from: "productgroups",
            localField: "productGroupId",
            foreignField: "_id",
            as: "product_group",
            pipeline: [
              { $match: { isDeleted: false } },
              { $project: { groupName: 1 } },
            ],
          },
        },
        {
          $lookup: {
            from: "warehouses",
            localField: "wareHouseId",
            foreignField: "_id",
            as: "warehouse_data",
            pipeline: [
              { $match: { isDeleted: false } },
              { $project: { wareHouseName: 1 } },
            ],
          },
        },
        {
          $addFields: {
            productGroupLabel: {
              $arrayElemAt: ["$product_group.groupName", 0],
            },
            wareHouseLabel: {
              $arrayElemAt: ["$warehouse_data.wareHouseName", 0],
            },
          },
        },
        { $unset: ["product_group", "warehouse_data"] },
      ];

      const foundBarcode = await barCodeService.aggregateQuery(
        additionalQueryForOne
      );
      console.log(foundBarcode, "foundBarcode");

      if (foundBarcode.length > 0) {
        allBarcodes.push(foundBarcode[0]);
      }
    }

    if (allBarcodes.length === 0) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successful.",
        status: true,
        data: allBarcodes,
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
exports.getByOuterBoxBarcode = async (req, res) => {
  try {
    const barcodeToBeSearch = req.params.barcode;

    let additionalQueryForAll = [
      {
        $match: {
          outerBoxbarCodeNumber: barcodeToBeSearch,
          isUsed: true,
          companyId: new mongoose.Types.ObjectId(req.userData.companyId),
        },
      },
      {
        $lookup: {
          from: "productgroups",
          localField: "productGroupId",
          foreignField: "_id",
          as: "product_group",
          pipeline: [
            { $match: { isDeleted: false } },
            { $project: { groupName: 1 } },
          ],
        },
      },

      {
        $lookup: {
          from: "warehouses",
          localField: "wareHouseId",
          foreignField: "_id",
          as: "warehouse_data",
          pipeline: [
            { $match: { isDeleted: false } },
            {
              $project: {
                wareHouseName: 1,
              },
            },
          ],
        },
      },

      {
        $addFields: {
          productGroupLabel: {
            $arrayElemAt: ["$product_group.groupName", 0],
          },
          wareHouseLabel: {
            $arrayElemAt: ["$warehouse_data.wareHouseName", 0],
          },
        },
      },
      { $unset: ["product_group", "warehouse_data"] },
    ];

    const dataExist = await barCodeService.aggregateQuery(
      additionalQueryForAll
    );

    if (dataExist.length === 0) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successful.",
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

// scan barcode at dealer warehouse

exports.getByBarcodeAtDealerWarehouse = async (req, res) => {
  try {
    const barcodeToBeSearch = req.params.barcode;
    const productGroupId = req.params.productgroupid;
    const status = req.params.status;
    const cid = req.userData.companyId;
    let additionalQueryForAll = [
      {
        $match: {
          outerBoxbarCodeNumber: barcodeToBeSearch,
          isUsed: true,
          status: status,
          productGroupId: new mongoose.Types.ObjectId(productGroupId),
          companyId: new mongoose.Types.ObjectId(cid),
        },
      },
      {
        $lookup: {
          from: "productgroups",
          localField: "productGroupId",
          foreignField: "_id",
          as: "product_group",
          pipeline: [
            { $match: { isDeleted: false } },
            { $project: { groupName: 1 } },
          ],
        },
      },

      {
        $lookup: {
          from: "warehouses",
          localField: "wareHouseId",
          foreignField: "_id",
          as: "warehouse_data",
          pipeline: [
            { $match: { isDeleted: false } },
            {
              $project: {
                wareHouseName: 1,
              },
            },
          ],
        },
      },

      {
        $addFields: {
          productGroupLabel: {
            $arrayElemAt: ["$product_group.groupName", 0],
          },
          wareHouseLabel: {
            $arrayElemAt: ["$warehouse_data.wareHouseName", 0],
          },
        },
      },
      { $unset: ["product_group", "warehouse_data"] },
    ];
    let additionalQueryForOne = [
      {
        $match: {
          barcodeNumber: barcodeToBeSearch,
          isUsed: true,
          status: status,
          productGroupId: new mongoose.Types.ObjectId(productGroupId),
          companyId: new mongoose.Types.ObjectId(cid),
        },
      },
      {
        $lookup: {
          from: "productgroups",
          localField: "productGroupId",
          foreignField: "_id",
          as: "product_group",
          pipeline: [
            { $match: { isDeleted: false } },
            { $project: { groupName: 1 } },
          ],
        },
      },

      {
        $lookup: {
          from: "warehouses",
          localField: "wareHouseId",
          foreignField: "_id",
          as: "warehouse_data",
          pipeline: [
            { $match: { isDeleted: false } },
            {
              $project: {
                wareHouseName: 1,
              },
            },
          ],
        },
      },

      {
        $addFields: {
          productGroupLabel: {
            $arrayElemAt: ["$product_group.groupName", 0],
          },
          wareHouseLabel: {
            $arrayElemAt: ["$warehouse_data.wareHouseName", 0],
          },
        },
      },
      { $unset: ["product_group", "warehouse_data"] },
    ];
    let ResponseData = [];
    const dataExist = await barCodeService.aggregateQuery(
      additionalQueryForAll
    );
    if (dataExist.length === 0) {
      const foundBarcode = await barCodeService.aggregateQuery(
        additionalQueryForOne
      );
      if (foundBarcode[0] !== null && foundBarcode[0] !== undefined) {
        ResponseData.push(foundBarcode[0]);
      }
    } else {
      ResponseData = dataExist[0];
    }

    if (ResponseData?.length === 0) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successful.",
        status: true,
        data: ResponseData,
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

exports.getBarcode = async (req, res) => {
  try {
    const barcodeToBeSearch = req.params.barcode;

    let additionalQuery = [
      {
        $match: {
          barcodeNumber: barcodeToBeSearch,
          isUsed: false,
        },
      },
      {
        $lookup: {
          from: "productgroups",
          localField: "productGroupId",
          foreignField: "_id",
          as: "product_group",
          pipeline: [
            { $match: { isDeleted: false } },
            { $project: { groupName: 1 } },
          ],
        },
      },

      {
        $lookup: {
          from: "warehouses",
          localField: "wareHouseId",
          foreignField: "_id",
          as: "warehouse_data",
          pipeline: [
            { $match: { isDeleted: false } },
            {
              $project: {
                wareHouseName: 1,
              },
            },
          ],
        },
      },

      {
        $addFields: {
          productGroupLabel: {
            $arrayElemAt: ["$product_group.groupName", 0],
          },
          wareHouseLabel: {
            $arrayElemAt: ["$warehouse_data.wareHouseName", 0],
          },
        },
      },
      { $unset: ["product_group", "warehouse_data"] },
    ];
    let barcode = [];
    const foundBarcode = await barCodeService.aggregateQuery(additionalQuery);
    if (foundBarcode !== null) {
      barcode.push(foundBarcode[0]);
    }

    if (barcode.length === 0) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successful.",
        status: true,
        data: barcode[0],
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

exports.getDispatchBarcode = async (req, res) => {
  try {
    const barcodeToBeSearch = req.params.barcode;
    const warehouseId = req.params.wid;
    const status = req.params.status;
    console.log(
      barcodeToBeSearch,
      barcodeStatusType.atWarehouse,
      ",,,,,,,,,,,,,,,,,,,,,,,,,"
    );
    let additionalQuery = [
      {
        $match: {
          barcodeNumber: barcodeToBeSearch,
          isUsed: true,
          status: barcodeStatusType.atWarehouse,
        },
      },
    ];
    let barcode = [];
    const foundBarcode = await barCodeService.aggregateQuery(additionalQuery);
    console.log(foundBarcode, "////////////");
    if (foundBarcode !== null) {
      barcode.push(foundBarcode[0]);
    }
    console.log(barcode, "00000000000");

    console.log(barcode[0]?.productGroupId, "--------");

    // query change according to courier
    let query;
    if (status === preferredCourierPartner.maersk) {
      query = {
        "schemeProducts.productGroupId": barcode[0]?.productGroupId,
        orderStatus: productStatus.notDispatched,
        assignDealerId: null,
        assignWarehouseId: warehouseId,
        orderAssignedToCourier: status,
      };
    } else {
      query = {
        "schemeProducts.productGroupId": barcode[0]?.productGroupId,
        orderStatus: productStatus.notDispatched,
        assignDealerId: null,
        assignWarehouseId: warehouseId,
        orderAssignedToCourier: status,
        awbNumber: "NA",
      };
    }

    let orderData = await orderInquiryService?.getOneByMultiField(query);
    if (!orderData) {
      throw new ApiError(httpStatus.OK, "No orders for this product");
    }

    if (barcode.length === 0 || barcode[0] === undefined) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successful.",
        status: true,
        data: {
          barcode: barcode[0],
          products: orderData?.schemeProducts,
          schemeQuantity: orderData?.shcemeQuantity,
          orderNumber: orderData?.orderNumber,
          customerName: orderData?.customerName,
          address: orderData?.autoFillingShippingAddress,
        },

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

// get barcode of warehouse to recreate outer box

exports.getWhBarcode = async (req, res) => {
  try {
    const barcodeToBeSearch = req.params.barcode;

    let additionalQuery = [
      {
        $match: {
          barcodeNumber: barcodeToBeSearch,
          isUsed: true,
          status: barcodeStatusType.atWarehouse,
          outerBoxbarCodeNumber: null,
        },
      },
      {
        $lookup: {
          from: "productgroups",
          localField: "productGroupId",
          foreignField: "_id",
          as: "product_group",
          pipeline: [
            { $match: { isDeleted: false } },
            { $project: { groupName: 1 } },
          ],
        },
      },

      {
        $lookup: {
          from: "warehouses",
          localField: "wareHouseId",
          foreignField: "_id",
          as: "warehouse_data",
          pipeline: [
            { $match: { isDeleted: false } },
            {
              $project: {
                wareHouseName: 1,
              },
            },
          ],
        },
      },

      {
        $addFields: {
          productGroupLabel: {
            $arrayElemAt: ["$product_group.groupName", 0],
          },
          wareHouseLabel: {
            $arrayElemAt: ["$warehouse_data.wareHouseName", 0],
          },
        },
      },
      { $unset: ["product_group", "warehouse_data"] },
    ];
    let barcode = [];
    const foundBarcode = await barCodeService.aggregateQuery(additionalQuery);

    if (foundBarcode !== null) {
      barcode.push(foundBarcode[0]);
    }

    if (barcode.length === 0) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successful.",
        status: true,
        data: barcode[0],
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

//get damage / expire barcode

exports.getDamageExpireBarcode = async (req, res) => {
  try {
    const barcodeToBeSearch = req.params.barcode;
    const warehouseId = req.params.wid;

    let additionalQuery = [
      {
        $match: {
          barcodeNumber: barcodeToBeSearch,
          isUsed: true,
          wareHouseId: new mongoose.Types.ObjectId(warehouseId),
          status: {
            $in: [barcodeStatusType.damage, barcodeStatusType.expired],
          },
          outerBoxbarCodeNumber: null,
        },
      },
      {
        $lookup: {
          from: "productgroups",
          localField: "productGroupId",
          foreignField: "_id",
          as: "product_group",
          pipeline: [
            { $match: { isDeleted: false } },
            { $project: { groupName: 1 } },
          ],
        },
      },

      {
        $lookup: {
          from: "warehouses",
          localField: "wareHouseId",
          foreignField: "_id",
          as: "warehouse_data",
          pipeline: [
            { $match: { isDeleted: false } },
            {
              $project: {
                wareHouseName: 1,
              },
            },
          ],
        },
      },

      {
        $addFields: {
          productGroupLabel: {
            $arrayElemAt: ["$product_group.groupName", 0],
          },
          wareHouseLabel: {
            $arrayElemAt: ["$warehouse_data.wareHouseName", 0],
          },
        },
      },
      { $unset: ["product_group", "warehouse_data"] },
    ];
    let barcode = [];
    const foundBarcode = await barCodeService.aggregateQuery(additionalQuery);

    if (foundBarcode !== null && foundBarcode[0] !== undefined) {
      barcode.push(foundBarcode[0]);
    }
    console.log(barcode, "barcode");

    if (barcode.length === 0) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successful.",
        status: true,
        data: barcode[0],
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

//inventory api
exports.getInventory = async (req, res) => {
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
    const cid = req.userData.companyId;
    const wid = req.params.wid;
    const status = req.params.status;

    const isCompanyExists = await companyService.findCount({
      _id: cid,
      isDeleted: false,
    });
    if (!isCompanyExists) {
      throw new ApiError(httpStatus.OK, "Invalid Company");
    }

    const isWarehouseExists = await WarehouseService.findCount({
      _id: wid,
      isDeleted: false,
    });
    if (!isWarehouseExists) {
      throw new ApiError(httpStatus.OK, "Invalid Warehouse");
    }

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
    let objectIdFields = ["productGroupId", "companyId", "wareHouseId"];

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
          from: "productgroups",
          localField: "productGroupId",
          foreignField: "_id",
          as: "product_group",
          pipeline: [
            { $match: { isDeleted: false } },
            { $project: { groupName: 1 } },
          ],
        },
      },
      {
        $lookup: {
          from: "warehouses",
          localField: "wareHouseId",
          foreignField: "_id",
          as: "warehouse_data",
          pipeline: [
            { $match: { isDeleted: false } },
            {
              $project: {
                wareHouseName: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          productGroupLabel: {
            $arrayElemAt: ["$product_group.groupName", 0],
          },
          wareHouseLabel: {
            $arrayElemAt: ["$warehouse_data.wareHouseName", 0],
          },
        },
      },
      { $unset: ["product_group", "warehouse_data"] },
      {
        $match: {
          isUsed: true, // You can add any additional match criteria here if needed
          companyId: new mongoose.Types.ObjectId(cid),
        },
      },
      {
        $group: {
          _id: {
            wareHouseId: `$${wid}`,
            productGroupId: `$productGroupId`,
          },
          productGroupLabel: { $first: "$productGroupLabel" },
          wareHouseLabel: { $first: "$wareHouseLabel" },
          count: { $sum: 1 }, // Count the documents in each group
          totalFreshCount: {
            $sum: {
              $cond: [
                { $eq: ["$status", barcodeStatusType.atWarehouse] },
                1,
                0,
              ],
            },
          },
          totalDamageCount: {
            $sum: {
              $cond: [{ $eq: ["$status", barcodeStatusType.damage] }, 1, 0],
            },
          },
          totalMissingCount: {
            $sum: {
              $cond: [{ $eq: ["$status", barcodeStatusType.missing] }, 1, 0],
            },
          },
          totalRtvCount: {
            $sum: {
              $cond: [{ $eq: ["$status", barcodeStatusType.rtv] }, 1, 0],
            },
          },
          totalFakeCount: {
            $sum: {
              $cond: [{ $eq: ["$status", barcodeStatusType.fake] }, 1, 0],
            },
          },
          expiredCount: {
            $sum: {
              $cond: [{ $eq: ["$status", barcodeStatusType.expired] }, 1, 0],
            },
          },
          destroyedCount: {
            $sum: {
              $cond: [{ $eq: ["$status", barcodeStatusType.destroyed] }, 1, 0],
            },
          },
          closedCount: {
            $sum: {
              $cond: [{ $eq: ["$status", barcodeStatusType.close] }, 1, 0],
            },
          },
          firstDocument: { $first: "$$ROOT" }, // Get the first document in each group
        },
      },
      {
        $project: {
          _id: 0, // Exclude the _id field
          wareHouseId: "$_id.wareHouseId",
          productGroupId: "$_id.productGroupId",
          count: 1, // Include the count field
          firstDocument: 1, // Include the firstDocument field
          productGroupLabel: 1,
          wareHouseLabel: 1,
          totalFreshCount: 1, // Include the totalFreshCount field
          totalDamageCount: 1, // Include the totalDamageCount field
          totalMissingCount: 1, // Include the totalMissingCount field
          totalRtvCount: 1,
          totalFakeCount: 1,
          expiredCount: 1,
          destroyedCount: 1,
          closedCount: 1,
        },
      },
    ];

    finalAggregateQuery.push({
      $match: matchQuery,
    });
    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    //-----------------------------------
    let dataFound = await barCodeService.aggregateQuery(finalAggregateQuery);

    if (dataFound.length === 0) {
      throw new ApiError(httpStatus.OK, `No data Found .`);
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
      moduleType.barcode,
      userRoleData,
      actionType.pagination
    );
    let result = await barCodeService.aggregateQuery(finalAggregateQuery);
    let allowedFields = getAllowedField(fieldsToDisplay, result);

    if (allowedFields?.length) {
      return res.status(httpStatus.OK).send({
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

// get vendor inventory

exports.getVendorInventory = async (req, res) => {
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
    const cid = req.userData.companyId;
    const vid = req.params.vid;
    const status = req.params.status;

    const isCompanyExists = await companyService.findCount({
      _id: cid,
      isDeleted: false,
    });
    if (!isCompanyExists) {
      throw new ApiError(httpStatus.OK, "Invalid Company");
    }

    const isWarehouseExists = await vendorService.findCount({
      _id: vid,
      isDeleted: false,
    });
    if (!isWarehouseExists) {
      throw new ApiError(httpStatus.OK, "Invalid Warehouse");
    }

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
    let objectIdFields = ["productGroupId", "companyId", "vendorId"];

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
          from: "productgroups",
          localField: "productGroupId",
          foreignField: "_id",
          as: "product_group",
          pipeline: [
            { $match: { isDeleted: false } },
            { $project: { groupName: 1 } },
          ],
        },
      },
      {
        $lookup: {
          from: "warehouses",
          localField: "wareHouseId",
          foreignField: "_id",
          as: "warehouse_data",
          pipeline: [
            { $match: { isDeleted: false } },
            {
              $project: {
                wareHouseName: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          productGroupLabel: {
            $arrayElemAt: ["$product_group.groupName", 0],
          },
          wareHouseLabel: {
            $arrayElemAt: ["$warehouse_data.wareHouseName", 0],
          },
        },
      },
      { $unset: ["product_group", "warehouse_data"] },
      {
        $match: {
          isUsed: true, // You can add any additional match criteria here if needed
          companyId: new mongoose.Types.ObjectId(cid),
        },
      },
      {
        $group: {
          _id: {
            vendorId: `$${vid}`,
            productGroupId: `$productGroupId`,
          },
          productGroupLabel: { $first: "$productGroupLabel" },
          wareHouseLabel: { $first: "$wareHouseLabel" },
          count: { $sum: 1 }, // Count the documents in each group
          totalFreshCount: {
            $sum: {
              $cond: [
                { $eq: ["$status", barcodeStatusType.atWarehouse] },
                1,
                0,
              ],
            },
          },
          totalDamageCount: {
            $sum: {
              $cond: [{ $eq: ["$status", barcodeStatusType.damage] }, 1, 0],
            },
          },
          totalMissingCount: {
            $sum: {
              $cond: [{ $eq: ["$status", barcodeStatusType.missing] }, 1, 0],
            },
          },
          totalRtvCount: {
            $sum: {
              $cond: [{ $eq: ["$status", barcodeStatusType.rtv] }, 1, 0],
            },
          },
          totalFakeCount: {
            $sum: {
              $cond: [{ $eq: ["$status", barcodeStatusType.fake] }, 1, 0],
            },
          },
          expiredCount: {
            $sum: {
              $cond: [{ $eq: ["$status", barcodeStatusType.expired] }, 1, 0],
            },
          },
          destroyedCount: {
            $sum: {
              $cond: [{ $eq: ["$status", barcodeStatusType.destroyed] }, 1, 0],
            },
          },
          closedCount: {
            $sum: {
              $cond: [{ $eq: ["$status", barcodeStatusType.close] }, 1, 0],
            },
          },
          firstDocument: { $first: "$$ROOT" }, // Get the first document in each group
        },
      },
      {
        $project: {
          _id: 0, // Exclude the _id field
          vendorId: "$_id.vendorId",
          productGroupId: "$_id.productGroupId",
          count: 1, // Include the count field
          firstDocument: 1, // Include the firstDocument field
          productGroupLabel: 1,
          wareHouseLabel: 1,
          totalFreshCount: 1, // Include the totalFreshCount field
          totalDamageCount: 1, // Include the totalDamageCount field
          totalMissingCount: 1, // Include the totalMissingCount field
          totalRtvCount: 1,
          totalFakeCount: 1,
          expiredCount: 1,
          destroyedCount: 1,
          closedCount: 1,
        },
      },
    ];

    finalAggregateQuery.push({
      $match: matchQuery,
    });
    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    //-----------------------------------
    let dataFound = await barCodeService.aggregateQuery(finalAggregateQuery);

    if (dataFound.length === 0) {
      throw new ApiError(httpStatus.OK, `No data Found .`);
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
      moduleType.barcode,
      userRoleData,
      actionType.pagination
    );
    let result = await barCodeService.aggregateQuery(finalAggregateQuery);
    let allowedFields = getAllowedField(fieldsToDisplay, result);

    if (allowedFields?.length) {
      return res.status(httpStatus.OK).send({
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

//inventory by status

exports.getInventoryByStatus = async (req, res) => {
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
    const cid = req.params.cid;
    const status = req.params.status;

    const isCompanyExists = await companyService.findCount({
      _id: cid,
      isDeleted: false,
    });
    if (!isCompanyExists) {
      throw new ApiError(httpStatus.OK, "Invalid Company");
    }

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
    let objectIdFields = [
      "productGroupId",
      "companyId",
      "wareHouseId",
      "vendorId",
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
          from: "productgroups",
          localField: "productGroupId",
          foreignField: "_id",
          as: "product_group",
          pipeline: [
            { $match: { isDeleted: false } },
            { $project: { groupName: 1 } },
          ],
        },
      },

      {
        $lookup: {
          from: "warehouses",
          localField: "wareHouseId",
          foreignField: "_id",
          as: "warehouse_data",
          pipeline: [
            { $match: { isDeleted: false } },
            {
              $project: {
                wareHouseName: 1,
              },
            },
          ],
        },
      },

      {
        $addFields: {
          productGroupLabel: {
            $arrayElemAt: ["$product_group.groupName", 0],
          },
          wareHouseLabel: {
            $arrayElemAt: ["$warehouse_data.wareHouseName", 0],
          },
        },
      },
      { $unset: ["product_group", "warehouse_data"] },
      {
        $match: {
          isUsed: true, // You can add any additional match criteria here if needed
          status: status,
          companyId: new mongoose.Types.ObjectId(cid),
        },
      },
      {
        $group: {
          _id: {
            productGroupId: `$productGroupId`,
          },
          productGroupLabel: { $first: "$productGroupLabel" },
          count: { $sum: 1 }, // Count the documents in each group
          firstDocument: { $first: "$$ROOT" }, // Get the first document in each group
        },
      },
      {
        $project: {
          _id: 0, // Exclude the _id field
          // wareHouseId: "$_id.wareHouseId",
          productGroupId: "$_id.productGroupId",
          count: 1, // Include the count field
          firstDocument: 1, // Include the firstDocument field
          productGroupLabel: 1,
          wareHouseLabel: 1,
        },
      },
    ];

    finalAggregateQuery.push({
      $match: matchQuery,
    });
    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    //-----------------------------------
    let dataFound = await barCodeService.aggregateQuery(finalAggregateQuery);

    if (dataFound.length === 0) {
      throw new ApiError(httpStatus.OK, `No data Found .`);
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
      moduleType.barcode,
      userRoleData,
      actionType.pagination
    );
    let result = await barCodeService.aggregateQuery(finalAggregateQuery);
    let allowedFields = getAllowedField(fieldsToDisplay, result);

    if (allowedFields?.length) {
      return res.status(httpStatus.OK).send({
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

// for dealer
exports.getInventoryByStatusForDealer = async (req, res) => {
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
      $and: [
        {
          isDeleted: false,
          dealerId: new mongoose.Types.ObjectId(req.userData.Id),
        },
      ],
    };
    const cid = req.userData.companyId;
    const status = req.params.status;

    const isCompanyExists = await companyService.findCount({
      _id: cid,
      isDeleted: false,
    });
    if (!isCompanyExists) {
      throw new ApiError(httpStatus.OK, "Invalid Company");
    }

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
    let objectIdFields = [
      "productGroupId",
      "companyId",
      "wareHouseId",
      "vendorId",
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
          from: "productgroups",
          localField: "productGroupId",
          foreignField: "_id",
          as: "product_group",
          pipeline: [
            { $match: { isDeleted: false } },
            { $project: { groupName: 1 } },
          ],
        },
      },

      {
        $lookup: {
          from: "warehouses",
          localField: "wareHouseId",
          foreignField: "_id",
          as: "warehouse_data",
          pipeline: [
            { $match: { isDeleted: false } },
            {
              $project: {
                wareHouseName: 1,
              },
            },
          ],
        },
      },

      {
        $addFields: {
          productGroupLabel: {
            $arrayElemAt: ["$product_group.groupName", 0],
          },
          wareHouseLabel: {
            $arrayElemAt: ["$warehouse_data.wareHouseName", 0],
          },
        },
      },
      { $unset: ["product_group", "warehouse_data"] },
      {
        $match: {
          isUsed: true, // You can add any additional match criteria here if needed
          status: status,
          companyId: new mongoose.Types.ObjectId(cid),
        },
      },
      {
        $group: {
          _id: {
            productGroupId: `$productGroupId`,
          },
          productGroupLabel: { $first: "$productGroupLabel" },
          count: { $sum: 1 }, // Count the documents in each group
          firstDocument: { $first: "$$ROOT" }, // Get the first document in each group
        },
      },
      {
        $project: {
          _id: 0, // Exclude the _id field
          // wareHouseId: "$_id.wareHouseId",
          productGroupId: "$_id.productGroupId",
          count: 1, // Include the count field
          firstDocument: 1, // Include the firstDocument field
          productGroupLabel: 1,
          wareHouseLabel: 1,
        },
      },
    ];

    finalAggregateQuery.push({
      $match: matchQuery,
    });
    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    //-----------------------------------
    let dataFound = await barCodeService.aggregateQuery(finalAggregateQuery);

    if (dataFound.length === 0) {
      throw new ApiError(httpStatus.OK, `No data Found .`);
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

    let result = await barCodeService.aggregateQuery(finalAggregateQuery);

    if (result?.length) {
      return res.status(httpStatus.OK).send({
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

// dealer inventory

exports.getDealerInventory = async (req, res) => {
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
    const cid = req.params.cid;
    // const wid = req.params.wid;
    const status = req.params.status;

    const isCompanyExists = await companyService.findCount({
      _id: cid,
      isDeleted: false,
    });
    if (!isCompanyExists) {
      throw new ApiError(httpStatus.OK, "Invalid Company");
    }

    // const isWarehouseExists = await WarehouseService.findCount({
    //   _id: wid,
    //   isDeleted: false,
    // });
    // if (!isWarehouseExists) {
    //   throw new ApiError(httpStatus.OK, "Invalid Warehouse");
    // }

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
    let objectIdFields = ["productGroupId", "companyId", "wareHouseId"];

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
          from: "productgroups",
          localField: "productGroupId",
          foreignField: "_id",
          as: "product_group",
          pipeline: [
            { $match: { isDeleted: false } },
            { $project: { groupName: 1 } },
          ],
        },
      },

      {
        $lookup: {
          from: "warehouses",
          localField: "wareHouseId",
          foreignField: "_id",
          as: "warehouse_data",
          pipeline: [
            { $match: { isDeleted: false } },
            {
              $project: {
                wareHouseName: 1,
              },
            },
          ],
        },
      },

      {
        $addFields: {
          productGroupLabel: {
            $arrayElemAt: ["$product_group.groupName", 0],
          },
          wareHouseLabel: {
            $arrayElemAt: ["$warehouse_data.wareHouseName", 0],
          },
        },
      },
      { $unset: ["product_group", "warehouse_data"] },
      {
        $match: {
          isUsed: true, // You can add any additional match criteria here if needed
          status: status,
          companyId: new mongoose.Types.ObjectId(cid),
        },
      },
      {
        $group: {
          _id: {
            // wareHouseId: `$${wid}`,
            productGroupId: `$productGroupId`,
            productGroupLabel: `$productGroupLabel`,
          },
          count: { $sum: 1 }, // Count the documents in each group
          firstDocument: { $first: "$$ROOT" }, // Get the first document in each group
        },
      },
      {
        $project: {
          _id: 0, // Exclude the _id field
          wareHouseId: "$_id.wareHouseId",
          productGroupId: "$_id.productGroupId",
          count: 1, // Include the count field
          firstDocument: 1, // Include the firstDocument field
          productGroupLabel: 1,
          wareHouseLabel: 1,
        },
      },
    ];

    finalAggregateQuery.push({
      $match: matchQuery,
    });
    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    //-----------------------------------
    let dataFound = await barCodeService.aggregateQuery(finalAggregateQuery);

    if (dataFound.length === 0) {
      throw new ApiError(httpStatus.OK, `No data Found .`);
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

    let result = await barCodeService.aggregateQuery(finalAggregateQuery);

    if (result?.length) {
      return res.status(httpStatus.OK).send({
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

// get dealer inventory for zeh

exports.getDealerInventoryForZEH = async (req, res) => {
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

    // const wid = req.params.wid;
    const status = req.params.status;

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
    let objectIdFields = [
      "productGroupId",
      "companyId",
      "wareHouseId",
      "dealerId",
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
          from: "productgroups",
          localField: "productGroupId",
          foreignField: "_id",
          as: "product_group",
          pipeline: [
            { $match: { isDeleted: false } },
            { $project: { groupName: 1 } },
          ],
        },
      },

      {
        $lookup: {
          from: "warehouses",
          localField: "wareHouseId",
          foreignField: "_id",
          as: "warehouse_data",
          pipeline: [
            { $match: { isDeleted: false } },
            {
              $project: {
                wareHouseName: 1,
              },
            },
          ],
        },
      },

      {
        $addFields: {
          productGroupLabel: {
            $arrayElemAt: ["$product_group.groupName", 0],
          },
          wareHouseLabel: {
            $arrayElemAt: ["$warehouse_data.wareHouseName", 0],
          },
        },
      },
      { $unset: ["product_group", "warehouse_data"] },
      {
        $match: {
          isUsed: true, // You can add any additional match criteria here if needed
          status: barcodeStatusType.atDealerWarehouse,
          companyId: new mongoose.Types.ObjectId(req.userData.companyId),
        },
      },
      {
        $group: {
          _id: {
            // wareHouseId: `$${wid}`,
            productGroupId: `$productGroupId`,
            productGroupLabel: `$productGroupLabel`,
          },
          count: { $sum: 1 }, // Count the documents in each group
          firstDocument: { $first: "$$ROOT" }, // Get the first document in each group
          wareHouseLabel: { $first: "$wareHouseLabel" },
        },
      },
      {
        $project: {
          _id: 0, // Exclude the _id field
          wareHouseId: "$_id.wareHouseId",
          productGroupId: "$_id.productGroupId",
          count: 1, // Include the count field
          firstDocument: 1, // Include the firstDocument field
          productGroupLabel: 1,
          wareHouseLabel: 1,
        },
      },
    ];

    finalAggregateQuery.push({
      $match: matchQuery,
    });
    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    //-----------------------------------
    let dataFound = await barCodeService.aggregateQuery(finalAggregateQuery);

    if (dataFound.length === 0) {
      throw new ApiError(httpStatus.OK, `No data Found .`);
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

    let result = await barCodeService.aggregateQuery(finalAggregateQuery);

    if (result?.length) {
      return res.status(httpStatus.OK).send({
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

//delete api
exports.deleteDocument = async (req, res) => {
  try {
    let _id = req.params.id;
    if (!(await barCodeService.getOneByMultiField({ _id }))) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let deleted = await barCodeService.getOneAndDelete({ _id });
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
    let dataExist = await barCodeService.getOneByMultiField({ _id });
    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let isActive = dataExist.isActive ? false : true;

    let statusChanged = await barCodeService.getOneAndUpdate(
      { _id },
      { isActive }
    );
    await addToBarcodeFlow(
      statusChanged,
      `Barcode Status changes to ${isActive}`
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

// freeze barcode
exports.freezeBarcode = async (req, res) => {
  try {
    let barcodeArray = req.body.bcode;
    let status = req.params.status;
    const handleBarcodes = async (barcodes) => {
      // Create an array of promises
      const promises = barcodes?.map(async (ele) => {
        try {
          const dataExist = await barCodeService.getOneByMultiField({
            barcodeNumber: ele,
          });

          if (!dataExist) {
            // Reject the promise if data is not found
            return Promise.reject(
              new ApiError(httpStatus.OK, "Data not found.")
            );
          } else {
            let freezedBarcode = await barCodeService.getOneAndUpdate(
              { barcodeNumber: ele },
              { isFreezed: status }
            );
            if (!freezedBarcode) {
              return Promise.reject(
                new ApiError(httpStatus.OK, "Something went wrong.")
              );
            }
          }

          // Resolve with the data if found
          return dataExist;
        } catch (error) {
          return error; // Catch any error and return it to be handled later
        }
      });

      // Use Promise.all to handle the array of promises
      return Promise.all(promises.map((p) => p.catch((e) => e)));
    };

    // Example usage:
    const results = await handleBarcodes(barcodeArray);

    // Filter out errors from the results
    const successes = results.filter((result) => !(result instanceof Error));
    const errors = results.filter((result) => result instanceof Error);

    if (errors.length > 0) {
      // If there are any errors, handle them appropriately
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Some barcodes could not be processed."
      );
    }

    return res.status(httpStatus.OK).send({
      message: "Successful.",
      status: true,
      data: successes,
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

//courier return products
exports.courierReturnProduct = async (req, res) => {
  try {
    console.log("here");
    let barcodeData = req.body.barcode;
    let whid = req.params.whid;
    let id = req.params.id;
    let orderNumber = req.body.orderNumber;

    // let newBarcode = barcode?.map((ele) => {
    //   return new mongoose.Types.ObjectId(ele);
    // });
    const barcode = barcodeData?.map((ele) => {
      return ele?.barcode;
    });
    const validationPromises = barcode?.map(async (ele) => {
      const orderInquiryFound = await orderInquiryService?.getOneByMultiField({
        orderNumber: orderNumber,
        "barcodeData.barcode": { $in: [ele] },
      });
      if (!orderInquiryFound) {
        throw new ApiError(httpStatus.OK, "Barcode not from this order");
      }
    });

    // Wait for all promises to resolve
    await Promise.all(validationPromises);

    let dataExist = await barCodeService.aggregateQuery([
      {
        $match: {
          barcodeNumber: { $in: barcode },
        },
      },
    ]);
    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }

    let orderInquiry = await orderInquiryService?.getOneAndUpdate(
      { orderNumber: orderNumber },
      { $set: { status: orderStatusEnum.closed } }
    );
    await addToOrderFlow(orderInquiry);
    console.log("yha tak");
    const updates = await Promise.all(
      barcodeData.map(async (ele) => {
        return barCodeService.getOneAndUpdate(
          { barcodeNumber: ele?.barcode },
          {
            $set: {
              status: ele?.condition,
              wareHouseId: whid,
              dealerId: null,
            },
          }
        );
      })
    );

    if (!updates.length) {
      throw new ApiError(httpStatus.OK, "Something went wrong.");
    }

    const newBarcodeFlowData = await Promise.all(
      updates.map((updated) => {
        return addToBarcodeFlow(
          updated,
          `Returned from courier ${orderInquiry?.orderAssignedToCourier}, assigned to order number: ${orderInquiry?.orderNumber}, Received in ${updated.condition} Condition`
        );
      })
    );

    await customerWhReturnService?.getOneAndUpdate(
      { _id: id },
      { isCompleted: true }
    );

    return res.status(httpStatus.OK).send({
      message: "Successful.",
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

// update many for invert inventory

exports.updateInventory = async (req, res) => {
  try {
    let { barcodedata } = req.body;
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const currentHour = currentDate.getHours(); // Hour of the day (0-23)
    const currentMinute = currentDate.getMinutes(); // Minute of the hour (0-59)
    const currentSecond = currentDate.getSeconds();
    let outerBoxCode =
      barcodedata[0]?.lotNumber +
      currentDay +
      currentHour +
      currentMinute +
      currentSecond;

    const promises = barcodedata?.map(async (ele) => {
      const dataUpdated = await barCodeService.getOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(ele?._id),
          isDeleted: false,
        },
        {
          $set: {
            isUsed: true,
            status: barcodeStatusType.atWarehouse,
            outerBoxbarCodeNumber: outerBoxCode,
            wareHouseId: ele?.wareHouseId,
            vendorId: ele?.vendorId,
          },
        }
      );
      console.log(ele?.wareHouseId, ele?.productGroupId, "ele?.wareHouseId");
      let warehouseData = await WarehouseService?.getOneByMultiField({
        isDeleted: false,
        _id: new mongoose.Types.ObjectId(ele?.wareHouseId),
      });
      console.log(warehouseData, "warehouseData");
      let productGroupData = await ProductGroupService?.getOneByMultiField({
        isDeleted: false,
        _id: new mongoose.Types.ObjectId(ele?.productGroupId),
      });
      await addToBarcodeFlow(
        dataUpdated,
        `Barcode inwarded in ${warehouseData?.wareHouseName} Warehouse of ${productGroupData?.groupName}`
      );
      return dataUpdated;
    });

    const updatedDataArray = await Promise.all(promises);
    const allBarcodes = barcodedata?.map((ele) => {
      return ele?.barcodeNumber;
    });
    let serialNumber = await getInquiryNumber();
    await reprintOuterBoxSevice?.createNewData({
      serialNo: serialNumber,
      outerBoxNumber: outerBoxCode,
      innerBarcodes: allBarcodes,
      createdBy: req.userData.firstName + " " + req.userData.lastName,
      batchNumber: barcodedata[0]?.lotNumber,
      productId: barcodedata[0]?.productGroupId,
      expiryDate: barcodedata[0]?.expiryDate,
    });
    if (updatedDataArray.length > 0) {
      return res.status(httpStatus.OK).send({
        message: "Updated successfully.",
        data: updatedDataArray[0],
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

// update warehouse inventory also other company warehouse

exports.updateWarehouseInventory = async (req, res) => {
  try {
    let { barcodedata, wId, from } = req.body;

    const promises = barcodedata?.map(async (ele) => {
      const dataUpdated = await barCodeService.getOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(ele?._id),
          isDeleted: false,
          isUsed: true,
        },
        {
          $set: {
            status: barcodeStatusType.atWarehouse,
            wareHouseId: ele?.wareHouseId,
            companyId: ele?.fromCompanyId,
          },
        }
      );
      if (from === barcodeStatusType.wtw) {
        wId?.forEach(async (wtwid) => {
          await wtwMasterService.getOneAndUpdate(
            {
              _id: new mongoose.Types.ObjectId(wtwid),
              isDeleted: false,
            },
            {
              $set: {
                status: productStatus.complete,
              },
            }
          );
        });
      } else if (from === barcodeStatusType.wtc) {
        wId?.forEach(async (wtcid) => {
          await wtcMasterService.getOneAndUpdate(
            {
              _id: new mongoose.Types.ObjectId(wtcid),
              isDeleted: false,
            },
            {
              $set: {
                status: productStatus.complete,
              },
            }
          );
        });
      } else if (from === barcodeStatusType.wts) {
        wId?.forEach(async (wtsid) => {
          await wtsMasterService.getOneAndUpdate(
            {
              _id: new mongoose.Types.ObjectId(wtsid),
              isDeleted: false,
            },
            {
              $set: {
                status: productStatus.complete,
              },
            }
          );
        });
      } else if (from === barcodeStatusType.dtw) {
        wId?.forEach(async (dtwid) => {
          await dtwMasterService.getOneAndUpdate(
            {
              _id: new mongoose.Types.ObjectId(dtwid),
              isDeleted: false,
            },
            {
              $set: {
                status: productStatus.complete,
              },
            }
          );
        });
      } else if (from === barcodeStatusType.dtd) {
        wId?.forEach(async (dtdid) => {
          await dtdMasterService.getOneAndUpdate(
            {
              _id: new mongoose.Types.ObjectId(dtdid),
              isDeleted: false,
            },
            {
              $set: {
                status: productStatus.complete,
              },
            }
          );
        });
      }
      await addToBarcodeFlow(dataUpdated, "Barcode inwarded in warehouse");

      return dataUpdated;
    });

    const updatedDataArray = await Promise.all(promises);

    if (updatedDataArray.length > 0) {
      return res.status(httpStatus.OK).send({
        message: "Updated successfully.",
        data: updatedDataArray[0],
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

//barcode update to CLOSE

exports.updateBarcodeToClose = async (req, res) => {
  try {
    let { barcodes } = req.body;
    let { wid } = req.params;

    const promises = barcodes?.map(async (ele) => {
      const dataUpdated = await barCodeService.getOneAndUpdate(
        {
          barcodeNumber: ele,
          isDeleted: false,
          isUsed: true,
          wareHouseId: wid,
          status: {
            $in: [barcodeStatusType.damage, barcodeStatusType.expired],
          },
        },
        {
          $set: {
            status: barcodeStatusType.close,
          },
        }
      );

      await addToBarcodeFlow(
        dataUpdated,
        "Barcode discontinued as it was Damaged or Expired"
      );

      return dataUpdated;
    });

    const updatedDataArray = await Promise.all(promises);
    if (updatedDataArray.length > 0) {
      return res.status(httpStatus.OK).send({
        message: "Updated successfully.",
        data: updatedDataArray[0],
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

//add start
exports.bulkUpload = async (req, res) => {
  try {
    if (!req.file) {
      throw new ApiError(httpStatus.BAD_REQUEST, "No file uploaded.");
    }
    const warehouseId = req.params.warehouseId;
    // const { companyId } = req.userData;

    // Read the Excel file
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Extract AWB numbers and other data
    const barcodes = sheet.map((row) => ({
      barcodeNumber: row.barcodenumber,
    }));

    const promises = barcodes?.map(async (ele) => {
      const dataUpdated = await barCodeService.getOneAndUpdate(
        {
          barcodeNumber: ele,
          isDeleted: false,
          isUsed: true,
          wareHouseId: warehouseId,
          status: {
            $in: [barcodeStatusType.damage, barcodeStatusType.expired],
          },
        },
        {
          $set: {
            status: barcodeStatusType.close,
          },
        }
      );

      await addToBarcodeFlow(
        dataUpdated,
        "Barcode discontinued as it was Damaged or Expired"
      );

      return dataUpdated;
    });

    const updatedDataArray = await Promise.all(promises);
    // Check for duplicates and create new data

    res.status(httpStatus.CREATED).send({
      message: "Updated successfully!",
      data: null,
      status: true,
      code: null,
      issue: null,
    });
  } catch (err) {
    const errData = errorRes(err);
    logger.info(errData.resData);
    const { message, status, data, code, issue } = errData.resData;
    res.status(errData.statusCode).send({ message, status, data, code, issue });
  }
};

// dealer inward

exports.updateWarehouseInventoryDealer = async (req, res) => {
  try {
    let { barcodedata, dtdRequestIds } = req.body;

    const promises = barcodedata?.map(async (ele) => {
      const dataUpdated = await barCodeService.getOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(ele?._id),
          isDeleted: false,
          isUsed: true,
        },
        {
          $set: {
            status: barcodeStatusType.atDealerWarehouse,
            wareHouseId: ele?.wareHouseId,
            dealerId: req.userData.Id,
            companyId: req.userData?.companyId,
          },
        }
      );

      dtdRequestIds?.forEach(async (dtdid) => {
        await dtdMasterService.getOneAndUpdate(
          {
            _id: new mongoose.Types.ObjectId(dtdid),
            isDeleted: false,
          },
          {
            $set: {
              status: productStatus.complete,
            },
          }
        );
      });
      let dealerData = await dealerService?.getOneByMultiField({
        isDeleted: false,
        _id: req.userData.Id,
      });

      await addToBarcodeFlow(
        dataUpdated,
        `Barcode inward in ${
          dealerData?.firstName + " " + dealerData?.lastName
        } Dealers warehouse`
      );

      return dataUpdated;
    });

    const updatedDataArray = await Promise.all(promises);

    if (updatedDataArray.length > 0) {
      return res.status(httpStatus.OK).send({
        message: "Updated successfully.",
        data: updatedDataArray[0],
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

// dealer outward api

exports.outwardInventory = async (req, res) => {
  try {
    let {
      barcodedata,
      soId,
      transporterGST,
      mode,
      distance,
      vehicleNumber,
      vehicleType,
      transportDocNo,
      documnetDate,
      roadPermitNumber,
      lrNo,
      totalWeight,
      totalPackages,
      fileUrl,
    } = req.body;
    const groupedData = barcodedata.reduce((result, item) => {
      const outerBoxbarCodeNumber = item.outerBoxbarCodeNumber;

      // Check if the outerBoxbarCodeNumber already exists as a key in the result object
      if (!result[outerBoxbarCodeNumber]) {
        // If it doesn't exist, create an array for that key
        result[outerBoxbarCodeNumber] = [];
      }

      // Push the current item into the array associated with the outerBoxbarCodeNumber key
      result[outerBoxbarCodeNumber].push(item);

      return result;
    }, {});

    // Convert the grouped data into an array of objects (if needed)
    const groupedArray = Object.keys(groupedData).map((key) => ({
      outerBoxbarCodeNumber: key,
      items: groupedData[key],
    }));
    const promises = barcodedata?.map(async (ele) => {
      let allOuterBoxBarcode = await barCodeService.findCount({
        outerBoxbarCodeNumber: ele?.outerBoxbarCodeNumber,
        isUsed: true,
      });
      let foundObj = groupedArray?.find((fele) => {
        if (fele?.outerBoxbarCodeNumber !== null) {
          return fele?.outerBoxbarCodeNumber === ele?.outerBoxbarCodeNumber;
        }
      });

      if (foundObj?.items?.length !== allOuterBoxBarcode) {
        await barCodeService.updateMany(
          {
            outerBoxbarCodeNumber: ele?.outerBoxbarCodeNumber,
            isUsed: true,
          },
          {
            $set: {
              outerBoxbarCodeNumber: null,
            },
          }
        );
        // await addToBarcodeFlow(ele, "Barcode outerBox Opened");
      }

      const dataUpdated = await barCodeService.getOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(ele?._id),
          isUsed: true,
        },
        {
          $set: {
            status: barcodeStatusType.inTransit,
            wareHouseId: null,
          },
        }
      );
      const updatedSOs = await Promise.all(
        soId.map(async (soid) => {
          const updatedSO = await salesOrderService.getOneAndUpdate(
            {
              _id: new mongoose.Types.ObjectId(soid),
              isDeleted: false,
            },
            {
              $set: {
                status: productStatus.dispatched,
                transporterGST,
                mode,
                distance,
                vehicleNumber,
                vehicleType,
                transportDocNo,
                documnetDate,
                roadPermitNumber,
                lrNo,
                totalWeight,
                totalPackages,
                fileUrl,
              },
            }
          );

          return updatedSO?.soNumber; // Return soNumber for each update
        })
      );

      await addToBarcodeFlow(
        dataUpdated,
        `Barcode is in-Transit Dispatched from warehouse to Dealer with respect to Sales order number: ${updatedSOs[0]}`
      );

      return dataUpdated;
    });

    const updatedDataArray = await Promise.all(promises);

    if (updatedDataArray.length > 0) {
      return res.status(httpStatus.OK).send({
        message: "Updated successfully.",
        data: null,
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

// rtv outward

exports.rtvOutwardInventory = async (req, res) => {
  try {
    let { barcodedata, rtvId } = req.body;
    const groupedData = barcodedata.reduce((result, item) => {
      const outerBoxbarCodeNumber = item.outerBoxbarCodeNumber;

      // Check if the outerBoxbarCodeNumber already exists as a key in the result object
      if (!result[outerBoxbarCodeNumber]) {
        // If it doesn't exist, create an array for that key
        result[outerBoxbarCodeNumber] = [];
      }

      // Push the current item into the array associated with the outerBoxbarCodeNumber key
      result[outerBoxbarCodeNumber].push(item);

      return result;
    }, {});

    // Convert the grouped data into an array of objects (if needed)
    const groupedArray = Object.keys(groupedData).map((key) => ({
      outerBoxbarCodeNumber: key,
      items: groupedData[key],
    }));
    const promises = barcodedata?.map(async (ele) => {
      let allOuterBoxBarcode = await barCodeService.findCount({
        outerBoxbarCodeNumber: ele?.outerBoxbarCodeNumber,
        isUsed: true,
      });
      let foundObj = groupedArray?.find((fele) => {
        if (fele?.outerBoxbarCodeNumber !== null) {
          return fele?.outerBoxbarCodeNumber === ele?.outerBoxbarCodeNumber;
        }
      });

      if (foundObj?.items?.length !== allOuterBoxBarcode) {
        await barCodeService.updateMany(
          {
            outerBoxbarCodeNumber: ele?.outerBoxbarCodeNumber,
            isUsed: true,
          },
          {
            $set: {
              outerBoxbarCodeNumber: null,
            },
          }
        );
        // await addToBarcodeFlow(ele, "Barcode outerBox Opened");
      }

      const dataUpdated = await barCodeService.getOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(ele?._id),
          isUsed: true,
        },
        {
          $set: {
            status: barcodeStatusType.rtv,
            vendorId: new mongoose.Types.ObjectId(ele?.vendorId),
            // wareHouseId: null,
          },
        }
      );
      rtvId?.forEach(async (rtvid) => {
        await rtvMasterService.getOneAndUpdate(
          {
            _id: new mongoose.Types.ObjectId(rtvid),
            isDeleted: false,
          },
          {
            $set: {
              status: productStatus.dispatched,
            },
          }
        );
      });
      let warehouseData = await WarehouseService?.getOneByMultiField({
        isDeleted: false,
        _id: dataUpdated?.warehouseId,
      });

      let vendorData = await vendorService?.getOneByMultiField({
        isDeleted: false,
        _id: new mongoose.Types.ObjectId(ele?.vendorId),
      });

      await addToBarcodeFlow(
        dataUpdated,
        `Barcode Dispatched from ${warehouseData?.wareHouseName} to ${vendorData?.companyName} Vendor`
      );

      return dataUpdated;
    });

    const updatedDataArray = await Promise.all(promises);

    if (updatedDataArray.length > 0) {
      return res.status(httpStatus.OK).send({
        message: "Updated successfully.",
        data: null,
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

// wtw outward

exports.wtwOutwardInventory = async (req, res) => {
  try {
    let { barcodedata, wtwId } = req.body;
    const groupedData = barcodedata.reduce((result, item) => {
      const outerBoxbarCodeNumber = item.outerBoxbarCodeNumber;

      // Check if the outerBoxbarCodeNumber already exists as a key in the result object
      if (!result[outerBoxbarCodeNumber]) {
        // If it doesn't exist, create an array for that key
        result[outerBoxbarCodeNumber] = [];
      }

      // Push the current item into the array associated with the outerBoxbarCodeNumber key
      result[outerBoxbarCodeNumber].push(item);

      return result;
    }, {});

    // Convert the grouped data into an array of objects (if needed)
    const groupedArray = Object.keys(groupedData).map((key) => ({
      outerBoxbarCodeNumber: key,
      items: groupedData[key],
    }));
    const promises = barcodedata?.map(async (ele) => {
      let allOuterBoxBarcode = await barCodeService.findCount({
        outerBoxbarCodeNumber: ele?.outerBoxbarCodeNumber,
        isUsed: true,
      });
      let foundObj = groupedArray?.find((fele) => {
        if (fele?.outerBoxbarCodeNumber !== null) {
          return fele?.outerBoxbarCodeNumber === ele?.outerBoxbarCodeNumber;
        }
      });

      if (foundObj?.items?.length !== allOuterBoxBarcode) {
        await barCodeService.updateMany(
          {
            outerBoxbarCodeNumber: ele?.outerBoxbarCodeNumber,
            isUsed: true,
          },
          {
            $set: {
              outerBoxbarCodeNumber: null,
            },
          }
        );
        // await addToBarcodeFlow(ele, "Barcode outerBox Opened");
      }

      const dataUpdated = await barCodeService.getOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(ele?._id),
          isUsed: true,
        },
        {
          $set: {
            status: barcodeStatusType.wtw,
            wareHouseId: null,
          },
        }
      );
      let companyWarehouseId;
      let otherCompanyWarehouseId;
      const promises = wtwId?.map(async (wtwid) => {
        let wtwUpdatedData = await wtwMasterService.getOneAndUpdate(
          {
            _id: new mongoose.Types.ObjectId(wtwid),
            isDeleted: false,
          },
          {
            $set: {
              status: productStatus.dispatched,
            },
          }
        );
        companyWarehouseId = wtwUpdatedData?.fromWarehouseId;
        otherCompanyWarehouseId = wtwUpdatedData?.toWarehouseId;
      });
      await Promise.all(promises);
      let companyWarehouseData = await WarehouseService?.getOneByMultiField({
        isDeleted: false,
        _id: companyWarehouseId,
      });
      let otherCompanyWarehouseData =
        await WarehouseService?.getOneByMultiField({
          isDeleted: false,
          _id: otherCompanyWarehouseId,
        });
      await addToBarcodeFlow(
        dataUpdated,
        `Barcode Dispatched from ${companyWarehouseData?.wareHouseName} to Other company warehouse named ${otherCompanyWarehouseData?.wareHouseName}`
      );

      return dataUpdated;
    });

    const updatedDataArray = await Promise.all(promises);

    if (updatedDataArray.length > 0) {
      return res.status(httpStatus.OK).send({
        message: "Updated successfully.",
        data: null,
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

//dtd outward

exports.dtdOutwardInventory = async (req, res) => {
  try {
    let { barcodedata, dtdId } = req.body;
    const groupedData = barcodedata.reduce((result, item) => {
      const outerBoxbarCodeNumber = item.outerBoxbarCodeNumber;

      // Check if the outerBoxbarCodeNumber already exists as a key in the result object
      if (!result[outerBoxbarCodeNumber]) {
        // If it doesn't exist, create an array for that key
        result[outerBoxbarCodeNumber] = [];
      }

      // Push the current item into the array associated with the outerBoxbarCodeNumber key
      result[outerBoxbarCodeNumber].push(item);

      return result;
    }, {});

    // Convert the grouped data into an array of objects (if needed)
    const groupedArray = Object.keys(groupedData).map((key) => ({
      outerBoxbarCodeNumber: key,
      items: groupedData[key],
    }));
    const promises = barcodedata?.map(async (ele) => {
      let allOuterBoxBarcode = await barCodeService.findCount({
        outerBoxbarCodeNumber: ele?.outerBoxbarCodeNumber,
        isUsed: true,
      });
      let foundObj = groupedArray?.find((fele) => {
        if (fele?.outerBoxbarCodeNumber !== null) {
          return fele?.outerBoxbarCodeNumber === ele?.outerBoxbarCodeNumber;
        }
      });

      if (foundObj?.items?.length !== allOuterBoxBarcode) {
        let updatedBarcode = await barCodeService.updateMany(
          {
            outerBoxbarCodeNumber: ele?.outerBoxbarCodeNumber,
            isUsed: true,
          },
          {
            $set: {
              outerBoxbarCodeNumber: null,
            },
          }
        );
      }

      const dataUpdated = await barCodeService.getOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(ele?._id),
          isUsed: true,
        },
        {
          $set: {
            status: barcodeStatusType.dtd,
            wareHouseId: null,
            dealerId: null,
          },
        }
      );
      let fromDealerId;
      let toDealerId;

      const promises = dtdId?.map(async (dtdid) => {
        let updatedDTD = await dtdMasterService.getOneAndUpdate(
          {
            _id: new mongoose.Types.ObjectId(dtdid),
            isDeleted: false,
          },
          {
            $set: {
              status: productStatus.dispatched,
            },
          }
        );
        fromDealerId = updatedDTD?.fromDealerId;
        toDealerId = updatedDTD?.toDealerId;
      });

      await Promise.all(promises);

      let fromDealerData = await dealerService?.getOneByMultiField({
        isDeleted: false,
        _id: fromDealerId,
      });

      let toDealerData = await dealerService?.getOneByMultiField({
        isDeleted: false,
        _id: toDealerId,
      });

      await addToBarcodeFlow(
        dataUpdated,
        `Barcode dispatched from ${fromDealerData?.firmName} dealer's warehouse to ${toDealerData?.firmName} dealer's warehouse`
      );
      return dataUpdated;
    });

    const updatedDataArray = await Promise.all(promises);

    if (updatedDataArray.length > 0) {
      return res.status(httpStatus.OK).send({
        message: "Updated successfully.",
        data: null,
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

//dtw outward

exports.dtwOutwardInventory = async (req, res) => {
  try {
    let { barcodedata, dtwId } = req.body;
    const groupedData = barcodedata.reduce((result, item) => {
      const outerBoxbarCodeNumber = item.outerBoxbarCodeNumber;

      // Check if the outerBoxbarCodeNumber already exists as a key in the result object
      if (!result[outerBoxbarCodeNumber]) {
        // If it doesn't exist, create an array for that key
        result[outerBoxbarCodeNumber] = [];
      }

      // Push the current item into the array associated with the outerBoxbarCodeNumber key
      result[outerBoxbarCodeNumber].push(item);

      return result;
    }, {});

    // Convert the grouped data into an array of objects (if needed)
    const groupedArray = Object.keys(groupedData).map((key) => ({
      outerBoxbarCodeNumber: key,
      items: groupedData[key],
    }));
    const promises = barcodedata?.map(async (ele) => {
      let allOuterBoxBarcode = await barCodeService.findCount({
        outerBoxbarCodeNumber: ele?.outerBoxbarCodeNumber,
        isUsed: true,
      });
      let foundObj = groupedArray?.find((fele) => {
        if (fele?.outerBoxbarCodeNumber !== null) {
          return fele?.outerBoxbarCodeNumber === ele?.outerBoxbarCodeNumber;
        }
      });

      if (foundObj?.items?.length !== allOuterBoxBarcode) {
        await barCodeService.updateMany(
          {
            outerBoxbarCodeNumber: ele?.outerBoxbarCodeNumber,
            isUsed: true,
          },
          {
            $set: {
              outerBoxbarCodeNumber: null,
            },
          }
        );
        // await addToBarcodeFlow(ele, "Barcode outerBox Opened");
      }

      const dataUpdated = await barCodeService.getOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(ele?._id),
          isUsed: true,
        },
        {
          $set: {
            status: barcodeStatusType.dtw,
            wareHouseId: ele.wareHouseId,
          },
        }
      );
      let fromDealerWarehouseId;
      let toWarehouseId;

      const promises = dtwId?.map(async (dtwid) => {
        let updatedDTW = await dtwMasterService.getOneAndUpdate(
          {
            _id: new mongoose.Types.ObjectId(dtwid),
            isDeleted: false,
          },
          {
            $set: {
              status: productStatus.dispatched,
            },
          }
        );
        console.log(updatedDTW, "updatedDTW");
        fromDealerWarehouseId = updatedDTW?.fromWarehouseId;
        toWarehouseId = updatedDTW?.toWarehouseId;
        return updatedDTW; // Return the updated document to ensure Promise.all works correctly
      });

      await Promise.all(promises);

      let fromDealerWarehouseData = await WarehouseService?.getOneByMultiField({
        isDeleted: false,
        _id: fromDealerWarehouseId,
      });

      let toWarehouseData = await WarehouseService?.getOneByMultiField({
        isDeleted: false,
        _id: toWarehouseId,
      });

      await addToBarcodeFlow(
        dataUpdated,
        `Barcode dispatched from Dealer's ${fromDealerWarehouseData?.wareHouseName} warehouse to company's ${toWarehouseData?.wareHouseName} warehouse`
      );

      return dataUpdated;
    });

    const updatedDataArray = await Promise.all(promises);

    if (updatedDataArray.length > 0) {
      return res.status(httpStatus.OK).send({
        message: "Updated successfully.",
        data: null,
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

// wtc outward

exports.wtcOutwardInventory = async (req, res) => {
  try {
    let { barcodedata, wtcId } = req.body;
    const groupedData = barcodedata.reduce((result, item) => {
      const outerBoxbarCodeNumber = item.outerBoxbarCodeNumber;

      // Check if the outerBoxbarCodeNumber already exists as a key in the result object
      if (!result[outerBoxbarCodeNumber]) {
        // If it doesn't exist, create an array for that key
        result[outerBoxbarCodeNumber] = [];
      }

      // Push the current item into the array associated with the outerBoxbarCodeNumber key
      result[outerBoxbarCodeNumber].push(item);

      return result;
    }, {});

    // Convert the grouped data into an array of objects (if needed)
    const groupedArray = Object.keys(groupedData).map((key) => ({
      outerBoxbarCodeNumber: key,
      items: groupedData[key],
    }));
    const promises = barcodedata?.map(async (ele) => {
      let allOuterBoxBarcode = await barCodeService.findCount({
        outerBoxbarCodeNumber: ele?.outerBoxbarCodeNumber,
        isUsed: true,
      });
      let foundObj = groupedArray?.find((fele) => {
        if (fele?.outerBoxbarCodeNumber !== null) {
          return fele?.outerBoxbarCodeNumber === ele?.outerBoxbarCodeNumber;
        }
      });

      if (foundObj?.items?.length !== allOuterBoxBarcode) {
        await barCodeService.updateMany(
          {
            outerBoxbarCodeNumber: ele?.outerBoxbarCodeNumber,
            isUsed: true,
          },
          {
            $set: {
              outerBoxbarCodeNumber: null,
            },
          }
        );
        // await addToBarcodeFlow(ele, "Barcode outerBox Opened");
      }

      const dataUpdated = await barCodeService.getOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(ele?._id),
          isUsed: true,
        },
        {
          $set: {
            status: barcodeStatusType.wtc,
            wareHouseId: null,
            companyId: ele?.toCompanyId,
          },
        }
      );
      wtcId?.forEach(async (wtcid) => {
        await wtcMasterService.getOneAndUpdate(
          {
            _id: new mongoose.Types.ObjectId(wtcid),
            isDeleted: false,
          },
          {
            $set: {
              status: productStatus.dispatched,
            },
          }
        );
      });
      await addToBarcodeFlow(
        dataUpdated,
        "Barcode Dispatched from warehouse to other company"
      );

      return dataUpdated;
    });

    const updatedDataArray = await Promise.all(promises);

    if (updatedDataArray.length > 0) {
      return res.status(httpStatus.OK).send({
        message: "Updated successfully.",
        data: null,
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

// wts outward

exports.wtsOutwardInventory = async (req, res) => {
  try {
    let { barcodedata, wtsId } = req.body;
    const groupedData = barcodedata.reduce((result, item) => {
      const outerBoxbarCodeNumber = item.outerBoxbarCodeNumber;

      // Check if the outerBoxbarCodeNumber already exists as a key in the result object
      if (!result[outerBoxbarCodeNumber]) {
        // If it doesn't exist, create an array for that key
        result[outerBoxbarCodeNumber] = [];
      }

      // Push the current item into the array associated with the outerBoxbarCodeNumber key
      result[outerBoxbarCodeNumber].push(item);

      return result;
    }, {});

    // Convert the grouped data into an array of objects (if needed)
    const groupedArray = Object.keys(groupedData).map((key) => ({
      outerBoxbarCodeNumber: key,
      items: groupedData[key],
    }));
    const promises = barcodedata?.map(async (ele) => {
      let allOuterBoxBarcode = await barCodeService.findCount({
        outerBoxbarCodeNumber: ele?.outerBoxbarCodeNumber,
        isUsed: true,
      });
      let foundObj = groupedArray?.find((fele) => {
        if (fele?.outerBoxbarCodeNumber !== null) {
          return fele?.outerBoxbarCodeNumber === ele?.outerBoxbarCodeNumber;
        }
      });

      if (foundObj?.items?.length !== allOuterBoxBarcode) {
        await barCodeService.updateMany(
          {
            outerBoxbarCodeNumber: ele?.outerBoxbarCodeNumber,
            isUsed: true,
          },
          {
            $set: {
              outerBoxbarCodeNumber: null,
            },
          }
        );
        // await addToBarcodeFlow(ele, "Barcode outerBox Opened");
      }

      const dataUpdated = await barCodeService.getOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(ele?._id),
          isUsed: true,
        },
        {
          $set: {
            status: barcodeStatusType.wts,
            wareHouseId: null,
          },
        }
      );
      wtsId?.forEach(async (wtsid) => {
        await wtsMasterService.getOneAndUpdate(
          {
            _id: new mongoose.Types.ObjectId(wtsid),
            isDeleted: false,
          },
          {
            $set: {
              status: productStatus.dispatched,
            },
          }
        );
      });
      await addToBarcodeFlow(
        dataUpdated,
        "Barcode dispatched from warehouse to sample testing"
      );

      return dataUpdated;
    });

    const updatedDataArray = await Promise.all(promises);

    if (updatedDataArray.length > 0) {
      return res.status(httpStatus.OK).send({
        message: "Updated successfully.",
        data: null,
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

// dispatch order from warehouse

exports.orderDispatch = async (req, res) => {
  try {
    let { barcodedata, orderId } = req.body;

    let barcodeaIds = barcodedata?.map((ele) => {
      return { barcodeId: ele?._id, barcode: ele?.barcodeNumber };
    });
    const groupedData = barcodedata.reduce((result, item) => {
      const outerBoxbarCodeNumber = item.outerBoxbarCodeNumber;

      // Check if the outerBoxbarCodeNumber already exists as a key in the result object
      if (!result[outerBoxbarCodeNumber]) {
        // If it doesn't exist, create an array for that key
        result[outerBoxbarCodeNumber] = [];
      }

      // Push the current item into the array associated with the outerBoxbarCodeNumber key
      result[outerBoxbarCodeNumber].push(item);

      return result;
    }, {});

    // Convert the grouped data into an array of objects (if needed)
    const groupedArray = Object.keys(groupedData).map((key) => ({
      outerBoxbarCodeNumber: key,
      items: groupedData[key],
    }));
    const promises = barcodedata?.map(async (ele) => {
      let allOuterBoxBarcode = await barCodeService.findCount({
        outerBoxbarCodeNumber: ele?.outerBoxbarCodeNumber,
        isUsed: true,
      });
      let foundObj = groupedArray?.find((fele) => {
        if (fele?.outerBoxbarCodeNumber !== null) {
          return fele?.outerBoxbarCodeNumber === ele?.outerBoxbarCodeNumber;
        }
      });

      if (foundObj?.items?.length !== allOuterBoxBarcode) {
        await barCodeService.updateMany(
          {
            outerBoxbarCodeNumber: ele?.outerBoxbarCodeNumber,
            isUsed: true,
          },
          {
            $set: {
              outerBoxbarCodeNumber: null,
            },
          }
        );
        // await addToBarcodeFlow(ele, "Barcode outerBox Opened");
      }

      const dataUpdated = await barCodeService.getOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(ele?._id),
          isUsed: true,
        },
        {
          $set: {
            status: barcodeStatusType.delivered,
            wareHouseId: null,
          },
        }
      );
      await addToBarcodeFlow(
        dataUpdated,
        "Barcode Delivered to customer successfully!"
      );
      return dataUpdated;
    });

    const updatedDataArray = await Promise.all(promises);
    let updatedOrder = await orderInquiryService.getOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(orderId),
        isDeleted: false,
      },
      {
        $set: {
          orderStatus: productStatus.complete,

          barcodeData: barcodeaIds,
        },
      }
    );

    if (updatedOrder) {
      await addToOrderFlow(updatedOrder);
    }
    if (updatedDataArray.length > 0) {
      return res.status(httpStatus.OK).send({
        message: "Updated successfully.",
        data: null,
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

// dealer order dispatch

exports.dealerOrderDispatch = async (req, res) => {
  try {
    let { orderId, deliveryBoyId } = req.body;

    // let barcodeaIds = barcodedata?.map((ele) => {
    //   return ele?._id;
    // });
    // const groupedData = barcodedata.reduce((result, item) => {
    //   const outerBoxbarCodeNumber = item.outerBoxbarCodeNumber;

    //   // Check if the outerBoxbarCodeNumber already exists as a key in the result object
    //   if (!result[outerBoxbarCodeNumber]) {
    //     // If it doesn't exist, create an array for that key
    //     result[outerBoxbarCodeNumber] = [];
    //   }

    //   // Push the current item into the array associated with the outerBoxbarCodeNumber key
    //   result[outerBoxbarCodeNumber].push(item);

    //   return result;
    // }, {});

    // // Convert the grouped data into an array of objects (if needed)
    // const groupedArray = Object.keys(groupedData).map((key) => ({
    //   outerBoxbarCodeNumber: key,
    //   items: groupedData[key],
    // }));
    // const promises = barcodedata?.map(async (ele) => {
    //   let allOuterBoxBarcode = await barCodeService.findCount({
    //     outerBoxbarCodeNumber: ele?.outerBoxbarCodeNumber,
    //     isUsed: true,
    //   });
    //   let foundObj = groupedArray?.find((fele) => {
    //     if (fele?.outerBoxbarCodeNumber !== null) {
    //       return fele?.outerBoxbarCodeNumber === ele?.outerBoxbarCodeNumber;
    //     }
    //   });

    //   if (foundObj?.items?.length !== allOuterBoxBarcode) {
    //     await barCodeService.updateMany(
    //       {
    //         outerBoxbarCodeNumber: ele?.outerBoxbarCodeNumber,
    //         isUsed: true,
    //       },
    //       {
    //         $set: {
    //           outerBoxbarCodeNumber: null,
    //         },
    //       }
    //     );
    //     await barcodeFlowService.createNewData({
    //       productGroupId: ele.productGroupId,
    //       barcodeNumber: ele.barcodeNumber,
    //       cartonBoxId: null,
    //       barcodeGroupNumber: ele.barcodeGroupNumber,
    //       outerBoxbarCodeNumber: null,
    //       lotNumber: ele.lotNumber,
    //       isUsed: ele.isUsed,
    //       wareHouseId: ele.wareHouseId,
    //       status: barcodeStatusType.atWarehouse,
    //       companyId: ele.companyId,
    //     });
    //   }

    //   const dataUpdated = await barCodeService.getOneAndUpdate(
    //     {
    //       _id: new mongoose.Types.ObjectId(ele?._id),
    //       isUsed: true,
    //     },
    //     {
    //       $set: {
    //         status: barcodeStatusType.inTransit,
    //         wareHouseId: null,
    //       },
    //     }
    //   );

    //   await barcodeFlowService.createNewData({
    //     productGroupId: dataUpdated.productGroupId,
    //     barcodeNumber: dataUpdated.barcodeNumber,
    //     cartonBoxId: dataUpdated.cartonBoxId,
    //     barcodeGroupNumber: dataUpdated.barcodeGroupNumber,
    //     outerBoxbarCodeNumber: dataUpdated.outerBoxCode,
    //     lotNumber: dataUpdated.lotNumber,
    //     isUsed: dataUpdated.isUsed,
    //     wareHouseId: dataUpdated.wareHouseId,
    //     status: dataUpdated.status,
    //     companyId: dataUpdated.companyId,
    //   });
    //   return dataUpdated;
    // });

    // const updatedDataArray = await Promise.all(promises);
    let updatedOrder = await orderInquiryService.getOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(orderId),
        isDeleted: false,
      },
      {
        $set: {
          // orderStatus: productStatus.dispatched,
          delivery_boy_id: deliveryBoyId,
          // barcodeId: barcodeaIds,
        },
      }
    );

    if (updatedOrder) {
      await addToOrderFlow(updatedOrder);
    }
    if (updatedOrder) {
      return res.status(httpStatus.OK).send({
        message: "Updated successfully.",
        data: null,
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

// dealer side inward inventory

exports.dealerInwardInventory = async (req, res) => {
  try {
    let { barcodedata, soId } = req.body;
    const dealerId = await getDealerData(req.headers["x-access-token"]).then(
      (res) => {
        return res?.Id;
      }
    );

    const dealerWarehouse = await WarehouseService.getOneByMultiField({
      dealerId: new mongoose.Types.ObjectId(dealerId),
    });

    // const delaerWarehouse = await
    const promises = barcodedata?.map(async (ele) => {
      const dataUpdated = await barCodeService.getOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(ele?._id),
          isUsed: true,
        },
        {
          $set: {
            status: barcodeStatusType.atDealerWarehouse,
            wareHouseId: dealerWarehouse._id,
            dealerId: dealerId,
          },
        }
      );
      soId?.forEach(async (soid) => {
        await salesOrderService.getOneAndUpdate(
          {
            _id: new mongoose.Types.ObjectId(soid),
            isDeleted: false,
          },
          {
            $set: {
              status: productStatus.complete,
            },
          }
        );
      });
      await addToBarcodeFlow(
        dataUpdated,
        "Barcode inwarded at Dealer warehouse"
      );
      return dataUpdated;
    });

    const updatedDataArray = await Promise.all(promises);

    if (updatedDataArray.length > 0) {
      return res.status(httpStatus.OK).send({
        message: "Updated successfully.",
        data: null,
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
