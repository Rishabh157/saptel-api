const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const mongoose = require("mongoose");
const cartonBoxBarcodeService = require("./CartonBoxBarcodeService");
const companyService = require("../company/CompanyService");
const cartonBoxService = require("../cartonBox/CartonBoxService");

const { searchKeys } = require("./CartonBoxBarcodeSchema");
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

//add start
exports.add = async (req, res) => {
  try {
    let {
      cartonBoxId,
      barcodeNumber,
      barcodeGroupNumber,
      itemBarcodeNumber,
      isUsed,
      companyId,
    } = req.body;

    /**
     * check duplicate exist
     */
    let dataExist = await cartonBoxBarcodeService.isExists([{ barcodeNumber }]);
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }

    const isCartonBoxExists = await cartonBoxService.findCount({
      _id: cartonBoxId,
      isDeleted: false,
    });
    if (!isCartonBoxExists) {
      throw new ApiError(httpStatus.OK, "Invalid carton box");
    }

    const isCompanyExists = await companyService.findCount({
      _id: companyId,
      isDeleted: false,
    });
    if (!isCompanyExists) {
      throw new ApiError(httpStatus.OK, "Invalid Company");
    }

    let lastObject = await cartonBoxBarcodeService.aggregateQuery([
      { $sort: { _id: -1 } },
      { $limit: 1 },
    ]);
    if (lastObject.length) {
      const barcodeNumber = parseInt(lastObject[0].barcodeNumber) + 1;
      const paddedBarcodeNumber = barcodeNumber.toString().padStart(6, "0");
      req.body.barcodeNumber = paddedBarcodeNumber;
    } else {
      req.body.barcodeNumber = "000001";
    }

    const output = itemBarcodeNumber.map((barcode) => {
      return {
        cartonBoxId: cartonBoxId,
        barcodeNumber: req.body.barcodeNumber,
        barcodeGroupNumber: barcodeGroupNumber,
        companyId: companyId,
        itemBarcodeNumber: barcode,
      };
    });
    //------------------create data-------------------
    let dataCreated = await cartonBoxBarcodeService.createMany(output);

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
    let { cartonBoxId, barcodeNumber, barcodeGroupNumber, isUsed, companyId } =
      req.body;

    let idToBeSearch = req.params.id;

    const isCompanyExists = await companyService.findCount({
      _id: companyId,
      isDeleted: false,
    });
    if (!isCompanyExists) {
      throw new ApiError(httpStatus.OK, "Invalid Company");
    }

    //------------------Find data-------------------
    let datafound = await cartonBoxBarcodeService.getOneByMultiField({
      _id: idToBeSearch,
    });
    if (!datafound) {
      throw new ApiError(httpStatus.OK, `CartonBoxBarcode not found.`);
    }

    let dataUpdated = await cartonBoxBarcodeService.getOneAndUpdate(
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
    let booleanFields = ["isUsed"];
    let numberFileds = [];
    let objectIdFields = ["cartonBoxId", "companyId"];

    const filterQuery = getFilterQuery(
      filterBy,
      booleanFields,
      objectIdFields,
      numberFileds
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
          from: "cartonboxes",
          localField: "cartonBoxId",
          foreignField: "_id",
          as: "carton_box",
          pipeline: [
            { $match: { isDeleted: false } },
            { $project: { boxName: 1 } },
          ],
        },
      },

      {
        $addFields: {
          cartonboxLabel: {
            $arrayElemAt: ["$carton_box.boxName", 0],
          },
        },
      },
      { $unset: ["carton_box"] },
      // {
      //   $group: {
      //     _id: "$barcodeGroupNumber",
      //     barcodes: { $push: "$productGroup" },
      //   },
      // },
      // {
      //   $project: {
      //     _id: 0,
      //     barcodeGroupNumber: "$_id.barcodeGroupNumber",
      //     productGroup: "$_id.productGroup",
      //     productGroupLabel: "$_id.productGroupLabel",
      //     count: 1,
      //   },
      // },
    ];
    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    finalAggregateQuery.push({
      $match: matchQuery,
    });

    finalAggregateQuery.push({
      $group: {
        _id: "$barcodeNumber",
        barcodeNumber: { $first: "$barcodeNumber" },
        cartonBoxId: { $first: "$cartonBoxId" },
        barcodeGroupNumber: { $first: "$barcodeGroupNumber" },
        cartonboxLabel: { $first: "$cartonboxLabel" },
        isUsed: { $first: "$isUsed" },
        count: { $sum: 1 },
        createdAt: { $first: "$createdAt" },
        companyId: { $first: "$companyId" },
      },
    });

    //-----------------------------------
    let dataFound = await cartonBoxBarcodeService.aggregateQuery(
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

    let result = await cartonBoxBarcodeService.aggregateQuery(
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
          from: "cartonboxes",
          localField: "cartonBoxId",
          foreignField: "_id",
          as: "carton_box",
          pipeline: [
            { $match: { isDeleted: false } },
            { $project: { boxName: 1 } },
          ],
        },
      },

      {
        $addFields: {
          cartonboxLabel: {
            $arrayElemAt: ["$carton_box.boxName", 0],
          },
        },
      },
      { $unset: ["carton_box"] },
      // {
      //   $group: {
      //     _id: "$barcodeGroupNumber",
      //     barcodes: { $push: "$productGroup" },
      //   },
      // },
      // {
      //   $project: {
      //     _id: 0,
      //     barcodeGroupNumber: "$_id.barcodeGroupNumber",
      //     productGroup: "$_id.productGroup",
      //     productGroupLabel: "$_id.productGroupLabel",
      //     count: 1,
      //   },
      // },
    ];

    let dataExist = await cartonBoxBarcodeService.aggregateQuery(
      additionalQuery
    );

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

//get api
exports.getByBoxId = async (req, res) => {
  try {
    //if no default query then pass {}
    let boxId = req.params.id;
    let matchQuery = { isDeleted: false, barcodeNumber: boxId };
    if (req.query && Object.keys(req.query).length) {
      matchQuery = getQuery(matchQuery, req.query);
    }
    let additionalQuery = [
      { $match: matchQuery },
      {
        $lookup: {
          from: "cartonboxes",
          localField: "cartonBoxId",
          foreignField: "_id",
          as: "carton_box",
          pipeline: [
            { $match: { isDeleted: false } },
            { $project: { boxName: 1 } },
          ],
        },
      },

      {
        $addFields: {
          cartonboxLabel: {
            $arrayElemAt: ["$carton_box.boxName", 0],
          },
        },
      },
      { $unset: ["carton_box"] },
    ];

    let dataExist = await cartonBoxBarcodeService.aggregateQuery(
      additionalQuery
    );

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
//delete api
exports.deleteDocument = async (req, res) => {
  try {
    let _id = req.params.id;
    if (!(await cartonBoxBarcodeService.getOneByMultiField({ _id }))) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let deleted = await cartonBoxBarcodeService.getOneAndDelete({ _id });
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
    let dataExist = await cartonBoxBarcodeService.getOneByMultiField({ _id });
    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let isActive = dataExist.isActive ? false : true;

    let statusChanged = await cartonBoxBarcodeService.getOneAndUpdate(
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
