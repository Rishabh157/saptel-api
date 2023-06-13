const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
// ----service---------
const callService = require("../../services/CallService");
const InquiryService = require("../../services/InquiryService");
const prepaidOrderService = require("../../services/PrepaidOrderService");
const orderService = require("../../services/OrderService");
const countryService = require("../../services/CountryService");
const stateService = require("../../services/StateService");
const schemeService = require("../../services/SchemeService");
const districtService = require("../../services/DistrictService");
const tehsilService = require("../../services/TehsilService");
const pincodeService = require("../../services/PincodeService");
const areaService = require("../../services/AreaService");
const dispositionTwoService = require("../../services/DispositionTwoService");
const dispositionThreeService = require("../../services/DispositionThreeService");

const {
  getDealer,
  getInquiryNumber,
  getPrepaidOrderNumber,
  getOrderNumber,
} = require("./CallHelper");
// ----service---------
const { searchKeys } = require("../../model/CallSchema");
const { errorRes } = require("../../../utils/resError");
const { getQuery } = require("../../helper/utils");
const mongoose = require("mongoose");
const { applicableCriteria } = require("../../helper/enumUtils");

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
      didNo,
      inOutBound,
      incomingCallerNo,
      mobileNo,
      deliveryCharges,
      discount,
      total,
      countryId,
      stateId,
      schemeId,
      districtId,
      tehsilId,
      pincodeId,
      areaId,
      expectedDeliveryDate,
      profileDeliveredBy,
      complaintDetails,
      complaintNo,
      agentName,
      name,
      age,
      address,
      relation,
      agentDistrictId,
      landmark,
      alternateNo1,
      whatsappNo,
      gender,
      prepaid,
      emailId,
      channel,
      remark,
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
      didNo,
      inOutBound,
      incomingCallerNo,
      mobileNo,
      deliveryCharges,
      discount,
      total,
      countryId,
      stateId,
      districtId,
      tehsilId,
      schemeId,
      pincodeId,
      areaId,
      expectedDeliveryDate,
      profileDeliveredBy,
      complaintDetails,
      complaintNo,
      agentName,
      name,
      age,
      address,
      relation,
      agentDistrictId,
      landmark,
      alternateNo1,
      whatsappNo,
      gender,
      prepaid,
      emailId,
      channel,
      remark,
      dispositionLevelTwoId,
      dispositionLevelThreeId,
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

    let applicableCriteriaArray = [
      applicableCriteria.isOrder,
      // applicableCriteria.isPrepaid,
      // applicableCriteria.isReplacement,
      // applicableCriteria.isCallBack,
    ];

    let applicableCriteriaArrayForIsPrepaid = [applicableCriteria.isPrepaid];

    // ---------map for order-------
    let isOrderExist = [applicableCriteria.isOrder];
    let flag = false;
    dispositionThreeData[0]?.applicableCriteria?.map((e) => {
      if (applicableCriteriaArray.includes(e)) {
        flag = true;
      }
    });
    if (isOrderExist) {
      const orderNumber = await getOrderNumber();
      await orderService.createNewData({
        ...req.body,
        orderNumber: orderNumber,
        // dealerAssignedId: dealerId,
      });
    }
    // ---------map for order end-------

    // ---------prepaidOrder -------
    let isPrepaidOrderExist = [applicableCriteria.isPrepaid];
    let prepaidOrderFlag = false;
    dispositionThreeData[0]?.applicableCriteria?.map((e) => {
      if (applicableCriteriaArrayForIsPrepaid.includes(e)) {
        prepaidOrderFlag = true;
      }
    });

    if (isPrepaidOrderExist) {
      const prepaidOrderNumber = await getPrepaidOrderNumber();
      await prepaidOrderService.createNewData({
        ...req.body,
        prepaidOrderNumber: prepaidOrderNumber,
        // dealerAssignedId: dealerId,
      });
    }

    // --------prepaidOrder end-------

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
        $lookup: {
          from: "countries",
          localField: "countryId",
          foreignField: "_id",
          as: "countrieData",
          pipeline: [
            {
              $project: {
                countryName: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "states",
          localField: "stateId",
          foreignField: "_id",
          as: "stateData",
          pipeline: [
            {
              $project: {
                stateName: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "schemes",
          localField: "schemeId",
          foreignField: "_id",
          as: "schemeData",
          pipeline: [
            {
              $project: {
                schemeName: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "districts",
          localField: "districtId",
          foreignField: "_id",
          as: "districtData",
          pipeline: [
            {
              $project: {
                districtName: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "tehsils",
          localField: "tehsilId",
          foreignField: "_id",
          as: "tehsilData",
          pipeline: [
            {
              $project: {
                tehsilName: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "pincodes",
          localField: "pincodeId",
          foreignField: "_id",
          as: "pincodeData",
          pipeline: [
            {
              $project: {
                pincode: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "areas",
          localField: "areaId",
          foreignField: "_id",
          as: "areaData",
          pipeline: [
            {
              $project: {
                area: 1,
              },
            },
          ],
        },
      },
      // {
      //   $lookup: {
      //     from: "channelmasters",
      //     localField: "channelId",
      //     foreignField: "_id",
      //     as: "channelData",
      //     pipeline: [
      //       {
      //         $project: {
      //           channelName: 1,
      //         },
      //       },
      //     ],
      //   },
      // },
      {
        $lookup: {
          from: "districts",
          localField: "agentDistrictId",
          foreignField: "_id",
          as: "agentDistrictData",
          pipeline: [
            {
              $project: {
                districtName: 1,
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
          countryLabel: {
            $arrayElemAt: ["$countrieData.countryName", 0],
          },
          stateLabel: {
            $arrayElemAt: ["$stateData.stateName", 0],
          },
          schemeLabel: {
            $arrayElemAt: ["$schemeData.schemeName", 0],
          },
          districtLabel: {
            $arrayElemAt: ["$districtData.districtName", 0],
          },
          tehsilLabel: {
            $arrayElemAt: ["$tehsilData.tehsilName", 0],
          },
          pincodeLabel: {
            $arrayElemAt: ["$pincodeData.pincode", 0],
          },
          areaLabel: {
            $arrayElemAt: ["$areaData.area", 0],
          },
          // channelLabel: {
          //   $arrayElemAt: ["$channelData.channelName", 0],
          // },
          agentDistrictLabel: {
            $arrayElemAt: ["$agentDistrictData.districtName", 0],
          },
        },
      },
      {
        $unset: [
          "dispositionLevelTwoData",
          "dispositionthreesData",
          "countrieData",
          "stateData",
          "schemeData",
          "districtData",
          "tehsilData",
          "pincodeData",
          "areaData",
          // "channelData",
          "agentDistrictData",
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
