const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const webLeadsService = require("./WebLeadsService");
const webLeadsErrorSchema = require("./webLeadsErrorLog/WebLeadErrorLogSchema");
const { searchKeys } = require("./WebLeadsSchema");
const WebLeads = require("./WebLeadsSchema");
const { errorRes } = require("../../../utils/resError");
const {
  getUserRoleData,
  getFieldsToDisplay,
  getAllowedField,
} = require("../../helper/utils");
const companyService = require("../company/CompanyService");
const websiteMasterService = require("../websiteMaster/WebsiteMasterService");
const moment = require("moment");
const { Parser } = require("json2csv");
const fs = require("fs");
const path = require("path");

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
const {
  moduleType,
  actionType,
  webLeadStatusEnum,
  webLeadPaymentMode,
} = require("../../helper/enumUtils");

//add start
exports.add = async (req, res) => {
  const {
    phone,
    product_name,
    idtag,
    leadStatus,
    webLeadApiKey,
    companyCode,
    name,
  } = req.body;
  try {
    if (webLeadApiKey !== config.webleadApiKey) {
      throw new ApiError(httpStatus.NOT_IMPLEMENTED, `Invalid API KEY`);
    }
    let isPrepaidOrder = leadStatus === webLeadStatusEnum.prepaidOrder;
    const createdAt = new Date().toISOString().slice(0, 10);

    // get companyid
    let comapnydata = await companyService?.getOneByMultiField({ companyCode });
    if (!comapnydata) {
      throw new ApiError(httpStatus.NOT_FOUND, `Invalid Company`);
    }
    // Upsert (update or insert) the data based on the phone number
    let dataFound = await webLeadsService?.getOneByMultiField({
      phone,
      product_name,
      idtag,
      leadStatus: "PENDING",
      createdAt: {
        $gte: new Date(`${moment().startOf("day")}`),
        $lte: new Date(`${moment().endOf("day")}`),
      },
    });
    let dataUpdated;
    let isAdded = true;
    if (!dataFound && !isPrepaidOrder) {
      dataUpdated = await webLeadsService.createNewData({
        ...req.body,
        companyId: comapnydata?._id,
      });
    } else {
      isAdded = false;
      dataUpdated = await webLeadsService.getOneAndUpdate(
        {
          phone,
        },
        {
          $set: {
            ...req.body,
            companyId: comapnydata?._id,
          },
        }
      );
    }

    if (dataUpdated) {
      const message = isAdded ? "Added successfully." : "Updated successfully.";
      const code = isAdded ? "CREATED" : "UPDATED";
      return res.status(isAdded ? httpStatus.CREATED : httpStatus.OK).send({
        message,
        data: dataUpdated,
        status: true,
        code,
        issue: null,
      });
    } else {
      throw new ApiError(httpStatus.NOT_IMPLEMENTED, `Something went wrong.`);
    }
  } catch (err) {
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    console.log(name, phone, product_name, message);
    await webLeadsErrorSchema.create({
      name: name,
      phone: phone,
      product_name: product_name,
      response: message,
    });
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue });
  }
};
//update start
exports.update = async (req, res) => {
  try {
    let { pageUrl, pageName, headerSpace, footerSpace, companyId, websiteId } =
      req.body;

    let idToBeSearch = req.params.id;
    let dataExist = await webLeadsService.isExists(
      [{ pageUrl }, { pageName }],
      idToBeSearch
    );
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }
    const isCompanyExists = await companyService.findCount({
      _id: companyId,
      isDeleted: false,
    });
    if (!isCompanyExists) {
      throw new ApiError(httpStatus.OK, "Invalid Company");
    }
    const isWebsiteExists = await websiteMasterService.findCount({
      _id: websiteId,
      isDeleted: false,
    });
    if (!isWebsiteExists) {
      throw new ApiError(httpStatus.OK, "Invalid Website");
    }
    //------------------Find data-------------------
    let datafound = await webLeadsService.getOneByMultiField({
      _id: idToBeSearch,
    });
    if (!datafound) {
      throw new ApiError(httpStatus.OK, `WebsitePage not found.`);
    }

    let dataUpdated = await webLeadsService.getOneAndUpdate(
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

//check payment status ccavenue

exports.checkPaymentCCavenue = async (req, res) => {
  try {
    let { transactionId } = req.params;
    const encRequest = `order_no=${transactionId}`;

    // Encrypt the request data
    const encryptedData = CryptoJS.AES.encrypt(
      encRequest,
      config.workingKey
    ).toString();

    // CCAvenue Verify Payment API URL
    const url = config.ccAvenueUrl;

    // Make the API request
    const response = await axios.post(url, {
      enc_request: encryptedData,
      access_code: config.accessCode,
    });

    // Decrypt the response data
    const decryptedData = CryptoJS.AES.decrypt(
      response.data,
      config.workingKey
    ).toString(CryptoJS.enc.Utf8);

    // Parse the decrypted response
    const parsedData = JSON.parse(decryptedData);

    // return parsedData;
    return res.status(httpStatus.OK).send({
      message: "Successfully!",
      data: parsedData,
      status: true,
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
    let isPrepaid = req.body.isPrepaid;
    let isPaginationRequired = req.body.isPaginationRequired
      ? req.body.isPaginationRequired
      : true;
    let finalAggregateQuery = [];
    let matchQuery = {
      $and: [
        {
          isDeleted: false,
          companyId: new mongoose.Types.ObjectId(req?.userData.companyId),
        },
      ],
    };

    if (isPrepaid) {
      matchQuery.$and.push({
        paymentMode: {
          $in: [webLeadPaymentMode.online, webLeadPaymentMode.overseas],
        },
      });
    } else {
      matchQuery.$and.push({ paymentMode: webLeadPaymentMode.cod });
    }
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
    let objectIdFields = ["websiteId", "companyId"];

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
          from: "websitemasters",
          localField: "websiteId",
          foreignField: "_id",
          as: "websiteData",
          pipeline: [{ $project: { productName: 1 } }],
        },
      },
      {
        $addFields: {
          websiteLabel: {
            $arrayElemAt: ["$websiteData.productName", 0],
          },
        },
      },

      {
        $unset: ["websiteData"],
      },
    ];

    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    finalAggregateQuery.push({
      $match: matchQuery,
    });

    //-----------------------------------
    let dataFound = await webLeadsService.aggregateQuery(finalAggregateQuery);
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
      moduleType.websitePage,
      userRoleData,
      actionType.pagination
    );
    let result = await webLeadsService.aggregateQuery(finalAggregateQuery);
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

//get by id
exports.getById = async (req, res) => {
  try {
    let idToBeSearch = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(idToBeSearch)) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid ID format.");
    }
    let getData = await webLeadsService.getById(idToBeSearch);

    if (!getData) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successfull.",
        status: true,
        data: getData,
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

//statusChange
exports.statusChange = async (req, res) => {
  try {
    let _id = req.params.id;
    let dataExist = await webLeadsService.getOneByMultiField({ _id });
    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let isActive = dataExist.isActive ? false : true;

    let statusChanged = await webLeadsService.getOneAndUpdate(
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

//delete api
exports.deleteDocument = async (req, res) => {
  try {
    let _id = req.params.id;
    if (!(await webLeadsService.getById(_id))) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }

    let deleted = await webLeadsService.getOneAndDelete({ _id });
    if (!deleted) {
      throw new ApiError(httpStatus.OK, "Some thing went wrong.");
    }

    return res.status(httpStatus.OK).send({
      message: "deleted successfully",
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
