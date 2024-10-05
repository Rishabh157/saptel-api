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
const amazonOrderService = require("../amazonOrder/AmazonOrderService");
const flipkartOrderService = require("../flipkartOrder/FlipkartOrderService");
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
  courierRTOType,
  webLeadType,
} = require("../../helper/enumUtils");
const { addToBarcodeFlow } = require("../barCodeFlow/BarCodeFlowHelper");
const {
  addToOrderFlow,
} = require("../orderInquiryFlow/OrderInquiryFlowHelper");
const XLSX = require("xlsx");
const {
  addRemoveAvailableQuantity,
  checkFreezeQuantity,
  addRemoveFreezeQuantity,
  checkDispatchFreezeQuantity,
  addAvailableQuantity,
  addReturnQuantity,
} = require("../productGroupSummary/ProductGroupSummaryHelper");
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
      vendorLabel,
      status,
    } = req.body;

    const isCompanyExists = await companyService.getOneByMultiField({
      _id: req.userData.companyId,
      isDeleted: false,
    });
    if (!isCompanyExists) {
      throw new ApiError(httpStatus.OK, "Invalid Company");
    }

    const isProductGroupExists = await ProductGroupService.getOneByMultiField({
      _id: productGroupId,
      isDeleted: false,
      isActive: true,
    });
    if (!isProductGroupExists) {
      throw new ApiError(httpStatus.OK, "Invalid Product Group");
    }

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
          companyId: new mongoose.Types.ObjectId(req.userData.companyId),
          productGroupId: new mongoose.Types.ObjectId(productGroupId),
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

    if (lastObject.length) {
      // Extract the numeric part from the existing barcode and increment it
      currentBarcode =
        parseInt(
          lastObject[0]?.barcodeNumber.replace(
            isProductGroupExists?.productGroupCode,
            ""
          )
        ) + 1;
    } else {
      // Start with the initial barcode if no previous barcode exists
      currentBarcode = lotNumber + "00001";
    }

    let output = [];
    let barcodeFlowData = [];

    for (let i = 0; i < quantity; i++) {
      if (i > 0) {
        // Increment and pad the numeric part of the barcode
        currentBarcode = (parseInt(currentBarcode) + 1)
          .toString()
          .padStart(6, "0");
      }

      // Prepend "CODE" to the barcode and include it in the output
      let fullBarcode = `${isProductGroupExists?.productGroupCode}${currentBarcode}`;

      output.push({
        productGroupId,
        barcodeGroupNumber,
        barcodeNumber: fullBarcode,
        upperBarcodeNumber:
          isCompanyExists?.companyCode +
          "/" +
          isProductGroupExists.productGroupCode +
          "/" +
          invoiceNumber,
        lotNumber,
        wareHouseId: null,
        companyId: req.userData.companyId,
        invoiceNumber,
        expiryDate,
        status: "",
        vendorLabel: vendorLabel,
      });

      barcodeFlowData.push({
        productGroupId,
        barcodeGroupNumber,
        barcodeNumber: fullBarcode,
        upperBarcodeNumber:
          lotNumber +
          "/" +
          isProductGroupExists.productGroupCode +
          "/" +
          invoiceNumber,
        lotNumber,
        wareHouseId: null,
        companyId: req.userData.companyId,
        invoiceNumber,
        expiryDate,
        status: "",
        barcodeLog: "Barcode created in warehouse",
        vendorLabel: vendorLabel,
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
    let isPaginationRequired = req.body.isPaginationRequired ?? true;
    let finalAggregateQuery = [];
    let matchQuery = { $and: [] };

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
      return res.status(httpStatus.OK).send({ ...searchQueryCheck });
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

    //----------------------------
    // Apply $match filter early
    finalAggregateQuery.push({ $match: matchQuery });

    // Calculate pagination first
    let { limit, page, totalData, skip, totalpages } =
      await getLimitAndTotalCount(
        req.body.limit,
        req.body.page,
        await barCodeService.findCount(matchQuery), // Direct count query to improve speed
        req.body.isPaginationRequired
      );

    // Apply pagination early in the pipeline
    finalAggregateQuery.push({ $sort: { [orderBy]: parseInt(orderByValue) } });
    if (isPaginationRequired) {
      finalAggregateQuery.push({ $skip: skip });
      finalAggregateQuery.push({ $limit: limit });
    }

    // Additional aggregation stages after limiting the data
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

    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    let result = await barCodeService.aggregateQuery(finalAggregateQuery);
    let userRoleData = await getUserRoleData(req);
    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.barcode,
      userRoleData,
      actionType.pagination
    );
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
    const {
      dateFilter,
      searchValue,
      params: searchIn,
      filterBy,
      rangeFilterBy,
      isPaginationRequired = true,
      orderBy,
      orderByValue,
      limit: reqLimit,
      page: reqPage,
    } = req.body;

    const finalAggregateQuery = [];
    let matchQuery = {
      $and: [{ isDeleted: false }],
    };

    // Active data only for certain paths
    if (req.path.includes("/app/")) {
      matchQuery.$and.push({ isActive: true });
    }

    const { orderBy: finalOrderBy, orderByValue: finalOrderByValue } =
      getOrderByAndItsValue(orderBy, orderByValue);

    // Validate and construct search query
    const searchQueryCheck = checkInvalidParams(searchIn, searchKeys);
    if (searchQueryCheck && !searchQueryCheck.status) {
      return res.status(httpStatus.OK).send({ ...searchQueryCheck });
    }

    const searchQuery = getSearchQuery(searchIn, searchKeys, searchValue);
    if (searchQuery?.length) {
      matchQuery.$and.push({ $or: searchQuery });
    }

    // Range filter query
    const rangeQuery = getRangeQuery(rangeFilterBy);
    if (rangeQuery?.length) {
      matchQuery.$and.push(...rangeQuery);
    }

    // Filter query
    const booleanFields = [];
    const numberFields = ["productGroupId"];
    const filterQuery = getFilterQuery(filterBy, booleanFields, numberFields);
    if (filterQuery?.length) {
      matchQuery.$and.push(...filterQuery);
    }

    // Date filter query
    const allowedDateFilterKeys = ["createdAt", "updatedAt"];
    const dateFilterQuery = await getDateFilterQuery(
      dateFilter,
      allowedDateFilterKeys
    );
    if (dateFilterQuery?.length) {
      matchQuery.$and.push(...dateFilterQuery);
    }

    // Add match query to the aggregate pipeline
    finalAggregateQuery.push({ $match: matchQuery });

    // Add lookups and additional fields
    const additionalQuery = [
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
          productGroupLabel: { $arrayElemAt: ["$product_group.groupName", 0] },
          wareHouseLabel: {
            $arrayElemAt: ["$warehouse_data.wareHouseName", 0],
          },
        },
      },
      { $unset: ["product_group", "warehouse_data"] },
    ];

    finalAggregateQuery.push(...additionalQuery);

    // Pagination logic
    let { limit, page, totalData, skip, totalpages } =
      await getLimitAndTotalCount(
        reqLimit,
        reqPage,
        await barCodeService.findCount(matchQuery), // Use count query here to avoid fetching all records
        isPaginationRequired
      );

    // Sort before pagination
    finalAggregateQuery.push({
      $sort: { [finalOrderBy]: parseInt(finalOrderByValue) },
    });

    // Apply pagination (skip and limit)
    if (isPaginationRequired) {
      finalAggregateQuery.push({ $skip: skip });
      finalAggregateQuery.push({ $limit: limit });
    }

    // Group after pagination
    finalAggregateQuery.push({
      $group: {
        _id: "$barcodeGroupNumber",
        barcodeGroupNumber: { $first: "$barcodeGroupNumber" },
        companyId: { $first: "$companyId" },
        createdAt: { $first: "$createdAt" },
        productGroupLabel: { $first: "$productGroupLabel" },
        vendorLabel: { $first: "$vendorLabel" },
        barcodeLength: { $sum: 1 },
      },
    });

    // Execute aggregation
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
      await addToOrderFlow(
        orderInquiry?._id,
        orderInquiry?.orderNumber,
        "",
        status,
        req.userData.userName
      );

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
      await addToOrderFlow(
        orderInquiry?._id,
        orderInquiry?.orderNumber,
        "",
        status,
        req.userData.userName
      );

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
    const {
      barcode,
      productgroupid: productGroupId,
      status,
      isSendingToDealer,
    } = req.params;
    const cid = req.userData.companyId;

    const barcodeFlowData = await barcodeFlowService.aggregateQuery([
      { $match: { barcodeNumber: barcode } },
      { $sort: { _id: -1 } },
      { $limit: 1 },
    ]);

    const matchCondition = {
      barcodeNumber: barcode,
      isUsed: true,
      status,
      productGroupId: new mongoose.Types.ObjectId(productGroupId),
      companyId: new mongoose.Types.ObjectId(cid),
      isFreezed: false,
    };

    const basePipeline = [
      { $match: matchCondition },
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
          productGroupLabel: { $arrayElemAt: ["$product_group.groupName", 0] },
          wareHouseLabel: {
            $arrayElemAt: ["$warehouse_data.wareHouseName", 0],
          },
        },
      },
      { $unset: ["product_group", "warehouse_data"] },
    ];

    // Query to find all matching barcodes
    const dataExist = await barCodeService.aggregateQuery([
      ...basePipeline,
      { $match: { outerBoxbarCodeNumber: barcode } },
    ]);
    let ResponseData = [];

    if (dataExist.length === 0) {
      // Query to find a single matching barcode if none found in the first query
      const foundBarcode = await barCodeService.aggregateQuery(basePipeline);

      if (isSendingToDealer && foundBarcode[0]?.isUsedFresh) {
        throw new ApiError(
          httpStatus.NOT_ACCEPTABLE,
          "Can't send used products to dealer!"
        );
      }

      if (foundBarcode.length) {
        ResponseData.push(foundBarcode[0]);
      }
    } else {
      if (isSendingToDealer) {
        dataExist.forEach((ele) => {
          if (ele?.isUsedFresh) {
            throw new ApiError(
              httpStatus.NOT_ACCEPTABLE,
              "Can't send used products to dealer!"
            );
          }
        });
      }
      ResponseData = dataExist;
    }

    if (ResponseData.length === 0) {
      throw new ApiError(
        httpStatus.OK,
        barcodeFlowData.length
          ? barcodeFlowData[0]?.barcodeLog
          : "Invalid barcode"
      );
    }

    return res.status(httpStatus.OK).send({
      message: "Successful.",
      status: true,
      data: ResponseData,
      code: "OK",
      issue: null,
    });
  } catch (err) {
    const errData = errorRes(err);
    logger.info(errData.resData);
    const { message, status, data, code, issue } = errData.resData;
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

    const foundBarcode = await barCodeService.aggregateQuery(
      additionalQueryForOne
    );

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

    const orderData = await orderInquiryService.getOneByMultiField({
      orderNumber: orderno,
    });

    if (!orderData) {
      throw new ApiError(httpStatus.NOT_FOUND, "Order not found.");
    }

    let orderBarcode = orderData?.barcodeData?.map((ele) => ele?.barcode);

    if (!orderBarcode || orderBarcode.length === 0) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "No barcodes found for the order."
      );
    }

    let allBarcodes = [];
    for (const ele of orderBarcode) {
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
          dealerId: new mongoose.Types.ObjectId(req.userData.Id),
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
    const getorder = req.params.getorder;

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
    if (foundBarcode !== null) {
      barcode.push(foundBarcode[0]);
    }

    // query change according to courier
    let orderData;
    if (getorder) {
      let query;
      if (status === preferredCourierPartner.shipyaari) {
        query = {
          "schemeProducts.productGroupId": barcode[0]?.productGroupId,
          orderStatus: productStatus.notDispatched,
          assignDealerId: null,
          assignWarehouseId: warehouseId,
          orderAssignedToCourier: status,
          isFreezed: false,
        };
      } else {
        query = {
          "schemeProducts.productGroupId": barcode[0]?.productGroupId,
          orderStatus: productStatus.notDispatched,
          assignDealerId: null,
          assignWarehouseId: warehouseId,
          orderAssignedToCourier: status,
          awbNumber: "NA",
          isFreezed: false,
        };
      }

      orderData = await orderInquiryService?.getOneAndUpdate(query, {
        $set: { isFreezed: true },
      });
      if (!orderData) {
        throw new ApiError(httpStatus.OK, "No orders for this product");
      }
    }

    if (barcode.length === 0 || barcode[0] === undefined) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successful.",
        status: true,
        data: {
          barcode: barcode[0],
          products: orderData?.schemeProducts || null,
          schemeQuantity: orderData?.shcemeQuantity || null,
          orderNumber: orderData?.orderNumber || null,
          customerName: orderData?.customerName || null,
          address: orderData?.autoFillingShippingAddress || null,
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

//get ecom orders barcode and order

exports.getDispatchBarcodeOfEcom = async (req, res) => {
  try {
    const barcodeToBeSearch = req.params.barcode;
    const type = req.params.type;

    let additionalQuery = [
      {
        $match: {
          barcodeNumber: barcodeToBeSearch,
          isUsed: true,
          isFreezed: false,
          status: barcodeStatusType.atWarehouse,
        },
      },
    ];
    let barcode = [];
    const foundBarcode = await barCodeService.aggregateQuery(additionalQuery);
    if (foundBarcode !== null) {
      barcode.push(foundBarcode[0]);
    }

    let productGroupData = await ProductGroupService.getOneByMultiField({
      _id: barcode[0]?.productGroupId,
    });

    // query change according to courier
    let amazonQuery;
    let flipkartQuery;
    let orderData;
    if (type === webLeadType.amazon) {
      amazonQuery = {
        productCode: productGroupData?.productGroupCode,
        isDispatched: false,
      };
      orderData = await amazonOrderService?.getOneByMultiField(amazonQuery);
    } else if (type === webLeadType.flipkart) {
      flipkartQuery = {
        productCode: productGroupData?.productGroupCode,
        isDispatched: false,
      };
      orderData = await flipkartOrderService?.getOneByMultiField(flipkartQuery);
    }

    if (!orderData) {
      throw new ApiError(httpStatus.OK, "No orders for this product");
    }

    if (barcode.length === 0 || barcode[0] === undefined) {
      throw new ApiError(httpStatus.OK, "Invalid barcode");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successfull.",
        status: true,
        data: {
          barcode: barcode[0],
          quantity: orderData?.quantity,
          productCode: orderData?.productCode,
          orderId: orderData?.amazonOrderId || orderData?.order_id,
          orderNumber: orderData?.orderNumber,
          itemPrice: orderData?.itemPrice,
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

// dispatch ecom orders
exports.dispatchEcomOrder = async (req, res) => {
  try {
    const { barcodes, orderNumber, type, warehouseId } = req.body;
    let orderData;
    let query, orderService;

    // Define service and query based on type
    switch (type) {
      case webLeadType.amazon:
        orderService = amazonOrderService;
        query = { orderNumber, isDispatched: false };
        break;
      case webLeadType.flipkart:
        orderService = flipkartOrderService;
        query = { orderNumber, isDispatched: false };
        break;
      default:
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid order type");
    }

    // Fetch order data
    orderData = await orderService?.getOneByMultiField(query);
    if (!orderData) {
      throw new ApiError(httpStatus.NOT_FOUND, "No order found");
    }

    // Update the order with barcode data
    await orderService?.getOneAndUpdate(
      { orderNumber },
      {
        $set: {
          barcodeData: barcodes,
          isDispatched: true,
          status: orderStatusEnum.intransit,
        },
      }
    );

    // Update barcode status
    const barcodePromises = barcodes?.map((ele) =>
      barCodeService?.getOneAndUpdate(
        { _id: ele?.barcodeId },
        {
          $set: {
            isFreezed: false,
            status: barcodeStatusType.inTransit,
            isFreezed: false,
          },
        }
      )
    );
    await Promise.all(barcodePromises);

    // Validate and process barcode data
    const barcodeData = await barCodeService?.getOneByMultiField({
      _id: barcodes[0]?.barcodeId,
    });

    if (!barcodeData || barcodes.length === 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid barcode");
    }

    console.log(req.userData, "========");

    // Update available quantity
    await addRemoveAvailableQuantity(
      req.userData.companyId,
      warehouseId,
      barcodeData?.productGroupId,
      barcodes.length,
      "REMOVE"
    );

    // Respond with success
    return res.status(httpStatus.OK).json({
      message: "Dispatched Successfully",
      status: true,
      data: null,
      code: "OK",
      issue: null,
    });
  } catch (err) {
    // Centralized error handling
    const errData = errorRes(err);
    logger.info(errData.resData);
    const { message, status, data, code, issue } = errData.resData;
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue });
  }
};

// Ecom RTO

exports.ecomRTO = async (req, res) => {
  try {
    const { barcodes, orderNumber, type, warehouseId } = req.body;

    // Validate request data
    if (!barcodes || barcodes.length === 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, "No barcodes provided");
    }

    let orderData;
    let query, orderService;

    // Select the correct service and query based on order type
    switch (type) {
      case webLeadType.amazon:
        orderService = amazonOrderService;
        query = { orderNumber, isDispatched: true };
        break;
      case webLeadType.flipkart:
        orderService = flipkartOrderService;
        query = { orderNumber, isDispatched: true };
        break;
      default:
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid order type");
    }

    // Fetch the order data
    orderData = await orderService?.getOneByMultiField(query);
    if (!orderData) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Order not found or not dispatched"
      );
    }

    // Update the order with barcode data and mark the order as closed
    await orderService?.getOneAndUpdate(
      { orderNumber },
      {
        $set: {
          barcodeData: barcodes,
          status: orderStatusEnum.closed,
        },
      }
    );

    // Update each barcode's status to `atWarehouse` and unfreeze
    const barcodePromises = barcodes.map((ele) =>
      barCodeService?.getOneAndUpdate(
        { _id: ele?.barcodeId },
        { $set: { isFreezed: false, status: barcodeStatusType.atWarehouse } }
      )
    );
    await Promise.all(barcodePromises);

    // Validate and fetch barcode data for further processing
    const barcodeData = await barCodeService?.getOneByMultiField({
      _id: barcodes[0]?.barcodeId,
    });

    if (!barcodeData) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid barcode");
    }

    // Update available quantity for each barcode
    await Promise.all(
      barcodes.map((ele) =>
        addReturnQuantity(
          req.userData.companyId,
          warehouseId,
          barcodeData?.productGroupId,
          1,
          ele?.condition
        )
      )
    );

    // Respond with success
    return res.status(httpStatus.OK).json({
      message: "Dispatched Successfully",
      status: true,
      data: null,
      code: "OK",
      issue: null,
    });
  } catch (err) {
    // Centralized error handling
    const errData = errorRes(err);
    logger.info(errData.resData);
    const { message, status, data, code, issue } = errData.resData;
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
    await addToOrderFlow(
      orderInquiry?._id,
      orderInquiry?.orderNumber,
      "",
      orderStatusEnum.closed,
      req.userData.userName
    );
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
              isFreezed: false,
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

    const productStatus = {
      [barcodeStatusType.atWarehouse]: courierRTOType.fresh,
      [barcodeStatusType.damage]: courierRTOType.damage,
      [barcodeStatusType.destroyed]: courierRTOType.destroyed,
    };

    // Update scheme products quantities in parallel
    await Promise.all(
      orderInquiry?.schemeProducts?.map(async (ele, index) => {
        await addReturnQuantity(
          req.userData.companyId,
          orderInquiry?.assignWarehouseId,
          ele?.productGroupId,
          ele?.productQuantity,
          productStatus[barcodeData[index]?.condition],
          null
        );
      })
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
            vendorLabel: ele?.vendorLabel,
            isFreezed: false,
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
      console.log(
        "heree..................",
        req.userData.companyId,
        barcodedata[0]?.wareHouseId,
        barcodedata[0]?.productGroupId,
        allBarcodes.length
      );
      await addRemoveAvailableQuantity(
        req.userData.companyId,
        barcodedata[0]?.wareHouseId,
        barcodedata[0]?.productGroupId,
        allBarcodes.length,
        "ADD"
      );
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
            isFreezed: false,
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
    const aggregateProducts = (arr) => {
      return arr.reduce((acc, curr) => {
        const existingItem = acc.find(
          (item) => item.productGroupId === curr.productGroupId
        );
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          acc.push({ ...curr, quantity: 1 });
        }
        return acc;
      }, []);
    };

    // Aggregate barcodedata
    const output = aggregateProducts(barcodedata);
    console.log(output, "output");
    await Promise.all(
      output.map(async (item) => {
        const createdData = await addAvailableQuantity(
          req.userData.companyId,
          item.wareHouseId,
          item.productGroupId,
          item.quantity
        );
        if (!createdData.status) {
          throw new ApiError(httpStatus.OK, createdData.msg);
        }
      })
    );
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
          companyId: req.userData.companyId,
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
    console.log("oooooooooooooooo");
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
    console.log("uuuuuu");
    const updatedDataArray = await Promise.all(promises);
    console.log(updatedDataArray, "................");
    // Aggregate products by productGroupId
    const aggregateProducts = (arr) => {
      return arr.reduce((acc, curr) => {
        const existingItem = acc.find(
          (item) => item.productGroupId === curr.productGroupId
        );
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          acc.push({ ...curr, quantity: 1 });
        }
        return acc;
      }, []);
    };

    const output = aggregateProducts(barcodedata);
    console.log(output, "output");
    await Promise.all(
      output.map(async (item) => {
        const createdData = await addAvailableQuantity(
          req.userData.companyId,
          item.wareHouseId,
          item.productGroupId,
          item.quantity
        );
        if (!createdData.status) {
          throw new ApiError(httpStatus.OK, createdData.msg);
        }
      })
    );
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
    const {
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

      totalWeight,
      totalPackages,
      fileUrl,
    } = req.body;

    // Group barcodedata by outerBoxbarCodeNumber
    const groupedData = barcodedata.reduce((result, item) => {
      const { outerBoxbarCodeNumber } = item;

      if (!result[outerBoxbarCodeNumber]) {
        result[outerBoxbarCodeNumber] = [];
      }
      result[outerBoxbarCodeNumber].push(item);

      return result;
    }, {});

    // Convert grouped data into an array of objects
    const groupedArray = Object.entries(groupedData).map(([key, items]) => ({
      outerBoxbarCodeNumber: key,
      items,
    }));

    // Helper function to aggregate products by productGroupId
    const aggregateProducts = (arr) => {
      return arr.reduce((acc, curr) => {
        const existingItem = acc.find(
          (item) => item.productGroupId === curr.productGroupId
        );
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          acc.push({ ...curr, quantity: 1 });
        }
        return acc;
      }, []);
    };

    // Aggregate the product data based on productGroupId
    const output = aggregateProducts(barcodedata);
    console.log(output, "output");

    // Process the aggregated product data before proceeding with barcodedata updates
    await Promise.all(
      output.map(async (item) => {
        const productSummary = await checkDispatchFreezeQuantity(
          req.userData.companyId,
          item.wareHouseId,
          item.productGroupId,
          item.quantity
        );
        if (!productSummary.status) {
          throw new ApiError(httpStatus.OK, productSummary.msg);
        }
      })
    );

    // Update freeze quantity after validation
    await Promise.all(
      output.map(async (item) => {
        const createdData = await addRemoveFreezeQuantity(
          req.userData.companyId,
          item.wareHouseId,
          item.productGroupId,
          item.quantity,
          "REMOVE"
        );
        if (!createdData.status) {
          throw new ApiError(httpStatus.OK, createdData.msg);
        }
      })
    );

    // Helper function to update barcodes
    const updateBarcodes = async (ele, allOuterBoxBarcode, foundObj) => {
      if (foundObj?.items?.length !== allOuterBoxBarcode) {
        await barCodeService.updateMany(
          {
            outerBoxbarCodeNumber: ele.outerBoxbarCodeNumber,
            isUsed: true,
          },
          {
            $set: { outerBoxbarCodeNumber: null },
          }
        );
      }

      return barCodeService.getOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(ele._id), isUsed: true },
        {
          $set: {
            status: barcodeStatusType.inTransit,
            wareHouseId: null,
            dealerId: ele?.dealerId,
            isFreezed: false,
          },
        }
      );
    };

    // Process each barcode and update sales orders
    const promises = barcodedata.map(async (ele) => {
      const allOuterBoxBarcode = await barCodeService.findCount({
        outerBoxbarCodeNumber: ele.outerBoxbarCodeNumber,
        isUsed: true,
      });

      const foundObj = groupedArray.find(
        (fele) => fele.outerBoxbarCodeNumber === ele.outerBoxbarCodeNumber
      );

      const dataUpdated = await updateBarcodes(
        ele,
        allOuterBoxBarcode,
        foundObj
      );

      const updatedSOs = await Promise.all(
        soId.map((soid) =>
          salesOrderService.getOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(soid), isDeleted: false },
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

                totalWeight,
                totalPackages,
                fileUrl,
              },
            }
          )
        )
      );

      const soNumber = updatedSOs[0]?.soNumber;

      // Update barcode flow
      await addToBarcodeFlow(
        dataUpdated,
        `Barcode is in-Transit Dispatched from warehouse to Dealer with respect to Sales order number: ${soNumber}`
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
    }

    throw new ApiError(httpStatus.NOT_IMPLEMENTED, "Something went wrong.");
  } catch (err) {
    const errData = errorRes(err);
    const { message, status, data, code, issue } = errData.resData;

    logger.info(errData.resData);
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
            isFreezed: false,
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

    // Group data by outerBoxbarCodeNumber
    const groupedData = barcodedata.reduce((result, item) => {
      const outerBoxbarCodeNumber = item.outerBoxbarCodeNumber;
      if (!result[outerBoxbarCodeNumber]) {
        result[outerBoxbarCodeNumber] = [];
      }
      result[outerBoxbarCodeNumber].push(item);
      return result;
    }, {});

    // Aggregate products by productGroupId
    const aggregateProducts = (arr) => {
      return arr.reduce((acc, curr) => {
        const existingItem = acc.find(
          (item) => item.productGroupId === curr.productGroupId
        );
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          acc.push({ ...curr, quantity: 1 });
        }
        return acc;
      }, []);
    };

    // Aggregate barcodedata
    const output = aggregateProducts(barcodedata);
    console.log(output, "output");

    // Convert groupedData into an array
    const groupedArray = Object.keys(groupedData).map((key) => ({
      outerBoxbarCodeNumber: key,
      items: groupedData[key],
    }));

    // Check dispatch freeze quantity for each aggregated product
    await Promise.all(
      output.map(async (item) => {
        const productSummary = await checkDispatchFreezeQuantity(
          req.userData.companyId,
          item.wareHouseId,
          item.productGroupId,
          item.quantity
        );
        if (!productSummary.status) {
          throw new ApiError(httpStatus.OK, productSummary.msg);
        }
      })
    );

    // Update freeze quantity for each aggregated product
    await Promise.all(
      output.map(async (item) => {
        const createdData = await addRemoveFreezeQuantity(
          req.userData.companyId,
          item.wareHouseId,
          item.productGroupId,
          item.quantity,
          "REMOVE"
        );
        if (!createdData.status) {
          throw new ApiError(httpStatus.OK, createdData.msg);
        }
      })
    );

    // Process barcodedata for each barcode
    const promises = barcodedata.map(async (ele) => {
      let allOuterBoxBarcode = await barCodeService.findCount({
        outerBoxbarCodeNumber: ele?.outerBoxbarCodeNumber,
        isUsed: true,
      });

      let foundObj = groupedArray.find(
        (fele) => fele?.outerBoxbarCodeNumber === ele?.outerBoxbarCodeNumber
      );

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
            isFreezed: false,
          },
        }
      );

      // Update wtwMasterService for each wtwId
      let companyWarehouseId;
      let otherCompanyWarehouseId;

      await Promise.all(
        wtwId.map(async (wtwid) => {
          let wtwUpdatedData = await wtwMasterService.getOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(wtwid), isDeleted: false },
            { $set: { status: productStatus.dispatched } }
          );
          companyWarehouseId = wtwUpdatedData?.fromWarehouseId;
          otherCompanyWarehouseId = wtwUpdatedData?.toWarehouseId;
        })
      );

      // Fetch warehouse data after updating wtwMasterService
      const companyWarehouseData = await WarehouseService.getOneByMultiField({
        isDeleted: false,
        _id: companyWarehouseId,
      });
      const otherCompanyWarehouseData =
        await WarehouseService.getOneByMultiField({
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
            dealerId: ele.toDealerId,
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
    // Aggregate products by productGroupId
    const aggregateProducts = (arr) => {
      return arr.reduce((acc, curr) => {
        const existingItem = acc.find(
          (item) => item.productGroupId === curr.productGroupId
        );
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          acc.push({ ...curr, quantity: 1 });
        }
        return acc;
      }, []);
    };

    // Aggregate barcodedata
    const output = aggregateProducts(barcodedata);
    console.log(output, "output");

    // Update freeze quantity for each aggregated product
    await Promise.all(
      output.map(async (item) => {
        const createdData = await addRemoveAvailableQuantity(
          req.userData.companyId,
          item.wareHouseId,
          item.productGroupId,
          item.quantity,
          "REMOVE"
        );
        if (!createdData.status) {
          throw new ApiError(httpStatus.OK, createdData.msg);
        }
      })
    );

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
            dealerId: null,
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
    // Aggregate products by productGroupId
    const aggregateProducts = (arr) => {
      return arr.reduce((acc, curr) => {
        const existingItem = acc.find(
          (item) => item.productGroupId === curr.productGroupId
        );
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          acc.push({ ...curr, quantity: 1 });
        }
        return acc;
      }, []);
    };

    // Aggregate barcodedata
    const output = aggregateProducts(barcodedata);
    console.log(output, "output");

    // Update freeze quantity for each aggregated product
    await Promise.all(
      output.map(async (item) => {
        const createdData = await addRemoveAvailableQuantity(
          req.userData.companyId,
          item.dealerWareHouseId,
          item.productGroupId,
          item.quantity,
          "REMOVE"
        );
        if (!createdData.status) {
          throw new ApiError(httpStatus.OK, createdData.msg);
        }
      })
    );

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

    // Group data by outerBoxbarCodeNumber
    const groupedData = barcodedata.reduce((result, item) => {
      const outerBoxbarCodeNumber = item.outerBoxbarCodeNumber;

      if (!result[outerBoxbarCodeNumber]) {
        result[outerBoxbarCodeNumber] = [];
      }
      result[outerBoxbarCodeNumber].push(item);
      return result;
    }, {});

    // Aggregate products by productGroupId
    const aggregateProducts = (arr) => {
      return arr.reduce((acc, curr) => {
        const existingItem = acc.find(
          (item) => item.productGroupId === curr.productGroupId
        );
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          acc.push({ ...curr, quantity: 1 });
        }
        return acc;
      }, []);
    };

    // Aggregate barcodedata
    const output = aggregateProducts(barcodedata);
    console.log(output, "output");

    // Convert the grouped data into an array of objects
    const groupedArray = Object.keys(groupedData).map((key) => ({
      outerBoxbarCodeNumber: key,
      items: groupedData[key],
    }));

    // Check dispatch freeze quantity for each aggregated product
    await Promise.all(
      output.map(async (item) => {
        const productSummary = await checkDispatchFreezeQuantity(
          req.userData.companyId,
          item.wareHouseId,
          item.productGroupId,
          item.quantity
        );
        if (!productSummary.status) {
          throw new ApiError(httpStatus.OK, productSummary.msg);
        }
      })
    );

    // Update freeze quantity for each aggregated product
    await Promise.all(
      output.map(async (item) => {
        const createdData = await addRemoveFreezeQuantity(
          req.userData.companyId,
          item.wareHouseId,
          item.productGroupId,
          item.quantity,
          "REMOVE"
        );
        if (!createdData.status) {
          throw new ApiError(httpStatus.OK, createdData.msg);
        }
      })
    );

    // Process each barcode
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
            isFreezed: false,
          },
        }
      );

      // Update wtcMasterService for each wtcId
      await Promise.all(
        wtcId?.map(async (wtcid) => {
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
        })
      );

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

    // Group the barcodedata by outerBoxbarCodeNumber
    const groupedData = barcodedata.reduce((result, item) => {
      const outerBoxbarCodeNumber = item.outerBoxbarCodeNumber;
      if (!result[outerBoxbarCodeNumber]) {
        result[outerBoxbarCodeNumber] = [];
      }
      result[outerBoxbarCodeNumber].push(item);
      return result;
    }, {});

    const aggregateProducts = (arr) => {
      return arr.reduce((acc, curr) => {
        const existingItem = acc.find(
          (item) => item.productGroupId === curr.productGroupId
        );
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          acc.push({ ...curr, quantity: 1 });
        }
        return acc;
      }, []);
    };

    const output = aggregateProducts(barcodedata);
    console.log(output, "output");

    // Convert groupedData into an array
    const groupedArray = Object.keys(groupedData).map((key) => ({
      outerBoxbarCodeNumber: key,
      items: groupedData[key],
    }));

    // Process the output once outside the map loop
    await Promise.all(
      output.map(async (item) => {
        const productSummary = await checkDispatchFreezeQuantity(
          req.userData.companyId,
          item.wareHouseId,
          item.productGroupId,
          item.quantity
        );
        if (!productSummary.status) {
          throw new ApiError(httpStatus.OK, productSummary.msg);
        }
      })
    );

    await Promise.all(
      output.map(async (item) => {
        const createdData = await addRemoveFreezeQuantity(
          req.userData.companyId,
          item.wareHouseId,
          item.productGroupId,
          item.quantity,
          "REMOVE"
        );
        if (!createdData.status) {
          throw new ApiError(httpStatus.OK, createdData.msg);
        }
      })
    );

    // Process barcodedata asynchronously
    const promises = barcodedata.map(async (ele) => {
      let allOuterBoxBarcode = await barCodeService.findCount({
        outerBoxbarCodeNumber: ele?.outerBoxbarCodeNumber,
        isUsed: true,
      });

      let foundObj = groupedArray.find(
        (fele) => fele?.outerBoxbarCodeNumber === ele?.outerBoxbarCodeNumber
      );

      if (foundObj?.items?.length !== allOuterBoxBarcode) {
        await barCodeService.updateMany(
          { outerBoxbarCodeNumber: ele?.outerBoxbarCodeNumber, isUsed: true },
          { $set: { outerBoxbarCodeNumber: null } }
        );
      }

      const dataUpdated = await barCodeService.getOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(ele?._id), isUsed: true },
        {
          $set: {
            status: barcodeStatusType.wts,
            wareHouseId: null,
            isFreezed: false,
          },
        }
      );

      wtsId.forEach(async (wtsid) => {
        await wtsMasterService.getOneAndUpdate(
          { _id: new mongoose.Types.ObjectId(wtsid), isDeleted: false },
          { $set: { status: productStatus.dispatched } }
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

    await addToOrderFlow(
      updatedOrder?._id,
      updatedOrder?.orderNumber,
      "Order dispatched",
      updatedOrder.status,
      req.userData.userName
    );
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
      await addToOrderFlow(
        updatedOrder?._id,
        updatedOrder?.orderNumber,
        "Deliveryboy assigned",
        updatedOrder.status,
        req.userData.userName
      );
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

    // Aggregate barcodedata
    // Aggregate products by productGroupId
    const aggregateProducts = (arr) => {
      return arr.reduce((acc, curr) => {
        const existingItem = acc.find(
          (item) => item.productGroupId === curr.productGroupId
        );
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          acc.push({ ...curr, quantity: 1 });
        }
        return acc;
      }, []);
    };

    const output = aggregateProducts(barcodedata);
    console.log(output, "output");
    await Promise.all(
      output.map(async (item) => {
        const createdData = await addAvailableQuantity(
          req.userData.companyId,
          dealerWarehouse._id,
          item.productGroupId,
          item.quantity
        );
        if (!createdData.status) {
          throw new ApiError(httpStatus.OK, createdData.msg);
        }
      })
    );
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
