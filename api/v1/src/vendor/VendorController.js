const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const { searchKeys } = require("./VendorSchema");
const { errorRes } = require("../../../utils/resError");
const {
  getQuery,
  getFieldsToDisplay,
  getUserRoleData,
  getAllowedField,
} = require("../../helper/utils");
const userAccessService = require("../userAccess/UserAccessService");

const vendorService = require("./VendorService");
const companyService = require("../company/CompanyService");
const {
  checkIdInCollectionsThenDelete,
  collectionArrToMatch,
} = require("../../helper/commonHelper");

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
const { actionType, moduleType } = require("../../helper/enumUtils");

//add start
exports.add = async (req, res) => {
  try {
    let {
      companyName,
      companyType,
      ownerShipType,
      websiteAddress,
      registrationAddress,
      billingAddress,
      contactInformation,
      document,
      bankInformation,
      companyId,
      openingBalance,
    } = req.body;

    const isCompanyExists = await companyService.getOneByMultiField({
      _id: companyId,
      isDeleted: false,
    });
    if (!isCompanyExists) {
      throw new ApiError(httpStatus.OK, "Invalid Company");
    }
    let lastObject = await vendorService.aggregateQuery([
      {
        $match: {
          companyId: new mongoose.Types.ObjectId(req.userData.companyId),
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 1 },
    ]);

    let currentNumber = 0;
    if (!lastObject.length) {
      currentNumber = 1;
    } else {
      currentNumber = parseInt(lastObject[0]?.vendorCode?.split("-")[2]) + 1; // Slice to remove 'VC' prefix
    }

    // Convert the currentNumber to a 4-digit string with leading zeros
    let formattedNumber = currentNumber.toString().padStart(4, "0");

    // Add the 'VC' prefix
    let finalOutput = `${isCompanyExists.companyCode}-VC-${formattedNumber}`;

    /**
     * check duplicate exist
     */
    let dataExist = await vendorService.isExists([{ companyName }]);
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }
    //------------------create data-------------------

    req.body.registrationAddress.maskedPhoneNo =
      "******" + req.body.registrationAddress.phone.substring(6);
    req.body.billingAddress.maskedPhoneNo =
      "******" + req.body.billingAddress.phone.substring(6);

    const updatedContactInformation = contactInformation?.map((contact) => {
      const maskedPhoneNo = "******" + contact.mobileNumber.slice(-4);
      return { ...contact, maskedPhoneNo };
    });
    req.body.contactInformation = updatedContactInformation;

    let dataCreated = await vendorService.createNewData({
      ...req.body,
      vendorCode: finalOutput.toString(),
    });

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
    let {
      companyName,
      companyType,
      ownerShipType,
      websiteAddress,
      registrationAddress,
      billingAddress,
      contactInformation,
      document,
      bankInformation,
      openingBalance,
    } = req.body;

    let idToBeSearch = req.params.id;

    //------------------Find data-------------------
    let datafound = await vendorService.getOneByMultiField({
      _id: idToBeSearch,
    });
    if (!datafound) {
      throw new ApiError(httpStatus.OK, `Vendor not found.`);
    }
    req.body.registrationAddress.maskedPhoneNo =
      "******" + req.body.registrationAddress.phone.substring(6);
    req.body.billingAddress.maskedPhoneNo =
      "******" + req.body.billingAddress.phone.substring(6);

    const updatedContactInformation = contactInformation.map((contact) => {
      const maskedPhoneNo = "******" + contact.mobileNumber.slice(-4);
      return { ...contact, maskedPhoneNo };
    });
    req.body.contactInformation = updatedContactInformation;
    let dataUpdated = await vendorService.getOneAndUpdate(
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
    let objectIdFileds = [
      "companyId",
      "billingAddress.stateId",
      "billingAddress.districtId",
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
          localField: "registrationAddress.countryId",
          foreignField: "_id",
          as: "country_name",
          pipeline: [{ $project: { countryName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "states",
          localField: "registrationAddress.stateId",
          foreignField: "_id",
          as: "state_name",
          pipeline: [{ $project: { stateName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "districts",
          localField: "registrationAddress.districtId",
          foreignField: "_id",
          as: "district_name",
          pipeline: [{ $project: { districtName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "pincodes",
          localField: "registrationAddress.pincodeId",
          foreignField: "_id",
          as: "pincode_name",
          pipeline: [{ $project: { pincode: 1 } }],
        },
      },
      // billing section start
      {
        $lookup: {
          from: "countries",
          localField: "billingAddress.countryId",
          foreignField: "_id",
          as: "b_country_name",
          pipeline: [{ $project: { countryName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "states",
          localField: "billingAddress.stateId",
          foreignField: "_id",
          as: "b_state_name",
          pipeline: [{ $project: { stateName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "districts",
          localField: "billingAddress.districtId",
          foreignField: "_id",
          as: "b_district_name",
          pipeline: [{ $project: { districtName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "pincodes",
          localField: "billingAddress.pincodeId",
          foreignField: "_id",
          as: "b_pincode_name",
          pipeline: [{ $project: { pincode: 1 } }],
        },
      },
      {
        $addFields: {
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
    let dataFound = await vendorService.aggregateQuery(finalAggregateQuery);
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
      moduleType.vendor,
      userRoleData,
      actionType.pagination
    );

    let result = await vendorService.aggregateQuery(finalAggregateQuery);
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
//get api
exports.get = async (req, res) => {
  try {
    let companyId = req.userData.companyId;

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
          from: "countries",
          localField: "registrationAddress.countryId",
          foreignField: "_id",
          as: "country_name",
          pipeline: [{ $project: { countryName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "states",
          localField: "registrationAddress.stateId",
          foreignField: "_id",
          as: "state_name",
          pipeline: [{ $project: { stateName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "districts",
          localField: "registrationAddress.districtId",
          foreignField: "_id",
          as: "district_name",
          pipeline: [{ $project: { districtName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "pincodes",
          localField: "registrationAddress.pincodeId",
          foreignField: "_id",
          as: "pincode_name",
          pipeline: [{ $project: { pincode: 1 } }],
        },
      },
      // billing section start
      {
        $lookup: {
          from: "countries",
          localField: "billingAddress.countryId",
          foreignField: "_id",
          as: "b_country_name",
          pipeline: [{ $project: { countryName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "states",
          localField: "billingAddress.stateId",
          foreignField: "_id",
          as: "b_state_name",
          pipeline: [{ $project: { stateName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "districts",
          localField: "billingAddress.districtId",
          foreignField: "_id",
          as: "b_district_name",
          pipeline: [{ $project: { districtName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "pincodes",
          localField: "billingAddress.pincodeId",
          foreignField: "_id",
          as: "b_pincode_name",
          pipeline: [{ $project: { pincode: 1 } }],
        },
      },
      {
        $addFields: {
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

    let userRoleData = await getUserRoleData(req);
    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.vendor,
      userRoleData,
      actionType.listAll
    );
    let dataExist = await vendorService.aggregateQuery(additionalQuery);
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
          localField: "registrationAddress.countryId",
          foreignField: "_id",
          as: "country_name",
          pipeline: [{ $project: { countryName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "states",
          localField: "registrationAddress.stateId",
          foreignField: "_id",
          as: "state_name",
          pipeline: [{ $project: { stateName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "districts",
          localField: "registrationAddress.districtId",
          foreignField: "_id",
          as: "district_name",
          pipeline: [{ $project: { districtName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "pincodes",
          localField: "registrationAddress.pincodeId",
          foreignField: "_id",
          as: "pincode_name",
          pipeline: [{ $project: { pincode: 1 } }],
        },
      },
      // billing section start
      {
        $lookup: {
          from: "countries",
          localField: "billingAddress.countryId",
          foreignField: "_id",
          as: "b_country_name",
          pipeline: [{ $project: { countryName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "states",
          localField: "billingAddress.stateId",
          foreignField: "_id",
          as: "b_state_name",
          pipeline: [{ $project: { stateName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "districts",
          localField: "billingAddress.districtId",
          foreignField: "_id",
          as: "b_district_name",
          pipeline: [{ $project: { districtName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "pincodes",
          localField: "billingAddress.pincodeId",
          foreignField: "_id",
          as: "b_pincode_name",
          pipeline: [{ $project: { pincode: 1 } }],
        },
      },
      {
        $addFields: {
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

    let userRoleData = await getUserRoleData(req);
    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.vendor,
      userRoleData,
      actionType.view
    );
    let dataExist = await vendorService.aggregateQuery(additionalQuery);
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
//delete api
exports.deleteDocument = async (req, res) => {
  try {
    let _id = req.params.id;
    if (!(await vendorService.getOneByMultiField({ _id }))) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    const deleteRefCheck = await checkIdInCollectionsThenDelete(
      collectionArrToMatch,
      "vendorId",
      _id
    );

    if (deleteRefCheck.status === true) {
      let deleted = await vendorService.getOneAndDelete({ _id });
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
    let dataExist = await vendorService.getOneByMultiField({ _id });
    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let isActive = dataExist.isActive ? false : true;

    let statusChanged = await vendorService.getOneAndUpdate(
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
