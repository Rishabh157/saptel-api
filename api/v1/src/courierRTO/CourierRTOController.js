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

//add start
exports.add = async (req, res) => {
  try {
    let { shippingProvider, requestStatus, orderNumber, comment, warehouseId } =
      req.body;
    /**
     * check duplicate exist
     */

    let dataExist = await courierRTOService.isExists([{ orderNumber }]);
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }

    let orderData = await orderInquiryService?.getOneByMultiField({
      orderNumber: orderNumber,
      status: orderStatusEnum.delivered,
    });
    if (!orderData) {
      throw new ApiError(httpStatus.OK, "Invaid Order number");
    }

    //------------------create data-------------------
    let dataCreated = await courierRTOService.createNewData({
      ...req.body,
      companyId: req.userData.companyId,
    });
    let updateOrder = await orderInquiryService?.getOneAndUpdate(
      { orderNumber: orderNumber },
      {
        $set: {
          status: orderStatusEnum.rto,
        },
      }
    );
    await addToOrderFlow(updateOrder);
    let barcodeStatus = "";
    if (requestStatus === courierRTOType.fresh) {
      barcodeStatus = barcodeStatusType.atWarehouse;
    } else if (requestStatus === courierRTOType.damage) {
      barcodeStatus = barcodeStatusType.damage;
    } else if (
      requestStatus === courierRTOType.fake ||
      requestStatus === courierRTOType.lost
    ) {
      barcodeStatus = barcodeStatusType.missing;
    }

    updateOrder?.barcodeData?.map(async (ele) => {
      let updatedBarcode = await barcodeService?.getOneAndUpdate(
        { barcodeNumber: ele?.barcode },
        {
          $set: {
            status: barcodeStatus,
          },
        }
      );
      await addToBarcodeFlow(updatedBarcode);
    });

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

      const dataCreated = await courierRTOService.createNewData(data);
      if (!dataCreated) {
        throw new ApiError(
          httpStatus.NOT_IMPLEMENTED,
          `Something went wrong with order number ${data.orderNumber}.`
        );
      }
      createdData.push(dataCreated);

      const updateOrder = await orderInquiryService.getOneAndUpdate(
        { orderNumber: data.orderNumber },
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
            await addToBarcodeFlow(updatedBarcode);
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
    const _id = req.params.id;
    const requestStatus = req.body.requestStatus;

    const dataExist = await courierRTOService.getOneByMultiField({ _id });
    if (!dataExist) {
      throw new ApiError(httpStatus.NOT_FOUND, "Data not found.");
    }

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

    const orderdata = await orderInquiryService.getOneByMultiField({
      orderNumber: statusChanged.orderNumber,
    });

    if (orderdata && orderdata.barcodeData) {
      for (const ele of orderdata.barcodeData) {
        const barcodeData = await barcodeService.getOneByMultiField({
          barcodeNumber: ele.barcode,
          status: {
            $in: [
              barcodeStatusType.atWarehouse,
              barcodeStatusType.damage,
              barcodeStatusType.missing,
            ],
          },
        });

        if (!barcodeData) {
          throw new ApiError(
            httpStatus.NOT_FOUND,
            "Barcode not present in warehouse."
          );
        }
      }
    }

    let barcodeStatus;
    switch (requestStatus) {
      case courierRTOType.fresh:
        barcodeStatus = barcodeStatusType.atWarehouse;
        break;
      case courierRTOType.damage:
        barcodeStatus = barcodeStatusType.damage;
        break;
      case courierRTOType.fake:
      case courierRTOType.lost:
        barcodeStatus = barcodeStatusType.missing;
        break;
      default:
        barcodeStatus = barcodeStatusType.unknown; // Assuming there's an unknown status, adjust if necessary
    }

    if (orderdata && orderdata.barcodeData) {
      for (const ele of orderdata.barcodeData) {
        const updatedBarcode = await barcodeService.getOneAndUpdate(
          { barcodeNumber: ele.barcode },
          {
            $set: { status: barcodeStatus },
          }
        );

        if (updatedBarcode) {
          await addToBarcodeFlow(updatedBarcode);
        }
      }
    }

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
