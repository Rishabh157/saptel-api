const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const ledgerService = require("./LedgerService");
const { searchKeys } = require("./LedgerSchema");
const { errorRes } = require("../../../utils/resError");
const { getQuery, getLedgerNo } = require("./LedgerHelper");
const mongoose = require("mongoose");
const companyService = require("../company/CompanyService");
const warehouseService = require("../wareHouse/WareHouseService");
const stateService = require("../state/StateService");
const dealerService = require("../dealer/DealerService");
const productGroupService = require("../productGroup/ProductGroupService");
const { ledgerType, tallyLedgerType } = require("../../helper/enumUtils");
const {
  getDealerFromLedger,
  getBalance,
  addLedgerToTally,
} = require("./LedgerHelper");
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
      noteType,
      creditAmount,
      debitAmount,
      remark,
      companyId,
      dealerId,
      itemId,
    } = req.body;
    /**
     * check duplicate exist
     */

    const isCompanyExists = await companyService.findCount({
      _id: companyId,
      isDeleted: false,
    });
    if (!isCompanyExists) {
      throw new ApiError(httpStatus.OK, "Invalid Company");
    }
    const isDealerExists = await dealerService.getOneByMultiField({
      _id: dealerId,
      isDeleted: false,
    });
    if (!isDealerExists) {
      throw new ApiError(httpStatus.OK, "Invalid Dealer.");
    }
    const isProductGroupExist = await productGroupService?.getOneByMultiField({
      isDeleted: false,
      _id: itemId,
    });
    if (!isProductGroupExist) {
      throw new ApiError(httpStatus.OK, "Invalid Item.");
    }
    const warehouseData = await warehouseService?.getOneByMultiField({
      isDeleted: false,
      isDefault: true,
    });
    if (!warehouseData) {
      throw new ApiError(
        httpStatus.OK,
        "Something went wrong invalid warehouse"
      );
    }
    const companyStateId = warehouseData?.billingAddress?.stateId;
    const companyStateData = await stateService?.getOneByMultiField({
      isDeleted: false,
      _id: companyStateId,
    });

    const dealerStateData = await stateService?.getOneByMultiField({
      isDeleted: false,
      _id: isDealerExists?.billingAddress?.stateId,
    });

    if (!dealerStateData) {
      throw new ApiError(
        httpStatus.OK,
        "Something went wrong with dealer state"
      );
    }
    const dealerExitsId = await getDealerFromLedger(dealerId);
    const balance = await getBalance(dealerExitsId, creditAmount, debitAmount);

    let ledgerNo = await getLedgerNo(noteType);

    let dataExist = await ledgerService.isExists(
      [{ noteType }, { ledgerNumber: ledgerNo }],
      false,
      true
    );
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }
    //------------------create data-------------------
    let dataCreated = await ledgerService.createNewData({
      ...req.body,
      balance: balance,
      ledgerNumber: ledgerNo,
    });

    let gstType;
    if (companyStateData.stateName === dealerStateData.stateName) {
      gstType = ["CGST", "SGST"];
    } else if (companyStateData.stateName !== dealerStateData.stateName) {
      if (dealerStateData.isUnion) {
        gstType = ["UTGST"];
      } else {
        gstType = ["IGST"];
      }
    }

    let xmlData = {
      companyState: companyStateData?.stateName,
      partyName: isDealerExists?.firmName,
      itemName: isProductGroupExist?.groupName,
      amount: creditAmount ? creditAmount : debitAmount,
      cgst: isProductGroupExist?.cgst,
      sgst: isProductGroupExist?.sgst,
      utgst: isProductGroupExist?.utgst,
      igst: isProductGroupExist?.igst,
      gstType,
      ledgerType: creditAmount
        ? tallyLedgerType.cretidNote
        : tallyLedgerType.debitNote,
      ledgerNumber: ledgerNo,
    };

    let creditNoteTallySync = await addLedgerToTally(xmlData);

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
    let { noteType, price, remark, companyId, dealerId } = req.body;

    let idToBeSearch = req.params.id;
    let dataExist = await ledgerService.isExists([]);
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }
    const isCompanyExists = await companyService.findCount({
      _id: companyId,
      isDeleted: false,
    });
    if (!isCompanyExists) {
      throw new ApiError(httpStatus.OK, "Invalid Company.");
    }
    const isDealerExists = await dealerService.findCount({
      _id: dealerId,
      isDeleted: false,
    });
    if (!isDealerExists) {
      throw new ApiError(httpStatus.OK, "Invalid Dealer.");
    }
    //------------------Find data-------------------
    let datafound = await ledgerService.getOneByMultiField({
      _id: idToBeSearch,
    });
    if (!datafound) {
      throw new ApiError(httpStatus.OK, `Ledger not found.`);
    }

    let dataUpdated = await ledgerService.getOneAndUpdate(
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
    let objectIdFields = ["companyId", "dealerId"];
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
          from: "dealers",
          localField: "dealerId",
          foreignField: "_id",
          as: "dealerData",
          pipeline: [
            {
              $project: {
                firstName: 1,
              },
            },
          ],
        },
      },

      {
        $addFields: {
          dealerLabel: {
            $arrayElemAt: ["$dealerData.firstName", 0],
          },
        },
      },
      {
        $unset: ["dealerData"],
      },
    ];

    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    finalAggregateQuery.push({
      $match: matchQuery,
    });

    //-----------------------------------
    let dataFound = await ledgerService.aggregateQuery(finalAggregateQuery);
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

    let result = await ledgerService.aggregateQuery(finalAggregateQuery);
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
      {
        $match: matchQuery,
      },
      {
        $lookup: {
          from: "dealers",
          localField: "dealerId",
          foreignField: "_id",
          as: "dealerData",
          pipeline: [
            {
              $project: {
                firstName: 1,
              },
            },
          ],
        },
      },

      {
        $addFields: {
          dealerLabel: {
            $arrayElemAt: ["$dealerData.firstName", 0],
          },
        },
      },
      {
        $unset: ["dealerData"],
      },
    ];

    let dataExist = await ledgerService.aggregateQuery(additionalQuery);

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
    let additionalQuery = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(idToBeSearch),
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: "dealers",
          localField: "dealerId",
          foreignField: "_id",
          as: "dealerData",
          pipeline: [
            {
              $project: {
                firstName: 1,
              },
            },
          ],
        },
      },

      {
        $addFields: {
          dealerLabel: {
            $arrayElemAt: ["$dealerData.firstName", 0],
          },
        },
      },
      {
        $unset: ["dealerData"],
      },
    ];
    let dataExist = await ledgerService.aggregateQuery(additionalQuery);
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
    if (!(await ledgerService.getOneByMultiField({ _id }))) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let deleted = await ledgerService.getOneAndDelete({ _id });
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
    let dataExist = await ledgerService.getOneByMultiField({ _id });
    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let isActive = dataExist.isActive ? false : true;

    let statusChanged = await ledgerService.getOneAndUpdate(
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
