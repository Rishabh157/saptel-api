const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const courierRTOService = require("./CourierRTOService");
const orderInquiryService = require("../orderInquiry/OrderInquiryService");
const barcodeService = require("../barCode/BarCodeService");
const { searchKeys } = require("./CourierRTOSchema");
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
const {
  orderStatusEnum,
  courierRTOType,
  barcodeStatusType,
} = require("../../helper/enumUtils");
const {
  addToOrderFlow,
} = require("../orderInquiryFlow/OrderInquiryFlowHelper");
const { addToBarcodeFlow } = require("../barCodeFlow/BarCodeFlowHelper");
const XLSX = require("xlsx");
const { default: mongoose } = require("mongoose");
const {
  addReturnQuantity,
} = require("../productGroupSummary/ProductGroupSummaryHelper");

//add start
exports.add = async (req, res) => {
  try {
    const {
      shippingProvider,
      requestStatus,
      orderNumber,
      comment,
      warehouseId,
    } = req.body;

    // Check if the order already exists
    const dataExist = await courierRTOService.isExists([{ orderNumber }]);
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }

    // Helper function to fetch order data by different criteria
    const fetchOrderData = async (criteria) => {
      return await orderInquiryService?.getOneByMultiField(criteria);
    };

    // Fetch order data based on various fields
    let orderData =
      (await fetchOrderData({
        orderNumber,
        assignWarehouseId: warehouseId,
        assignDealerId: null,
        orderAssignedToCourier: shippingProvider,
      })) ||
      (await fetchOrderData({
        awbNumber: orderNumber,
        assignWarehouseId: warehouseId,
        assignDealerId: null,
        orderAssignedToCourier: shippingProvider,
      })) ||
      (await fetchOrderData({
        "barcodeData.barcode": { $in: [orderNumber] },
        assignWarehouseId: warehouseId,
        assignDealerId: null,
        orderAssignedToCourier: shippingProvider,
      }));

    if (!orderData) {
      throw new ApiError(httpStatus.OK, "Invalid Order");
    }

    const orderNumberIs = orderData?.orderNumber;

    // Create new courier RTO data
    const dataCreated = await courierRTOService.createNewData({
      ...req.body,
      orderNumber: orderNumberIs,
      companyId: req.userData.companyId,
    });

    // Helper function to update the order status
    const updateOrderStatus = async (criteria) => {
      return await orderInquiryService?.getOneAndUpdate(criteria, {
        $set: { status: orderStatusEnum.rto },
      });
    };

    // Update order status by orderNumber, awbNumber, or barcode
    const updateOrder =
      (await updateOrderStatus({ orderNumber })) ||
      (await updateOrderStatus({ awbNumber: orderNumber })) ||
      (await updateOrderStatus({ "barcodeData.barcode": orderNumber }));

    if (!updateOrder) {
      throw new ApiError(httpStatus.OK, "Order update failed");
    }

    // Add to order flow
    await addToOrderFlow(updateOrder);

    // Determine barcode status based on requestStatus
    const barcodeStatusMap = {
      [courierRTOType.fresh]: barcodeStatusType.atWarehouse,
      [courierRTOType.damage]: barcodeStatusType.damage,
      [courierRTOType.fake]: barcodeStatusType.fake,
      [courierRTOType.lost]: barcodeStatusType.missing,
    };
    const barcodeStatus = barcodeStatusMap[requestStatus] || "";
    const isUsedFresh = requestStatus === courierRTOType.fresh;

    // Update barcode data in parallel
    await Promise.all(
      updateOrder?.barcodeData?.map(async (ele) => {
        const updatedBarcode = await barcodeService?.getOneAndUpdate(
          { barcodeNumber: ele?.barcode },
          { $set: { status: barcodeStatus, isUsedFresh } }
        );
        await addToBarcodeFlow(
          updatedBarcode,
          `Barcode returned from Customer, Barcode status is: ${barcodeStatus}`
        );
      })
    );

    // Update scheme products quantities in parallel
    await Promise.all(
      updateOrder?.schemeProducts?.map(async (ele) => {
        await addReturnQuantity(
          req.userData.companyId,
          updateOrder?.assignWarehouseId,
          ele?.productGroupId,
          ele?.productQuantity,
          requestStatus,
          null
        );
      })
    );

    // Send success response
    if (dataCreated) {
      return res.status(httpStatus.CREATED).send({
        message: "Added successfully.",
        data: dataCreated,
        status: true,
        code: null,
        issue: null,
      });
    } else {
      throw new ApiError(httpStatus.NOT_IMPLEMENTED, "Something went wrong.");
    }
  } catch (err) {
    const errData = errorRes(err);
    const { message, status, data, code, issue } = errData.resData;
    logger.info(errData.resData);
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
    const { companyId } = req.userData;

    // Read the Excel file
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Extract AWB numbers and other data
    const courierRTOData = sheet.map((row) => ({
      shippingProvider: row.shippingProvider,
      requestStatus: row.requestStatus,
      orderNumber: row.orderNumber,
      comment: row.comment || "",
      companyId,
      warehouseId,
    }));

    // Check for duplicates and create new data
    const createdData = [];
    for (const data of courierRTOData) {
      const dataExist = await courierRTOService.isExists([
        { orderNumber: data.orderNumber },
      ]);
      if (dataExist.exists && dataExist.existsSummary) {
        throw new ApiError(
          httpStatus.CONFLICT,
          `Request with order number ${data.orderNumber} already exists`
        );
      }
      const isOrderExists = await orderInquiryService.getOneByMultiField({
        orderNumber: data.orderNumber,
        assignWarehouseId: warehouseId,
        assignDealerId: null,
      });
      if (!isOrderExists) {
        throw new ApiError(
          httpStatus.NOT_IMPLEMENTED,
          `Invalid order number ${data.orderNumber}`
        );
      }

      const dataCreated = await courierRTOService.createNewData(data);
      if (!dataCreated) {
        throw new ApiError(
          httpStatus.NOT_IMPLEMENTED,
          `Something went wrong with order number ${data.orderNumber}.`
        );
      }
      createdData.push(dataCreated);

      const updateOrder = await orderInquiryService.getOneAndUpdate(
        {
          orderNumber: data.orderNumber,
          assignWarehouseId: warehouseId,
        },
        { $set: { status: orderStatusEnum.rto } }
      );
      if (updateOrder) {
        await addToOrderFlow(updateOrder);
      }

      let barcodeStatus;
      switch (data.requestStatus) {
        case courierRTOType.fresh:
          barcodeStatus = barcodeStatusType.atWarehouse;
          break;
        case courierRTOType.damage:
          barcodeStatus = barcodeStatusType.damage;
          break;
        case courierRTOType.fake:
          barcodeStatus = barcodeStatusType.fake;
          break;
        case courierRTOType.lost:
          barcodeStatus = barcodeStatusType.missing;
          break;
        default:
          barcodeStatus = barcodeStatusType.unknown; // Assuming there's an unknown status, adjust if necessary
      }

      if (updateOrder?.barcodeData) {
        for (const ele of updateOrder.barcodeData) {
          const updatedBarcode = await barcodeService.getOneAndUpdate(
            { barcodeNumber: ele?.barcode },
            { $set: { status: barcodeStatus } }
          );
          if (updatedBarcode) {
            await addToBarcodeFlow(
              updatedBarcode,
              `Barcode returned from Customer, Barcode status is: ${barcodeStatus}`
            );
          }
        }
      }
    }

    res.status(httpStatus.CREATED).send({
      message: "Added successfully.",
      data: createdData,
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

exports.courierReturn = async (req, res) => {
  try {
    var dateFilter = req.body.dateFilter;
    var warehouseId = req.params.wid;
    let allowedDateFiletrKeys = ["createdAt", "updatedAt"];

    const datefilterQuery = await getDateFilterQuery(
      dateFilter,
      allowedDateFiletrKeys
    );

    let additionalQuery = [
      {
        $match: {
          ...datefilterQuery[0],
          warehouseId: new mongoose.Types.ObjectId(warehouseId),
        },
      },
      {
        $group: {
          _id: null, // We don't need to group by any specific field
          totalShipyaariRequest: {
            $sum: {
              $cond: [{ $eq: ["$shippingProvider", "SHIPYAARI"] }, 1, 0],
            },
          },
          totalGPORequest: {
            $sum: {
              $cond: [{ $eq: ["$shippingProvider", "GPO"] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0, // Exclude the _id field
          totalShipyaariRequest: 1, // Include the totalShipyaariRequest field
          totalGPORequest: 1, // Include the totalGPORequest field
        },
      },
    ];

    // Execute the aggregation query
    const results = await courierRTOService.aggregateQuery(additionalQuery);

    if (!results || !results?.length) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successfull.",
        status: true,
        data: results[0],
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
//update start
exports.update = async (req, res) => {
  try {
    let { shippingProvider, requestStatus, orderNumber, companyId, comment } =
      req.body;

    let idToBeSearch = req.params.id;
    let dataExist = await courierRTOService.isExists(
      [{ orderNumber }],
      idToBeSearch
    );
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }
    //------------------Find data-------------------
    let datafound = await courierRTOService.getOneByMultiField({
      _id: idToBeSearch,
    });
    if (!datafound) {
      throw new ApiError(httpStatus.OK, `CourierRTO not found.`);
    }

    let dataUpdated = await courierRTOService.getOneAndUpdate(
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
    let numberFileds = [];
    let objectIdFields = ["companyId", "warehouseId"];
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
    let dataFound = await courierRTOService.aggregateQuery(finalAggregateQuery);
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

    let result = await courierRTOService.aggregateQuery(finalAggregateQuery);
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
//get api
exports.get = async (req, res) => {
  try {
    //if no default query then pass {}
    let matchQuery = { isDeleted: false };
    if (req.query && Object.keys(req.query).length) {
      matchQuery = getQuery(matchQuery, req.query);
    }

    let dataExist = await courierRTOService.findAllWithQuery(matchQuery);

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
    let idToBeSearch = req.params.id;
    let dataExist = await courierRTOService.getOneByMultiField({
      _id: idToBeSearch,
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
    let _id = req.params.id;
    if (!(await courierRTOService.getOneByMultiField({ _id }))) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let deleted = await courierRTOService.getOneAndDelete({ _id });
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
    const { id: _id } = req.params;
    const { requestStatus, currentStatus } = req.body;

    // Check if data exists
    const dataExist = await courierRTOService.getOneByMultiField({ _id });
    if (!dataExist) {
      throw new ApiError(httpStatus.NOT_FOUND, "Data not found.");
    }

    // Update the request status
    const statusChanged = await courierRTOService.getOneAndUpdate(
      { _id },
      { requestStatus }
    );
    if (!statusChanged) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Something went wrong."
      );
    }

    // Fetch the associated order data
    const orderData = await orderInquiryService.getOneByMultiField({
      orderNumber: statusChanged.orderNumber,
    });
    if (!orderData || !orderData.barcodeData) {
      throw new ApiError(httpStatus.NOT_FOUND, "Order data not found.");
    }

    // Helper function to check barcode status validity
    const checkBarcodesInWarehouse = async () => {
      const barcodeNumbers = orderData.barcodeData.map((ele) => ele.barcode);
      const barcodes = await barcodeService.findAllWithQuery({
        barcodeNumber: { $in: barcodeNumbers },
        status: {
          $in: [
            barcodeStatusType.atWarehouse,
            barcodeStatusType.damage,
            barcodeStatusType.missing,
            barcodeStatusType.fake,
          ],
        },
      });

      if (barcodes.length !== orderData.barcodeData.length) {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          "One or more barcodes not present in the warehouse."
        );
      }
    };

    await checkBarcodesInWarehouse();

    // Determine the barcode status and freshness
    const barcodeStatusMap = {
      [courierRTOType.fresh]: barcodeStatusType.atWarehouse,
      [courierRTOType.damage]: barcodeStatusType.damage,
      [courierRTOType.fake]: barcodeStatusType.fake,
      [courierRTOType.lost]: barcodeStatusType.missing,
    };
    const barcodeStatus =
      barcodeStatusMap[requestStatus] || barcodeStatusType.unknown;
    const isUsedFresh = requestStatus === courierRTOType.fresh;

    // Helper function to update barcodes
    const updateBarcodes = async () => {
      const barcodeUpdates = orderData.barcodeData.map(async (ele) => {
        const updatedBarcode = await barcodeService.getOneAndUpdate(
          { barcodeNumber: ele.barcode },
          { $set: { status: barcodeStatus, isUsedFresh } }
        );
        if (updatedBarcode) {
          await addToBarcodeFlow(
            updatedBarcode,
            `Barcode status marked incorrect, Correct Barcode status is: ${barcodeStatus}`
          );
        }
      });
      await Promise.all(barcodeUpdates);
    };

    await updateBarcodes();

    // Update scheme products in parallel
    await Promise.all(
      orderData.schemeProducts.map(async (ele) => {
        await addReturnQuantity(
          req.userData.companyId,
          orderData.assignWarehouseId,
          ele.productGroupId,
          ele.productQuantity,
          requestStatus,
          currentStatus
        );
      })
    );

    return res.status(httpStatus.OK).send({
      message: "Successful.",
      status: true,
      data: statusChanged,
      code: null,
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
