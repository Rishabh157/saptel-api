const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const dealerPincodeService = require("./DealerPincodeService");
const companyService = require("../company/CompanyService");
const dealerService = require("../dealer/DealerService");
const tehsilService = require("../tehsil/TehsilService");
const DealerScheme = require("../dealerScheme/DealerSchemeSchema");

const { searchKeys } = require("./DealerPincodeSchema");
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
const { isCancel } = require("axios");
const { default: mongoose } = require("mongoose");

//add start
exports.add = async (req, res) => {
  try {
    let { dealerId, pincodeDetail } = req.body;
    /**
     * check duplicate exist
     */

    const isCompanyExists = await companyService.findCount({
      _id: req.userData.companyId,
      isDeleted: false,
    });
    if (!isCompanyExists) {
      throw new ApiError(httpStatus.OK, "Invalid Company");
    }

    const isDealerExists = await dealerService.findCount({
      _id: dealerId,
      isDeleted: false,
    });
    if (!isDealerExists) {
      throw new ApiError(httpStatus.OK, "Invalid dealer");
    }
    // const isTehsilExists = await tehsilService.findCount({
    //   _id: tehsilId,
    //   isDeleted: false,
    // });
    // if (!isTehsilExists) {
    //   throw new ApiError(httpStatus.OK, "Invalid Tehsil");
    // }
    let output = [];
    pincodeDetail.map((ele) => {
      ele?.pincode?.map((pin) => {
        output = [
          ...output,
          {
            dealerId: dealerId,
            districtId: ele?.districtId,
            pincode: pin,
            estTime: ele?.estTime,
            companyId: req.userData.companyId,
            tehsilId: ele?.tehsilId,
          },
        ];
      });
    });
    let isValidPincode = false;
    await Promise.all(
      output?.map(async (ele) => {
        let pincode = ele?.pincode;
        let dealerId = ele?.dealerId;

        let dataExist = await dealerPincodeService.isExists(
          [{ pincode }, { dealerId }],
          false,
          true
        );
        if (dataExist.exists && dataExist.existsSummary) {
          isValidPincode = true;
          return;
        }
      })
    );
    if (isValidPincode) {
      throw new ApiError(
        httpStatus.OK,
        "Pincode already exists with this dealer"
      );
    }
    //------------------create data-------------------
    let dataCreated = await dealerPincodeService.createMany(output);

    //------------------create data-------------------

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
    let { dealerId } = req.body;

    let idToBeSearch = req.params.id;

    const isCompanyExists = await companyService.findCount({
      _id: req.userData.companyId,
      isDeleted: false,
    });
    if (!isCompanyExists) {
      throw new ApiError(httpStatus.OK, "Invalid Company");
    }

    const isDealerExists = await dealerService.findCount({
      _id: dealerId,
      isDeleted: false,
    });
    if (!isDealerExists) {
      throw new ApiError(httpStatus.OK, "Invalid dealer");
    }

    //------------------Find data-------------------
    let datafound = await dealerPincodeService.getOneByMultiField({
      _id: idToBeSearch,
    });
    if (!datafound) {
      throw new ApiError(httpStatus.OK, `DealerPincode not found.`);
    }

    let dataUpdated = await dealerPincodeService.getOneAndUpdate(
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
    let objectIdFields = ["dealerId", "companyId"];

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
          from: "districts",
          localField: "districtId",
          foreignField: "_id",
          as: "district_name",
        },
      },
      {
        $addFields: {
          districtLabel: {
            $arrayElemAt: ["$district_name.districtName", 0],
          },
        },
      },
      {
        $unset: ["district_name"],
      },
    ];

    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    finalAggregateQuery.push({
      $match: matchQuery,
    });

    //-----------------------------------
    let dataFound = await dealerPincodeService.aggregateQuery(
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

    let result = await dealerPincodeService.aggregateQuery(finalAggregateQuery);
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
      companyId: companyId,
      isDeleted: false,
      isActive: true,
    };
    if (req.query && Object.keys(req.query).length) {
      matchQuery = getQuery(matchQuery, req.query);
    }
    let additionalQuery = [
      { $match: matchQuery },
      {
        $lookup: {
          from: "districts",
          localField: "districtId",
          foreignField: "_id",
          as: "district_name",
        },
      },
      {
        $addFields: {
          districtLabel: {
            $arrayElemAt: ["$district_name.districtName", 0],
          },
        },
      },
      {
        $unset: ["district_name"],
      },
    ];

    let dataExist = await dealerPincodeService.aggregateQuery(additionalQuery);

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
          from: "districts",
          localField: "districtId",
          foreignField: "_id",
          as: "district_name",
        },
      },
      {
        $addFields: {
          districtLabel: {
            $arrayElemAt: ["$district_name.districtName", 0],
          },
        },
      },
      {
        $unset: ["district_name"],
      },
    ];

    let dataExist = await dealerPincodeService.aggregateQuery(additionalQuery);

    if (!dataExist?.length) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successfull.",
        status: true,
        data: dataExist[0],
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
exports.getByPincode = async (req, res) => {
  try {
    let companyId = req.params.companyid;
    let pincode = req.params.pincode;

    //if no default query then pass {}
    let matchQuery = {
      companyId: companyId,
      pincode: pincode,
      isDeleted: false,
      isActive: true,
    };
    if (req.query && Object.keys(req.query).length) {
      matchQuery = getQuery(matchQuery, req.query);
    }

    let dataExist = await dealerPincodeService.findAllWithQuery(matchQuery);

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
//get all dealer
exports.getDealerPincode = async (req, res) => {
  try {
    let tehsilid = req.body.tehsilid;
    let dealerId = req.params.dealerid;

    //if no default query then pass {}
    let matchQuery = {
      companyId: req.userData.companyId,
      dealerId: dealerId,
      isDeleted: false,
      isActive: true,
    };
    if (tehsilid) {
      matchQuery.tehsilId = tehsilid;
    }
    if (req.query && Object.keys(req.query).length) {
      matchQuery = getQuery(matchQuery, req.query);
    }

    let dataExist = await dealerPincodeService.findAllWithQuery(matchQuery);

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
    let pincode = req.params.pincode;

    if (!(await dealerPincodeService.getOneByMultiField({ _id }))) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    const pincodesToUpdate = await DealerScheme.find({
      pincodes: pincode,
    });
    const updateOperations = pincodesToUpdate.map((dealerScheme) => ({
      updateOne: {
        filter: { _id: dealerScheme._id },
        update: {
          $pull: { pincodes: pincode },
        },
      },
    }));
    await DealerScheme.bulkWrite(updateOperations);

    let deleted = await dealerPincodeService.getOneAndDelete({ _id });
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
    let dataExist = await dealerPincodeService.getOneByMultiField({ _id });
    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let isActive = dataExist.isActive ? false : true;

    let statusChanged = await dealerPincodeService.getOneAndUpdate(
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
