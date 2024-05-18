const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const orderCancelRequestService = require("./OrderCancelRequestService");
const orderService = require("../orderInquiry/OrderInquiryService");
const barcodeService = require("../barCode/BarCodeService");

const { searchKeys } = require("./OrderCancelRequestSchema");
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
  barcodeStatusType,
  productStatus,
} = require("../../helper/enumUtils");
const {
  addToOrderFlow,
} = require("../orderInquiryFlow/OrderInquiryFlowHelper");
const { addToBarcodeFlow } = require("../barCodeFlow/BarCodeFlowHelper");

//add start
exports.add = async (req, res) => {
  try {
    let { orderNumber } = req.body;
    /**
     * check duplicate exist
     */

    let orderExist = await orderService.getOneByMultiField({
      orderNumber: parseInt(orderNumber),
      isDeleted: false,
      status: {
        $nin: [
          orderStatusEnum.delivered,
          orderStatusEnum.doorCancelled,
          orderStatusEnum.cancel,
          orderStatusEnum.rto,
        ],
      },
    });

    if (!orderExist) {
      throw new ApiError(httpStatus.OK, "Invalid order number");
    }
    let dataExist = await orderCancelRequestService.isExists([{ orderNumber }]);
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }
    //------------------create data-------------------
    let dataCreated = await orderCancelRequestService.createNewData({
      ...req.body,
      companyId: req.userData.companyId,
      requestCreatedBy: req.userData.Id,
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

//update start
exports.update = async (req, res) => {
  try {
    let {
      orderNumber,
      cancelReason,
      remark,
      requestCreatedBy,
      cancelDate,
      companyId,
    } = req.body;

    let orderExist = await orderService.getOneByMultiField({
      orderNumber: parseInt(orderNumber),
      isDeleted: false,
      status: {
        $nin: [
          orderStatusEnum.delivered,
          orderStatusEnum.doorCancelled,
          orderStatusEnum.cancel,
          orderStatusEnum.rto,
        ],
      },
    });

    if (!orderExist) {
      throw new ApiError(httpStatus.OK, "Invalid order number");
    }
    let idToBeSearch = req.params.id;
    let dataExist = await orderCancelRequestService.isExists(
      [{ orderNumber }],
      idToBeSearch
    );
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }
    //------------------Find data-------------------
    let datafound = await orderCancelRequestService.getOneByMultiField({
      _id: idToBeSearch,
    });
    if (!datafound) {
      throw new ApiError(httpStatus.OK, `OrderCancelRequest not found.`);
    }

    let dataUpdated = await orderCancelRequestService.getOneAndUpdate(
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

// cancel order

exports.cancelOrder = async (req, res) => {
  try {
    let ordernumber = req.params.ordernumber;
    let cancelRequestId = req.params.cancelRequestId;

    let additionalQuery = [
      {
        $match: {
          orderNumber: parseInt(ordernumber),
          isDeleted: false,
          status: {
            $nin: [
              orderStatusEnum.delivered,
              orderStatusEnum.doorCancelled,
              orderStatusEnum.cancel,
              orderStatusEnum.rto,
            ],
          },
        },
      },
    ];

    let dataExist = await orderService.aggregateQuery(additionalQuery);

    if (!dataExist[0]) {
      throw new ApiError(httpStatus.OK, "Invalid order number");
    }
    let orderBarcode = dataExist[0]?.barcodeData;

    if (orderBarcode?.length) {
      await Promise.all(
        orderBarcode.map(async (ele) => {
          let updatedBarcode = await barcodeService.getOneAndUpdate(
            { _id: ele?.barcodeId, isDeleted: false, isUsed: true },
            {
              $set: {
                status: barcodeStatusType.atWarehouse,
              },
            }
          );
          await addToBarcodeFlow(updatedBarcode);
        })
      );
    }

    let updatedOrder = await orderService.getOneAndUpdate(
      {
        orderNumber: parseInt(ordernumber),
        isDeleted: false,
        status: {
          $nin: [
            orderStatusEnum.delivered,
            orderStatusEnum.doorCancelled,
            orderStatusEnum.cancel,
            orderStatusEnum.rto,
          ],
        },
      },
      {
        $set: {
          status: orderStatusEnum.cancel,
          orderStatus: productStatus.cancelled,
          barcodeData: [],
          schemeProducts: [],
        },
      }
    );

    await addToOrderFlow(updatedOrder);
    await orderCancelRequestService.getOneAndUpdate(
      { _id: cancelRequestId },
      { $set: { status: "COMPLETED", cancelDate: new Date() } }
    );
    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      status: true,
      data: dataExist[0],
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
    let objectIdFields = ["requestCreatedBy", "companyId"];
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
          as: "userData",
          pipeline: [
            {
              $project: {
                firstName: 1,
                lastName: 1,
              },
            },
          ],
        },
      },

      {
        $addFields: {
          requestCreatedByLabel: {
            $concat: [
              { $arrayElemAt: ["$userData.firstName", 0] },
              " ",
              { $arrayElemAt: ["$userData.lastName", 0] },
            ],
          },
        },
      },
      {
        $unset: ["userData"],
      },
    ];

    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    finalAggregateQuery.push({
      $match: matchQuery,
    });

    //-----------------------------------
    let dataFound = await orderCancelRequestService.aggregateQuery(
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

    let result = await orderCancelRequestService.aggregateQuery(
      finalAggregateQuery
    );
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

    let dataExist = await orderCancelRequestService.findAllWithQuery(
      matchQuery
    );

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
    let dataExist = await orderCancelRequestService.getOneByMultiField({
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
    if (!(await orderCancelRequestService.getOneByMultiField({ _id }))) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let deleted = await orderCancelRequestService.getOneAndDelete({ _id });
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
