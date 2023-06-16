const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const mongoose = require("mongoose");
const dealerSchemeService = require("./DealerSchemeService");
const companyService = require("../company/CompanyService");
const schemeService = require("../scheme/SchemeService");
const dealerService = require("../dealer/DealerService");

const { searchKeys } = require("./DealerSchemeSchema");
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
    let { dealerId, details, companyId } = req.body;

    const isCompanyExists = await companyService.findCount({
      _id: companyId,
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

    const isSchemeExists = await Promise.all(
      details?.map(async (ele) => {
        return await schemeService.findCount({
          _id: ele.schemeId,
          isDeleted: false,
        });
      })
    );
    if (isSchemeExists.includes(0)) {
      throw new ApiError(httpStatus.OK, "Invalid scheme");
    }

    /**
     * check duplicate exist
     */

    //------------------create data-------------------
    const output = details.map((scheme) => {
      return {
        dealerId: dealerId,
        schemeId: scheme?.schemeId,
        pincodes: scheme?.pincodes,
        companyId: companyId,
      };
    });
    let isValidDealerScheme = false;
    await Promise.all(
      output?.map(async (ele) => {
        let schemeId = ele?.schemeId;
        let dataExist = await dealerSchemeService.isExists(
          [{ schemeId }, { dealerId }],
          false,
          true
        );
        if (dataExist.exists && dataExist.existsSummary) {
          isValidDealerScheme = true;
          return;
        }
      })
    );
    if (isValidDealerScheme) {
      throw new ApiError(
        httpStatus.OK,
        "Scheme already exists with this dealer."
      );
    }
    //------------------create data-------------------

    let dataCreated = await dealerSchemeService.createMany(output);

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
    let { dealerId, schemeId, pincodes, companyId } = req.body;

    let idToBeSearch = req.params.id;

    const isCompanyExists = await companyService.findCount({
      _id: companyId,
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

    const isSchemeIdExists = await schemeService.findCount({
      _id: schemeId,
      isDeleted: false,
    });
    if (!isSchemeIdExists) {
      throw new ApiError(httpStatus.OK, "Invalid Scheme.");
    }

    //------------------Find data-------------------
    let datafound = await dealerSchemeService.getOneByMultiField({
      _id: idToBeSearch,
    });
    if (!datafound) {
      throw new ApiError(httpStatus.OK, `DealerScheme not found.`);
    }

    let dataUpdated = await dealerSchemeService.getOneAndUpdate(
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
    let objectIdFields = ["dealerId", "details.schemeId", "dealerId"];

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
          from: "schemes",
          localField: "schemeId",
          foreignField: "_id",
          as: "scheme_data",
          pipeline: [
            {
              $project: {
                schemeName: 1,
                schemePrice: 1,
              },
            },
          ],
        },
      },

      {
        $addFields: {
          schemeName: {
            $arrayElemAt: ["$scheme_data.schemeName", 0],
          },
          price: {
            $arrayElemAt: ["$scheme_data.schemePrice", 0],
          },
        },
      },
      {
        $unset: ["scheme_data"],
      },
    ];
    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    finalAggregateQuery.push({
      $match: matchQuery,
    });

    //-----------------------------------
    let dataFound = await dealerSchemeService.aggregateQuery(
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

    let result = await dealerSchemeService.aggregateQuery(finalAggregateQuery);
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
    let matchQuery = { companyId: companyId, isDeleted: false };
    if (req.query && Object.keys(req.query).length) {
      matchQuery = getQuery(matchQuery, req.query);
    }

    let dataExist = await dealerSchemeService.findAllWithQuery(matchQuery);

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
          from: "schemes",
          localField: "schemeId",
          foreignField: "_id",
          as: "scheme_data",
          pipeline: [
            {
              $project: {
                schemeName: 1,
                schemePrice: 1,
              },
            },
          ],
        },
      },

      {
        $addFields: {
          schemeName: {
            $arrayElemAt: ["$scheme_data.schemeName", 0],
          },
          price: {
            $arrayElemAt: ["$scheme_data.schemePrice", 0],
          },
        },
      },
      {
        $unset: ["scheme_data"],
      },
    ];
    let dataExist = await dealerSchemeService.aggregateQuery(additionalQuery);
    if (!dataExist.length) {
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

// getbydealerSchema api
exports.getbydealerId = async (req, res) => {
  try {
    let idToBeSearch = req.params.id;
    let additionalQuery = [
      {
        $match: {
          dealerId: new mongoose.Types.ObjectId(idToBeSearch),
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
                lastName: 1,
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
          as: "scheme_data",
          pipeline: [
            {
              $project: {
                schemeName: 1,
                schemePrice: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          schemeName: {
            $arrayElemAt: ["$scheme_data.schemeName", 0],
          },
          price: {
            $arrayElemAt: ["$scheme_data.schemePrice", 0],
          },
          dealerName: {
            $arrayElemAt: ["$dealerData.firstName", 0],
          },
        },
      },
      {
        $unset: ["scheme_data", "dealerData"],
      },
    ];
    let dataExist = await dealerSchemeService.aggregateQuery(additionalQuery);

    if (!dataExist.length) {
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
    if (!(await dealerSchemeService.getOneByMultiField({ _id }))) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let deleted = await dealerSchemeService.getOneAndDelete({ _id });
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
    let dataExist = await dealerSchemeService.getOneByMultiField({ _id });
    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let isActive = dataExist.isActive ? false : true;

    let statusChanged = await dealerSchemeService.getOneAndUpdate(
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

exports.getDealerScheme = async (req, res) => {
  try {
    let companyId = req.params.companyid;
    let dealerIdToBeSearch = req.params.dealerid;
    //if no default query then pass {}
    let matchQuery = { companyId: companyId, isDeleted: false, isActive: true };
    if (req.query && Object.keys(req.query).length) {
      matchQuery = getQuery(matchQuery, req.query);
    }

    let getAllScheme = await schemeService.findAllWithQuery(matchQuery);

    if (!getAllScheme.length) {
      throw new ApiError(httpStatus.OK, "Scheme not found.");
    }

    let getDealerSchemes = await dealerSchemeService.findAllWithQuery({
      dealerId: dealerIdToBeSearch,
      companyId: companyId,
      isDeleted: false,
      isActive: true,
    });
    if (!getDealerSchemes.length) {
      throw new ApiError(httpStatus.OK, "Dealer Scheme not found.");
    }

    const DealerScheme = getAllScheme?.filter((obj) => {
      return !getDealerSchemes.some(
        (o) => JSON.stringify(o.schemeId) === JSON.stringify(obj._id)
      );
    });

    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      status: true,
      data: DealerScheme,
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