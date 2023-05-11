const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const wareHouseService = require("../../services/WareHouseService");
const { searchKeys } = require("../../model/WareHouseSchema");
const { errorRes } = require("../../../utils/resError");
const { getQuery } = require("../../helper/utils");
const purchaseOrderService = require("../../services/PurchaseOrderService");

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

//add start
exports.add = async (req, res) => {
  try {
    let {
      wareHouseCode,
      wareHouseName,
      country,
      email,
      registrationAddress,
      billingAddress,
      contactInformation,
    } = req.body;
    /**
     * check duplicate exist
     */
    let dataExist = await wareHouseService.isExists([
      { wareHouseCode },
      { wareHouseName },
    ]);
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }
    //------------------create data-------------------
    let dataCreated = await wareHouseService.createNewData({ ...req.body });

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
      wareHouseCode,
      wareHouseName,
      country,
      email,
      registrationAddress,
      billingAddress,
      contactInformation,
    } = req.body;

    let idToBeSearch = req.params.id;

    //------------------Find data-------------------
    let datafound = await wareHouseService.getOneByMultiField({
      _id: idToBeSearch,
    });
    if (!datafound) {
      throw new ApiError(httpStatus.OK, `WareHouse not found.`);
    }

    let dataUpdated = await wareHouseService.getOneAndUpdate(
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
      $and: [{ isDeleted: false, vendorId: null, dealerId: null }],
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
    let objectIdFileds = ["dealerId", "vendorId", "companyId"];
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
          localField: "country",
          foreignField: "_id",
          as: "warehouse_country_name",
          pipeline: [{ $project: { countryName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "countries",
          localField: "registrationAddress.country",
          foreignField: "_id",
          as: "country_name",
          pipeline: [{ $project: { countryName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "states",
          localField: "registrationAddress.state",
          foreignField: "_id",
          as: "state_name",
          pipeline: [{ $project: { stateName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "districts",
          localField: "registrationAddress.district",
          foreignField: "_id",
          as: "district_name",
          pipeline: [{ $project: { districtName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "pincodes",
          localField: "registrationAddress.pincode",
          foreignField: "_id",
          as: "pincode_name",
          pipeline: [{ $project: { pincode: 1 } }],
        },
      },
      // billing section start
      {
        $lookup: {
          from: "countries",
          localField: "billingAddress.country",
          foreignField: "_id",
          as: "b_country_name",
          pipeline: [{ $project: { countryName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "states",
          localField: "billingAddress.state",
          foreignField: "_id",
          as: "b_state_name",
          pipeline: [{ $project: { stateName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "districts",
          localField: "billingAddress.district",
          foreignField: "_id",
          as: "b_district_name",
          pipeline: [{ $project: { districtName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "pincodes",
          localField: "billingAddress.pincode",
          foreignField: "_id",
          as: "b_pincode_name",
          pipeline: [{ $project: { pincode: 1 } }],
        },
      },
      {
        $addFields: {
          wareHouseCountryName: {
            $arrayElemAt: ["$warehouse_country_name.countryName", 0],
          },
          registrationCountryName: {
            $arrayElemAt: ["$country_name.countryName", 0],
          },
          registrationStateName: {
            $arrayElemAt: ["$state_name.stateName", 0],
          },
          registrationDistrictName: {
            $arrayElemAt: ["$district_name.districtName", 0],
          },
          registrationPincodeName: {
            $arrayElemAt: ["$pincode_name.pincode", 0],
          },
          //billing start
          billingAddressCountryName: {
            $arrayElemAt: ["$b_country_name.countryName", 0],
          },
          billingAddressStateName: {
            $arrayElemAt: ["$b_state_name.stateName", 0],
          },
          billingAddressDistrictName: {
            $arrayElemAt: ["$b_district_name.districtName", 0],
          },
          billingAddressPincodeName: {
            $arrayElemAt: ["$b_pincode_name.pincode", 0],
          },
        },
      },
      {
        $unset: [
          "warehouse_country_name",
          "country_name",
          "state_name",
          "district_name",
          "pincode_name",
          "b_country_name",
          "b_state_name",
          "b_district_name",
          "b_pincode_name",
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
    let dataFound = await wareHouseService.aggregateQuery(finalAggregateQuery);
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

    let result = await wareHouseService.aggregateQuery(finalAggregateQuery);
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
    let additionalQuery = [
      { $match: matchQuery },
      {
        $lookup: {
          from: "countries",
          localField: "country",
          foreignField: "_id",
          as: "warehouse_country_name",
          pipeline: [{ $project: { countryName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "countries",
          localField: "registrationAddress.country",
          foreignField: "_id",
          as: "country_name",
          pipeline: [{ $project: { countryName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "states",
          localField: "registrationAddress.state",
          foreignField: "_id",
          as: "state_name",
          pipeline: [{ $project: { stateName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "districts",
          localField: "registrationAddress.district",
          foreignField: "_id",
          as: "district_name",
          pipeline: [{ $project: { districtName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "pincodes",
          localField: "registrationAddress.pincode",
          foreignField: "_id",
          as: "pincode_name",
          pipeline: [{ $project: { pincode: 1 } }],
        },
      },
      // billing section start
      {
        $lookup: {
          from: "countries",
          localField: "billingAddress.country",
          foreignField: "_id",
          as: "b_country_name",
          pipeline: [{ $project: { countryName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "states",
          localField: "billingAddress.state",
          foreignField: "_id",
          as: "b_state_name",
          pipeline: [{ $project: { stateName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "districts",
          localField: "billingAddress.district",
          foreignField: "_id",
          as: "b_district_name",
          pipeline: [{ $project: { districtName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "pincodes",
          localField: "billingAddress.pincode",
          foreignField: "_id",
          as: "b_pincode_name",
          pipeline: [{ $project: { pincode: 1 } }],
        },
      },
      {
        $addFields: {
          wareHouseCountryName: {
            $arrayElemAt: ["$warehouse_country_name.countryName", 0],
          },
          registrationCountryName: {
            $arrayElemAt: ["$country_name.countryName", 0],
          },
          registrationStateName: {
            $arrayElemAt: ["$state_name.stateName", 0],
          },
          registrationDistrictName: {
            $arrayElemAt: ["$district_name.districtName", 0],
          },
          registrationPincodeName: {
            $arrayElemAt: ["$pincode_name.pincode", 0],
          },
          //billing start
          billingAddressCountryName: {
            $arrayElemAt: ["$b_country_name.countryName", 0],
          },
          billingAddressStateName: {
            $arrayElemAt: ["$b_state_name.stateName", 0],
          },
          billingAddressDistrictName: {
            $arrayElemAt: ["$b_district_name.districtName", 0],
          },
          billingAddressPincodeName: {
            $arrayElemAt: ["$b_pincode_name.pincode", 0],
          },
        },
      },
      {
        $unset: [
          "warehouse_country_name",
          "country_name",
          "state_name",
          "district_name",
          "pincode_name",
          "b_country_name",
          "b_state_name",
          "b_district_name",
          "b_pincode_name",
        ],
      },
    ];
    let dataExist = await wareHouseService.aggregateQuery(additionalQuery);

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
          localField: "country",
          foreignField: "_id",
          as: "warehouse_country_name",
          pipeline: [{ $project: { countryName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "countries",
          localField: "registrationAddress.country",
          foreignField: "_id",
          as: "country_name",
          pipeline: [{ $project: { countryName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "states",
          localField: "registrationAddress.state",
          foreignField: "_id",
          as: "state_name",
          pipeline: [{ $project: { stateName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "districts",
          localField: "registrationAddress.district",
          foreignField: "_id",
          as: "district_name",
          pipeline: [{ $project: { districtName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "pincodes",
          localField: "registrationAddress.pincode",
          foreignField: "_id",
          as: "pincode_name",
          pipeline: [{ $project: { pincode: 1 } }],
        },
      },
      // billing section start
      {
        $lookup: {
          from: "countries",
          localField: "billingAddress.country",
          foreignField: "_id",
          as: "b_country_name",
          pipeline: [{ $project: { countryName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "states",
          localField: "billingAddress.state",
          foreignField: "_id",
          as: "b_state_name",
          pipeline: [{ $project: { stateName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "districts",
          localField: "billingAddress.district",
          foreignField: "_id",
          as: "b_district_name",
          pipeline: [{ $project: { districtName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "pincodes",
          localField: "billingAddress.pincode",
          foreignField: "_id",
          as: "b_pincode_name",
          pipeline: [{ $project: { pincode: 1 } }],
        },
      },
      {
        $addFields: {
          wareHouseCountryName: {
            $arrayElemAt: ["$warehouse_country_name.countryName", 0],
          },
          registrationCountryName: {
            $arrayElemAt: ["$country_name.countryName", 0],
          },
          registrationStateName: {
            $arrayElemAt: ["$state_name.stateName", 0],
          },
          registrationDistrictName: {
            $arrayElemAt: ["$district_name.districtName", 0],
          },
          registrationPincodeName: {
            $arrayElemAt: ["$pincode_name.pincode", 0],
          },
          //billing start
          billingAddressCountryName: {
            $arrayElemAt: ["$b_country_name.countryName", 0],
          },
          billingAddressStateName: {
            $arrayElemAt: ["$b_state_name.stateName", 0],
          },
          billingAddressDistrictName: {
            $arrayElemAt: ["$b_district_name.districtName", 0],
          },
          billingAddressPincodeName: {
            $arrayElemAt: ["$b_pincode_name.pincode", 0],
          },
        },
      },
      {
        $unset: [
          "warehouse_country_name",
          "country_name",
          "state_name",
          "district_name",
          "pincode_name",
          "b_country_name",
          "b_state_name",
          "b_district_name",
          "b_pincode_name",
        ],
      },
    ];
    let dataExist = await wareHouseService.aggregateQuery(additionalQuery);
    if (!dataExist.length) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successfull.",
        status: true,
        data: dataExist[0],
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
    if (!(await wareHouseService.getOneByMultiField({ _id }))) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    const isWareHouseExistsInPo = await purchaseOrderService.findCount({
      wareHouseId: _id,
    });

    if (isWareHouseExistsInPo) {
      throw new ApiError(
        httpStatus.OK,
        "Warehouse can't be deleted because it is currently used in other services"
      );
    }
    let deleted = await wareHouseService.getOneAndDelete({ _id });
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
    let _id = req.params.id;
    let dataExist = await wareHouseService.getOneByMultiField({ _id });
    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let isActive = dataExist.isActive ? false : true;

    let statusChanged = await wareHouseService.getOneAndUpdate(
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
