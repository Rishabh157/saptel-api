const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const initialCallOneService = require("../initialCallOne/InitialCallOneService");
const initialCallThreeService = require("./InitialCallThreeService");
const initialCallTwoService = require("../initialCallTwo/InitialCallTwoService");
const companyService = require("../company/CompanyService");
const mongoose = require("mongoose");
const {
  checkIdInCollectionsThenDelete,
  collectionArrToMatch,
} = require("../../helper/commonHelper");

const { searchKeys } = require("./InitialCallThreeSchema");
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
const { moduleType, actionType } = require("../../helper/enumUtils");

// ============= add  start  ================
exports.add = async (req, res) => {
  try {
    let {
      initialCallName,
      initialCallOneId,
      initialCallTwoId,
      companyId,
      callType,
    } = req.body;
    let initialCallDisplayName = initialCallName;
    req.body.initialCallName = initialCallName?.replaceAll(" ", "");
    const isCompanyExists = await companyService.findCount({
      _id: companyId,
      isDeleted: false,
    });
    if (!isCompanyExists) {
      throw new ApiError(httpStatus.OK, "Invalid Company");
    }

    const isInitialCallOneExists = await initialCallOneService.findCount({
      _id: initialCallOneId,
      isDeleted: false,
    });
    if (!isInitialCallOneExists) {
      throw new ApiError(httpStatus.OK, "Invalid InitialCallOne");
    }

    const isInitialCallTwoExists = await initialCallTwoService.findCount({
      _id: initialCallTwoId,
      isDeleted: false,
    });
    if (!isInitialCallTwoExists) {
      throw new ApiError(httpStatus.OK, "Invalid InitialCallTwo");
    }

    // -----------------------check duplicate exist --------------------
    let dataExist = await initialCallThreeService.isExists(
      [
        { initialCallName },
        { callType },
        { initialCallOneId },
        { initialCallTwoId },
      ],
      false,
      true
    );
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }

    // ----------------------create data-------------------------
    let dataCreated = await initialCallThreeService.createNewData({
      ...req.body,
      initialCallDisplayName: initialCallDisplayName,
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
// =============add  start end================

// =============update  start================
exports.update = async (req, res) => {
  try {
    let {
      initialCallName,
      initialCallOneId,
      initialCallTwoId,
      callType,
      companyId,
    } = req.body;

    let idToBeSearch = req.params.id;

    let dataExist = await initialCallThreeService.isExists(
      [
        { initialCallName },
        { callType },
        { initialCallOneId },
        { initialCallTwoId },
      ],
      idToBeSearch,
      true
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

    const isInitialCallOneExists = await initialCallOneService.findCount({
      _id: initialCallOneId,
      isDeleted: false,
    });
    if (!isInitialCallOneExists) {
      throw new ApiError(httpStatus.OK, "Invalid InitialCallOne");
    }

    const isInitialCallTwoExists = await initialCallTwoService.findCount({
      _id: initialCallTwoId,
      isDeleted: false,
    });
    if (!isInitialCallTwoExists) {
      throw new ApiError(httpStatus.OK, "Invalid InitialCallTwo");
    }

    // ------------------------ find data ---------------------
    let dataFound = await initialCallThreeService.getOneByMultiField({
      _id: idToBeSearch,
    });
    if (!dataFound) {
      throw new ApiError(httpStatus.OK, `InitialCallOne not found.`);
    }

    let dataUpdated = await initialCallThreeService.getOneAndUpdate(
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
// =============update  end================

// =============get  start================
exports.get = async (req, res) => {
  try {
    let companyId = req.params.companyid;

    //if no default query then pass {}
    let matchQuery = { isDeleted: false };
    if (req.query && Object.keys(req.query).length) {
      matchQuery = getQuery(matchQuery, req.query);
    }
    let additionalQuery = [
      {
        $match: matchQuery,
      },
      {
        $lookup: {
          from: "initialcalltwos",
          localField: "initialCallTwoId",
          foreignField: "_id",
          as: "initialcallTwoData",
          pipeline: [
            {
              $project: {
                initialCallName: 1,
                initialCallDisplayName: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "initialcallones",
          localField: "initialCallOneId",
          foreignField: "_id",
          as: "initialcallOneData",
          pipeline: [
            {
              $project: {
                initialCallName: 1,
                initialCallDisplayName: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          initialCallTwoLabel: {
            $arrayElemAt: ["$initialcallTwoData.initialCallName", 0],
          },
          initialCallOneLabel: {
            $arrayElemAt: ["$initialcallOneData.initialCallName", 0],
          },
          initialCallTwoDisplayLabel: {
            $arrayElemAt: ["$initialcallTwoData.initialCallDisplayName", 0],
          },
          initialCallOneDisplayLabel: {
            $arrayElemAt: ["$initialcallOneData.initialCallDisplayName", 0],
          },
        },
      },
      {
        $unset: ["initialcallTwoData", "initialcallOneData"],
      },
    ];

    let userRoleData = await getUserRoleData(req);
    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.initialCallerThree,
      userRoleData,
      actionType.listAll
    );
    let dataExist = await initialCallThreeService.aggregateQuery(
      additionalQuery
    );
    let allowedFields = getAllowedField(fieldsToDisplay, dataExist);

    if (!allowedFields || !allowedFields?.length) {
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
// =============update start end================

// =============get DispositionTwo by Id start================
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
          from: "initialcalltwos",
          localField: "initialCallTwoId",
          foreignField: "_id",
          as: "initialcallTwoData",
          pipeline: [
            {
              $project: {
                initialCallName: 1,
                initialCallDisplayName: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "initialcallones",
          localField: "initialCallOneId",
          foreignField: "_id",
          as: "initialcallOneData",
          pipeline: [
            {
              $project: {
                initialCallName: 1,
                initialCallDisplayName: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          initialCallTwoLabel: {
            $arrayElemAt: ["$initialcallTwoData.initialCallName", 0],
          },
          initialCallOneLabel: {
            $arrayElemAt: ["$initialcallOneData.initialCallName", 0],
          },
          initialCallTwoDisplayLabel: {
            $arrayElemAt: ["$initialcallTwoData.initialCallDisplayName", 0],
          },
          initialCallOneDisplayLabel: {
            $arrayElemAt: ["$initialcallOneData.initialCallDisplayName", 0],
          },
        },
      },
      {
        $unset: ["initialcallTwoData", "initialcallOneData"],
      },
    ];

    let userRoleData = await getUserRoleData(req);
    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.initialCallerThree,
      userRoleData,
      actionType.view
    );
    let dataExist = await initialCallThreeService.aggregateQuery(
      additionalQuery
    );
    let allowedFields = getAllowedField(fieldsToDisplay, dataExist);

    if (!allowedFields) {
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
// =============get DispositionTwo by Id  end================

// =============all filter pagination api start================
exports.allFilterPagination = async (req, res) => {
  try {
    var dateFilter = req.body.dateFilter;
    let searchValue = req.body.searchValue;
    let searchIn = req.body.searchIn;
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
    let booleanFields = ["isActive"];
    let numberFileds = [];
    let objectIdFields = ["initialCallOneId", "initialCallTwoId", "companyId"];

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
          from: "initialcalltwos",
          localField: "initialCallTwoId",
          foreignField: "_id",
          as: "initialcallTwoData",
          pipeline: [
            {
              $project: {
                initialCallName: 1,
                initialCallDisplayName: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "initialcallones",
          localField: "initialCallOneId",
          foreignField: "_id",
          as: "initialcallOneData",
          pipeline: [
            {
              $project: {
                initialCallName: 1,
                initialCallDisplayName: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          initialCallTwoLabel: {
            $arrayElemAt: ["$initialcallTwoData.initialCallName", 0],
          },
          initialCallOneLabel: {
            $arrayElemAt: ["$initialcallOneData.initialCallName", 0],
          },
          initialCallTwoDisplayLabel: {
            $arrayElemAt: ["$initialcallTwoData.initialCallDisplayName", 0],
          },
          initialCallOneDisplayLabel: {
            $arrayElemAt: ["$initialcallOneData.initialCallDisplayName", 0],
          },
        },
      },
      {
        $unset: ["initialcallTwoData", "initialcallOneData"],
      },
    ];

    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    finalAggregateQuery.push({
      $match: matchQuery,
    });

    //-----------------------------------
    let dataFound = await initialCallThreeService.aggregateQuery(
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

    let userRoleData = await getUserRoleData(req);
    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.initialCallerThree,
      userRoleData,
      actionType.pagination
    );
    let result = await initialCallThreeService.aggregateQuery(
      finalAggregateQuery
    );
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
// =============all filter pagination api end================

// =============delete api start==================
// exports.deleteDocument = async (req, res) => {
//   try {
//     let _id = req.params.id;
//     if (!(await initialCallThreeService.getOneByMultiField({ _id }))) {
//       throw new ApiError(httpStatus.OK, "Data not found.");
//     }
//     // ------find disposition (if use in other module / not)------

//     const deleteRefCheck = await checkIdInCollectionsThenDelete(
//       collectionArrToMatch,
//       "dispositionOneId",
//       _id
//     );

//     if (deleteRefCheck.status === true) {
//       let deleted = await initialCallThreeService.getOneAndDelete({ _id });
//       if (!deleted) {
//         throw new ApiError(httpStatus.OK, "Some thing went wrong.");
//       }
//     }

//     return res.status(httpStatus.OK).send({
//       message: deleteRefCheck.message,
//       status: deleteRefCheck.status,
//       data: null,
//       code: "OK",
//       issue: null,
//     });
//   } catch (err) {
//     let errData = errorRes(err);
//     logger.info(errData.resData);
//     let { message, status, data, code, issue } = errData.resData;
//     return res
//       .status(errData.statusCode)
//       .send({ message, status, data, code, issue });
//   }
// };

// =============delete api start end============

//  =============get all initialCallThree by Id of initialCallTwo Id start================
exports.getByInitialCallTwoId = async (req, res) => {
  try {
    const { initialCallTwoId, calltype } = req.params;
    let additionalQuery = [
      {
        $match: {
          initialCallTwoId: new mongoose.Types.ObjectId(initialCallTwoId),
          callType: calltype,
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: "initialcalltwos",
          localField: "initialCallTwoId",
          foreignField: "_id",
          as: "initialcallTwoData",
          pipeline: [
            {
              $project: {
                initialCallName: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          initialCallTwoLabel: {
            $arrayElemAt: ["$initialcallTwoData.initialCallName", 0],
          },
        },
      },
      {
        $unset: ["initialcallTwoData"],
      },
    ];
    let dataExist = await initialCallThreeService.aggregateQuery(
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
//  =============get all initialCallThree by Id of initialCallTwo Id end================

//statusChange
exports.statusChange = async (req, res) => {
  try {
    let _id = req.params.id;
    let dataExist = await initialCallThreeService.getOneByMultiField({ _id });
    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let isActive = dataExist.isActive ? false : true;

    let statusChanged = await initialCallThreeService.getOneAndUpdate(
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
