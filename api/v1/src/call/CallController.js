const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
// ----service---------
const callService = require("./CallService");
const InquiryService = require("../inquiry/InquiryService");
const orderService = require("../order/OrderService");
const countryService = require("../country/CountryService");
const stateService = require("../state/StateService");
const schemeService = require("../scheme/SchemeService");
const districtService = require("../district/DistrictService");
const tehsilService = require("../tehsil/TehsilService");
const pincodeService = require("../pincode/PincodeService");
const areaService = require("../area/AreaService");
const dispositionTwoService = require("../dispositionTwo/DispositionTwoService");
const dispositionThreeService = require("../dispositionThree/DispositionThreeService");
const dealerPincodeService = require("../dealerPincode/DealerPincodeService");

const {
  getDealer,
  getInquiryNumber,
  getPrepaidOrderNumber,
  getOrderNumber,
  isOrder,
  dealerSurvingPincode,
  getAssignWarehouse,
} = require("./CallHelper");
// ----service---------
const { searchKeys } = require("./CallSchema");
const { errorRes } = require("../../../utils/resError");
const { getQuery } = require("../../helper/utils");
const mongoose = require("mongoose");
const { applicableCriteria, orderType } = require("../../helper/enumUtils");

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
      countryId,
      stateId,
      schemeId,
      districtId,
      tehsilId,
      pincodeId,
      areaId,

      dispositionLevelTwoId,
      dispositionLevelThreeId,
    } = req.body;
    // ===============check id Exist in DB==========

    const isCounrtyExists =
      countryId !== null
        ? await countryService.findCount({
            _id: countryId,
            isDeleted: false,
          })
        : null;
    if (countryId !== null && !isCounrtyExists) {
      throw new ApiError(httpStatus.OK, "Invalid Country.");
    }

    const isStateExists =
      stateId !== null
        ? await stateService.findCount({
            _id: stateId,
            isDeleted: false,
          })
        : null;
    if (stateId !== null && !isStateExists) {
      throw new ApiError(httpStatus.OK, "Invalid State.");
    }

    const isSchemeExists =
      schemeId !== null
        ? await schemeService.findCount({
            _id: schemeId,
            isDeleted: false,
          })
        : null;
    if (schemeId !== null && !isSchemeExists) {
      throw new ApiError(httpStatus.OK, "Invalid Scheme.");
    }

    const isDistrictExists =
      districtId !== null
        ? await districtService.findCount({
            _id: districtId,
            isDeleted: false,
          })
        : null;
    if (districtId !== null && !isDistrictExists) {
      throw new ApiError(httpStatus.OK, "Invalid District.");
    }

    const isTehsilExists =
      tehsilId !== null
        ? await tehsilService.findCount({
            _id: tehsilId,
            isDeleted: false,
          })
        : null;
    if (tehsilId !== null && !isTehsilExists) {
      throw new ApiError(httpStatus.OK, "Invalid Tehsil.");
    }

    const isAreaExists =
      areaId !== null
        ? await areaService.findCount({
            _id: areaId,
            isDeleted: false,
          })
        : null;
    if (areaId !== null && !isAreaExists) {
      throw new ApiError(httpStatus.OK, "Invalid Area.");
    }

    const isPincodeExists =
      pincodeId !== null
        ? await pincodeService.findCount({
            _id: pincodeId,
            isDeleted: false,
          })
        : null;
    if (pincodeId !== null && !isPincodeExists) {
      throw new ApiError(httpStatus.OK, "Invalid Pincode.");
    }

    // const isChannelExists =
    //   channel !== null
    //     ? await channelService.findCount({
    //         _id: channel,
    //         isDeleted: false,
    //       })
    //     : null;
    // if (channel !== null && !isChannelExists) {
    //   throw new ApiError(httpStatus.OK, "Invalid Channel.");
    // }

    const isDispositionTwoExists =
      dispositionLevelTwoId !== null
        ? await dispositionTwoService.findCount({
            _id: dispositionLevelTwoId,
            isDeleted: false,
          })
        : null;
    if (dispositionLevelTwoId !== null && !isDispositionTwoExists) {
      throw new ApiError(httpStatus.OK, "Invalid Disposition Two.");
    }

    const isDispositionThreeExists =
      dispositionLevelThreeId !== null
        ? await dispositionThreeService.findCount({
            _id: dispositionLevelThreeId,
            isDeleted: false,
          })
        : null;
    if (dispositionLevelThreeId !== null && !isDispositionThreeExists) {
      throw new ApiError(httpStatus.OK, "Invalid Disposition Three.");
    }
    // ===============check id Exist in DB end==========

    /**
     * check duplicate exist
     */
    let dataExist = await callService.isExists([]);
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }

    //------------------create data-------------------
    let dataCreated = await callService.createNewData({ ...req.body });

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
      countryId,
      stateId,
      districtId,
      tehsilId,
      schemeId,
      pincodeId,
      pincodeName,
      areaId,
      paymentMode,
      companyId,
      dispositionLevelTwoId,
      dispositionLevelThreeId,
      agentId,
      agentName,
    } = req.body;

    let idToBeSearch = req.params.id;
    let dataExist = await callService.isExists([]);
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }

    const isCounrtyExists = await countryService.findCount({
      _id: countryId,
      isDeleted: false,
    });
    if (!isCounrtyExists) {
      throw new ApiError(httpStatus.OK, "Invalid Country.");
    }

    const isStateExists = await stateService.findCount({
      _id: stateId,
      isDeleted: false,
    });
    if (!isStateExists) {
      throw new ApiError(httpStatus.OK, "Invalid State.");
    }

    const isSchemeExists = await schemeService.findCount({
      _id: schemeId,
      isDeleted: false,
    });
    if (!isSchemeExists) {
      throw new ApiError(httpStatus.OK, "Invalid Scheme.");
    }

    const isDistrictExists = await districtService.findCount({
      _id: districtId,
      isDeleted: false,
    });
    if (!isDistrictExists) {
      throw new ApiError(httpStatus.OK, "Invalid District.");
    }

    const isTehsilExists = await tehsilService.findCount({
      _id: tehsilId,
      isDeleted: false,
    });
    if (!isTehsilExists) {
      throw new ApiError(httpStatus.OK, "Invalid Tehsil.");
    }

    const isAreaExists = await areaService.findCount({
      _id: areaId,
      isDeleted: false,
    });
    if (!isAreaExists) {
      throw new ApiError(httpStatus.OK, "Invalid Area.");
    }

    const isPincodeExists = await pincodeService.findCount({
      _id: pincodeId,
      isDeleted: false,
    });
    if (!isPincodeExists) {
      throw new ApiError(httpStatus.OK, "Invalid Pincode.");
    }

    // const isChannelExists = await channelService.findCount({
    //   _id: channelId,
    //   isDeleted: false,
    // });
    // if (!isChannelExists) {
    //   throw new ApiError(httpStatus.OK, "Invalid Channel.");
    // }

    const isDispositionTwoExists = await dispositionTwoService.findCount({
      _id: dispositionLevelTwoId,
      isDeleted: false,
    });
    if (!isDispositionTwoExists) {
      throw new ApiError(httpStatus.OK, "Invalid Disposition Two.");
    }

    const isDispositionThreeExists = await dispositionThreeService.findCount({
      _id: dispositionLevelThreeId,
      isDeleted: false,
    });
    if (!isDispositionThreeExists) {
      throw new ApiError(httpStatus.OK, "Invalid Disposition Three.");
    }

    //------------------Find data-------------------
    let datafound = await callService.getOneByMultiField({
      _id: idToBeSearch,
    });
    if (!datafound) {
      throw new ApiError(httpStatus.OK, `Inbound not found.`);
    }

    // let dispositionThreeId = dataCreated.dispositionLevelThreeId;

    let dispositionThreeData = await dispositionThreeService.findAllWithQuery({
      _id: new mongoose.Types.ObjectId(dispositionLevelThreeId),
    });

    // ---------map for order-------
    let flag = await isOrder(dispositionThreeData[0]?.applicableCriteria);

    let prepaidOrderFlag = paymentMode === "UPI/ONLINE";

    let dealerServingPincodes = await dealerSurvingPincode(
      pincodeName,
      companyId,
      schemeId
    );

    let activeDealer = await getDealer(dealerServingPincodes, pincodeId);
    let assignWarehouseId = null;
    if (activeDealer === null) {
      const servingWarehouseAtPincode = await getAssignWarehouse(
        pincodeId,
        companyId
      );
      assignWarehouseId = servingWarehouseAtPincode;
    }
    const orderNumber = await getOrderNumber();

    await orderService.createNewData({
      ...req.body,
      orderNumber: orderNumber,
      assignDealerId: activeDealer,
      assignWarehouseId: assignWarehouseId,
      approved: flag ? true : prepaidOrderFlag ? false : true,
      agentId: agentId,
      agentName: agentName,

      // dealerAssignedId: dealerId,
    });

    // =============create Inquiry=========
    let isInquiryExist = [applicableCriteria.isInquiry];
    let existingInquiry = false;
    dispositionThreeData[0]?.applicableCriteria?.map((e) => {
      if (isInquiryExist.includes(e)) {
        existingInquiry = true;
      }
    });
    if (isInquiryExist) {
      const inquiryNumber = await getInquiryNumber();
      await InquiryService.createNewData({
        ...req.body,
        inquiryNumber: inquiryNumber,
      });
    }
    // =============create Inquiry end=========
    let dataUpdated = await callService.getOneAndUpdate(
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
    let booleanFields = ["prepaid"];
    let numberFileds = [];
    let objectIdFields = [
      "countryId",
      "stateId",
      "districtId",
      "tehsilId",
      "schemeId",
      "pincodeId",
      "areaId",
      "dispositionLevelTwoId",
      "dispositionLevelThreeId",
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
        $match: matchQuery,
      },
      {
        $lookup: {
          from: "dispositiontwos",
          localField: "dispositionLevelTwoId",
          foreignField: "_id",
          as: "dispositionLevelTwoData",
          pipeline: [
            {
              $project: {
                dispositionName: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "dispositionthrees",
          localField: "dispositionLevelThreeId",
          foreignField: "_id",
          as: "dispositionthreesData",
          pipeline: [
            {
              $project: {
                dispositionName: 1,
              },
            },
          ],
        },
      },

      {
        $addFields: {
          dispositionLevelTwoLabel: {
            $arrayElemAt: ["$dispositionLevelTwoData.dispositionName", 0],
          },
          dispositionLevelThreeLabel: {
            $arrayElemAt: ["$dispositionthreesData.dispositionName", 0],
          },
        },
      },
      {
        $unset: ["dispositionLevelTwoData", "dispositionthreesData"],
      },
    ];

    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    finalAggregateQuery.push({
      $match: matchQuery,
    });

    //-----------------------------------
    let dataFound = await callService.aggregateQuery(finalAggregateQuery);
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

    let result = await callService.aggregateQuery(finalAggregateQuery);
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
    //if no default query then pass {}
    let matchQuery = { isDeleted: false };
    if (req.query && Object.keys(req.query).length) {
      matchQuery = getQuery(matchQuery, req.query);
    }

    let dataExist = await callService.findAllWithQuery(matchQuery);

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

//get by id
exports.getById = async (req, res) => {
  try {
    let idToBeSearch = req.params.id;
    let dataExist = await callService.getOneByMultiField({
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
    if (!(await callService.getOneByMultiField({ _id }))) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let deleted = await callService.getOneAndDelete({ _id });
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
    let dataExist = await callService.getOneByMultiField({ _id });
    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let isActive = dataExist.isActive ? false : true;

    let statusChanged = await callService.getOneAndUpdate(
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
