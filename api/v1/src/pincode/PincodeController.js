const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const pincodeService = require("./PincodeService");
const companyService = require("../company/CompanyService");
const countryService = require("../country/CountryService");
const stateService = require("../state/StateService");
const districtService = require("../district/DistrictService");
const tehsilService = require("../tehsil/TehsilService");
const {
  checkIdInCollectionsThenDelete,
  collectionArrToMatch,
} = require("../../helper/commonHelper");

const { searchKeys } = require("./PincodeSchema");
const { errorRes } = require("../../../utils/resError");
const {
  getQuery,
  getUserRoleData,
  getFieldsToDisplay,
  getAllowedField,
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
    let { pincode, tehsilId, districtId, stateId, countryId, companyId } =
      req.body;

    const isCompanyExists = await companyService.findCount({
      _id: companyId,
      isDeleted: false,
    });
    if (!isCompanyExists) {
      throw new ApiError(httpStatus.OK, "Invalid Company");
    }

    const isCountryExists = await countryService.findCount({
      _id: countryId,
      isDeleted: false,
    });
    if (!isCountryExists) {
      throw new ApiError(httpStatus.OK, "Invalid Country");
    }

    const isStateExists = await stateService.findCount({
      _id: stateId,
      isDeleted: false,
    });
    if (!isStateExists) {
      throw new ApiError(httpStatus.OK, "Invalid State");
    }

    const isDistrictExists = await districtService.findCount({
      _id: districtId,
      isDeleted: false,
    });
    if (!isDistrictExists) {
      throw new ApiError(httpStatus.OK, "Invalid District");
    }

    const isTehsilExists = await tehsilService.findCount({
      _id: tehsilId,
      isDeleted: false,
    });
    if (!isTehsilExists) {
      throw new ApiError(httpStatus.OK, "Invalid Tehsil");
    }

    /**
     * check duplicate exist
     */
    let dataExist = await pincodeService.isExists(
      [{ pincode }, { countryId }],
      false,
      true
    );
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }
    //------------------create data-------------------
    let dataCreated = await pincodeService.createNewData({ ...req.body });

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
    let { preferredCourier, isFixed } = req.body;

    let idToBeSearch = req.params.id;

    // const isCompanyExists = await companyService.findCount({
    //   _id: companyId,
    //   isDeleted: false,
    // });
    // if (!isCompanyExists) {
    //   throw new ApiError(httpStatus.OK, "Invalid Company");
    // }

    // const isCountryExists = await countryService.findCount({
    //   _id: countryId,
    //   isDeleted: false,
    // });
    // if (!isCountryExists) {
    //   throw new ApiError(httpStatus.OK, "Invalid Country");
    // }

    // const isStateExists = await stateService.findCount({
    //   _id: stateId,
    //   isDeleted: false,
    // });
    // if (!isStateExists) {
    //   throw new ApiError(httpStatus.OK, "Invalid State");
    // }

    // const isDistrictExists = await districtService.findCount({
    //   _id: districtId,
    //   isDeleted: false,
    // });
    // if (!isDistrictExists) {
    //   throw new ApiError(httpStatus.OK, "Invalid State");
    // }

    // const isTehsilExists = await tehsilService.findCount({
    //   _id: tehsilId,
    //   isDeleted: false,
    // });
    // if (!isTehsilExists) {
    //   throw new ApiError(httpStatus.OK, "Invalid State");
    // }

    //------------------Find data-------------------
    let datafound = await pincodeService.getOneByMultiField({
      _id: idToBeSearch,
    });
    if (!datafound) {
      throw new ApiError(httpStatus.OK, `Pincode not found.`);
    }

    let dataUpdated = await pincodeService.getOneAndUpdate(
      {
        _id: idToBeSearch,
        isDeleted: false,
      },
      {
        $set: {
          preferredCourier,
          isFixed,
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
    let objectIdFileds = [
      "tehsilId",
      "districtId",
      "stateId",
      "countryId",
      "companyId",
    ];

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
          from: "countries",
          localField: "countryId",
          foreignField: "_id",
          as: "country_name",
          pipeline: [{ $project: { countryName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "states",
          localField: "stateId",
          foreignField: "_id",
          as: "state_name",
          pipeline: [{ $project: { stateName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "districts",
          localField: "districtId",
          foreignField: "_id",
          as: "district_name",
          pipeline: [{ $project: { districtName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "pincodes",
          localField: "pincodeId",
          foreignField: "_id",
          as: "pincode_name",
          pipeline: [{ $project: { pincode: 1 } }],
        },
      },
      {
        $lookup: {
          from: "tehsils",
          localField: "tehsilId",
          foreignField: "_id",
          as: "tehsil_name",
          pipeline: [{ $project: { tehsilName: 1 } }],
        },
      },
      {
        $addFields: {
          CountryLable: {
            $arrayElemAt: ["$country_name.countryName", 0],
          },
          StateLable: {
            $arrayElemAt: ["$state_name.stateName", 0],
          },
          DistrictLable: {
            $arrayElemAt: ["$district_name.districtName", 0],
          },
          PincodeLable: {
            $arrayElemAt: ["$pincode_name.pincode", 0],
          },
          tehsilLable: {
            $arrayElemAt: ["$tehsil_name.tehsilName", 0],
          },
        },
      },
      {
        $unset: [
          "country_name",
          "state_name",
          "district_name",
          "pincode_name",
          "tehsil_name",
        ],
      },
    ];

    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    finalAggregateQuery.push({
      $match: matchQuery,
    });

    //-----------------------------------
    let dataFound = await pincodeService.aggregateQuery(finalAggregateQuery);
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
      moduleType.pincode,
      userRoleData,
      actionType.pagination
    );
    let result = await pincodeService.aggregateQuery(finalAggregateQuery);
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
          from: "countries",
          localField: "countryId",
          foreignField: "_id",
          as: "country_name",
          pipeline: [{ $project: { countryName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "states",
          localField: "stateId",
          foreignField: "_id",
          as: "state_name",
          pipeline: [{ $project: { stateName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "districts",
          localField: "districtId",
          foreignField: "_id",
          as: "district_name",
          pipeline: [{ $project: { districtName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "pincodes",
          localField: "pincodeId",
          foreignField: "_id",
          as: "pincode_name",
          pipeline: [{ $project: { pincode: 1 } }],
        },
      },
      {
        $lookup: {
          from: "tehsils",
          localField: "tehsilId",
          foreignField: "_id",
          as: "tehsil_name",
          pipeline: [{ $project: { tehsilName: 1 } }],
        },
      },
      {
        $addFields: {
          CountryLable: {
            $arrayElemAt: ["$country_name.countryName", 0],
          },
          StateLable: {
            $arrayElemAt: ["$state_name.stateName", 0],
          },
          DistrictLable: {
            $arrayElemAt: ["$district_name.districtName", 0],
          },
          PincodeLable: {
            $arrayElemAt: ["$pincode_name.pincode", 0],
          },
          tehsilLable: {
            $arrayElemAt: ["$tehsil_name.tehsilName", 0],
          },
        },
      },
      {
        $unset: [
          "country_name",
          "state_name",
          "district_name",
          "pincode_name",
          "tehsil_name",
        ],
      },
    ];

    let userRoleData = await getUserRoleData(req);
    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.pincode,
      userRoleData,
      actionType.listAll
    );
    let dataExist = await pincodeService.aggregateQuery(additionalQuery);
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
          from: "countries",
          localField: "countryId",
          foreignField: "_id",
          as: "country_name",
          pipeline: [{ $project: { countryName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "states",
          localField: "stateId",
          foreignField: "_id",
          as: "state_name",
          pipeline: [{ $project: { stateName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "districts",
          localField: "districtId",
          foreignField: "_id",
          as: "district_name",
          pipeline: [{ $project: { districtName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "pincodes",
          localField: "pincodeId",
          foreignField: "_id",
          as: "pincode_name",
          pipeline: [{ $project: { pincode: 1 } }],
        },
      },
      {
        $lookup: {
          from: "tehsils",
          localField: "tehsilId",
          foreignField: "_id",
          as: "tehsil_name",
          pipeline: [{ $project: { tehsilName: 1 } }],
        },
      },
      {
        $addFields: {
          CountryLable: {
            $arrayElemAt: ["$country_name.countryName", 0],
          },
          StateLable: {
            $arrayElemAt: ["$state_name.stateName", 0],
          },
          DistrictLable: {
            $arrayElemAt: ["$district_name.districtName", 0],
          },
          PincodeLable: {
            $arrayElemAt: ["$pincode_name.pincode", 0],
          },
          tehsilLable: {
            $arrayElemAt: ["$tehsil_name.tehsilName", 0],
          },
        },
      },
      {
        $unset: [
          "country_name",
          "state_name",
          "district_name",
          "pincode_name",
          "tehsil_name",
        ],
      },
    ];

    let userRoleData = await getUserRoleData(req);
    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.pincode,
      userRoleData,
      actionType.view
    );
    let dataExist = await pincodeService.aggregateQuery(additionalQuery);
    let allowedFields = getAllowedField(fieldsToDisplay, dataExist);

    if (!allowedFields) {
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

// get by pincode

exports.getPincode = async (req, res) => {
  try {
    //if no default query then pass {}
    let pincodeToBeSearch = req.params.pincode;
    let additionalQuery = [
      {
        $match: {
          pincode: pincodeToBeSearch,
          isDeleted: false,
        },
      },
    ];

    let userRoleData = await getUserRoleData(req);
    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.pincode,
      userRoleData,
      actionType.view
    );
    let dataExist = await pincodeService.aggregateQuery(additionalQuery);
    let allowedFields = getAllowedField(fieldsToDisplay, dataExist);

    if (!allowedFields) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successfull.",
        status: true,
        data: allowedFields[0] ? allowedFields[0] : null,
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

// get all pincodes by tehsil
exports.getPincodeByTehsil = async (req, res) => {
  try {
    //if no default query then pass {}
    let idToBeSearch = req.params.id;
    let dataExist = await pincodeService.findAllWithQuery({
      tehsilId: idToBeSearch,
      isDeleted: false,
    });

    if (!dataExist) {
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

//get all pincode of a country api
exports.getPincodeByCountry = async (req, res) => {
  try {
    //if no default query then pass {}
    let idToBeSearch = req.params.id;
    let dataExist = await pincodeService.findAllWithQuery({
      countryId: idToBeSearch,
      isDeleted: false,
    });

    if (!dataExist) {
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

//get all pincode of a country api
exports.getPincodeByDistrict = async (req, res) => {
  try {
    //if no default query then pass {}
    let idToBeSearch = req.params.id;
    let dataExist = await pincodeService.findAllWithQuery({
      districtId: idToBeSearch,
      isDeleted: false,
    });

    if (!dataExist) {
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
    if (!(await pincodeService.getOneByMultiField({ _id }))) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }

    const deleteRefCheck = await checkIdInCollectionsThenDelete(
      collectionArrToMatch,
      "pincodeId",
      _id
    );

    if (deleteRefCheck.status === true) {
      let deleted = await pincodeService.getOneAndDelete({ _id });
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
    let dataExist = await pincodeService.getOneByMultiField({ _id });
    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let isActive = dataExist.isActive ? false : true;

    let statusChanged = await pincodeService.getOneAndUpdate(
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
