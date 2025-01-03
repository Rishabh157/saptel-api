const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const dispositionTwoService = require("./DispositionTwoService");
const dispositionThreeService = require("../dispositionThree/DispositionThreeService");

const { searchKeys } = require("./DispositionTwoSchema");
const { errorRes } = require("../../../utils/resError");
const {
  getQuery,
  getUserRoleData,
  getFieldsToDisplay,
  getAllowedField,
} = require("../../helper/utils");
const dispositionOneService = require("../dispositionOne/DispositionOneService");
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
const mongoose = require("mongoose");
const { moduleType, actionType } = require("../../helper/enumUtils");

// ============= add Disposition start  ================
exports.add = async (req, res) => {
  try {
    let { dispositionName, dispositionOneId, companyId } = req.body;
    let dispositionDisplayName = dispositionName;
    req.body.dispositionName = dispositionName?.replaceAll(" ", "");
    const isDispositionOneExists = await dispositionOneService.findCount({
      _id: dispositionOneId,
      isDeleted: false,
    });
    if (!isDispositionOneExists) {
      throw new ApiError(httpStatus.OK, "Invalid Disposition");
    }

    const isCompanyExists = await companyService.findCount({
      _id: companyId,
      isDeleted: false,
    });
    if (!isCompanyExists) {
      throw new ApiError(httpStatus.OK, "Invalid Company");
    }
    // -----------------------check duplicate exist --------------------
    let dataExist = await dispositionTwoService.isExists([{ dispositionName }]);
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }

    // ----------------------create data-------------------------
    let dataCreated = await dispositionTwoService.createNewData({
      ...req.body,
      dispositionDisplayName: dispositionDisplayName,
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
// =============add Disposition start end================

// =============update Disposition start================
exports.update = async (req, res) => {
  try {
    let { dispositionName, dispositionOneId, companyId } = req.body;

    let idToBeSearch = req.params.id;
    let dataExist = await dispositionTwoService.isExists(
      [{ dispositionName }],
      idToBeSearch
    );
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }
    const isDispositionOneExists = await dispositionOneService.findCount({
      _id: dispositionOneId,
      isDeleted: false,
    });
    if (!isDispositionOneExists) {
      throw new ApiError(httpStatus.OK, "Invalid Disposition");
    }
    const isCompanyExists = await companyService.findCount({
      _id: companyId,
      isDeleted: false,
    });
    if (!isCompanyExists) {
      throw new ApiError(httpStatus.OK, "Invalid Company");
    }
    // ------------------------ find data ---------------------
    let dataFound = await dispositionTwoService.getOneByMultiField({
      _id: idToBeSearch,
    });
    if (!dataFound) {
      throw new ApiError(httpStatus.OK, `DispositionTwo not found.`);
    }

    let dataUpdated = await dispositionTwoService.getOneAndUpdate(
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
// =============update Disposition end================

// =============get Disposition start================
exports.get = async (req, res) => {
  try {
    //if no default query then pass {}
    let matchQuery = {
      isDeleted: false,
      isActive: true,
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
          from: "dispositionones",
          localField: "dispositionOneId",
          foreignField: "_id",
          as: "dispositionData",
          pipeline: [
            {
              $project: {
                dispositionName: 1,
                dispositionDisplayName: 1,
              },
            },
          ],
        },
      },

      {
        $addFields: {
          dispostionOneLabel: {
            $arrayElemAt: ["$dispositionData.dispositionName", 0],
          },
          dispostionOneDisplayLabel: {
            $arrayElemAt: ["$dispositionData.dispositionDisplayName", 0],
          },
        },
      },
      {
        $unset: ["dispositionData"],
      },
    ];

    let userRoleData = await getUserRoleData(req);
    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.dispositionTwo,
      userRoleData,
      actionType.listAll
    );
    let dataExist = await dispositionTwoService.aggregateQuery(additionalQuery);
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

// =============get Disposition unauth start================
exports.getAuth = async (req, res) => {
  try {
    //if no default query then pass {}
    let matchQuery = {
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
          from: "dispositionones",
          localField: "dispositionOneId",
          foreignField: "_id",
          as: "dispositionData",
          pipeline: [
            {
              $project: {
                dispositionName: 1,
                dispositionDisplayName: 1,
              },
            },
          ],
        },
      },

      {
        $addFields: {
          dispostionOneLabel: {
            $arrayElemAt: ["$dispositionData.dispositionName", 0],
          },
          dispostionOneDisplayLabel: {
            $arrayElemAt: ["$dispositionData.dispositionDisplayName", 0],
          },
        },
      },
      {
        $unset: ["dispositionData"],
      },
    ];

    let dataExist = await dispositionTwoService.aggregateQuery(additionalQuery);

    if (!dataExist || !dataExist?.length) {
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
// =============update Disposition start end================

// =============get DispositionTwo by Id start================
exports.getById = async (req, res) => {
  try {
    _id = req.params.id;

    let additionalQuery = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(_id),
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: "dispositionones",
          localField: "dispositionOneId",
          foreignField: "_id",
          as: "dispositionData",
          pipeline: [
            {
              $project: {
                dispositionName: 1,
                dispositionDisplayName: 1,
              },
            },
          ],
        },
      },

      {
        $addFields: {
          dispostionOneLabel: {
            $arrayElemAt: ["$dispositionData.dispositionName", 0],
          },
          dispostionOneDisplayLabel: {
            $arrayElemAt: ["$dispositionData.dispositionDisplayName", 0],
          },
        },
      },
      {
        $unset: ["dispositionData"],
      },
    ];

    let userRoleData = await getUserRoleData(req);
    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.dispositionTwo,
      userRoleData,
      actionType.view
    );
    let dataExist = await dispositionTwoService.aggregateQuery(additionalQuery);
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
// =============get DispositionTwo by Id  end================

// =============get all DispositionTwo by Id of DispositionOne Id start================
exports.getByDispositionOneId = async (req, res) => {
  try {
    dispositionOneId = req.params.id;

    let additionalQuery = [
      {
        $match: {
          dispositionOneId: new mongoose.Types.ObjectId(dispositionOneId),
          isDeleted: false,
          isActive: true,
        },
      },
      {
        $lookup: {
          from: "dispositionones",
          localField: "dispositionOneId",
          foreignField: "_id",
          as: "dispositionData",
          pipeline: [
            {
              $project: {
                dispositionName: 1,
                dispositionDisplayName: 1,
              },
            },
          ],
        },
      },

      {
        $addFields: {
          dispostionOneLabel: {
            $arrayElemAt: ["$dispositionData.dispositionName", 0],
          },
          dispostionOneDisplayLabel: {
            $arrayElemAt: ["$dispositionData.dispositionDisplayName", 0],
          },
        },
      },
      {
        $unset: ["dispositionData"],
      },
    ];
    let dataExist = await dispositionTwoService.aggregateQuery(additionalQuery);

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
// =============get all DispositionTwo by Id of DispositionOne Id start end================

// =============all filter pagination api start================
exports.getFilterPagination = async (req, res) => {
  try {
    let dateFilter = req.body.dateFilter;
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
    // -----------------to send only active data on web-----------------
    if (req.path.includes("/app/") || req.path.includes("/app")) {
      matchQuery.$and.push({ isActive: true });
    }

    let { orderBy, orderByValue } = getOrderByAndItsValue(
      req.body.orderBy,
      req.body.orderByValue
    );
    // -----------------------------

    // ---------------check search keys valid-----------------

    let searchQueryCheck = checkInvalidParams(searchIn, searchKeys);

    if (searchQueryCheck && !searchQueryCheck.status) {
      return res.status(httpStatus.OK).send({
        ...searchQueryCheck,
      });
    }
    // ---------------------------------

    // ----------------get searchQuery-------------

    const searchQuery = getSearchQuery(searchIn, searchKeys, searchValue);
    if (searchQuery && searchQuery.length) {
      matchQuery.$and.push({ $or: searchQuery });
    }
    // -------------------------------

    // ----------------------get range filter query--------------------
    const rangeQuery = getRangeQuery(rangeFilterBy);
    if (rangeQuery && rangeQuery.length) {
      matchQuery.$and.push(...rangeQuery);
    }
    // -------------------------------

    // ---------------get filter query---------------
    let booleanFields = [];
    let numberFileds = [];
    let objectIdFields = ["dispositionOneId", "companyId "];

    const filterQuery = getFilterQuery(
      filterBy,
      booleanFields,
      numberFileds,
      objectIdFields
    );
    if (filterQuery && filterQuery.length) {
      matchQuery.$and.push(...filterQuery);
    }
    // ----------------------------------

    // ---------calander filter---------
    // ---------ToDo : for date filter---------

    let allowedDateFiletrKeys = ["createdAt", "updatedAt"];

    const datefilterQuery = await getDateFilterQuery(
      dateFilter,
      allowedDateFiletrKeys
    );
    if (datefilterQuery && datefilterQuery.length) {
      matchQuery.$and.push(...datefilterQuery);
    }
    //----------------calander filter----------
    //----------------------------

    // -------------for lookups , project , addfields or group in aggregate pipeline form dynamic quer in additionalQuery array-----------
    let additionalQuery = [
      {
        $lookup: {
          from: "dispositionones",
          localField: "dispositionOneId",
          foreignField: "_id",
          as: "dispositionData",
          pipeline: [
            {
              $project: {
                dispositionName: 1,
                dispositionDisplayName: 1,
              },
            },
          ],
        },
      },

      {
        $addFields: {
          dispostionOneLabel: {
            $arrayElemAt: ["$dispositionData.dispositionName", 0],
          },
          dispostionOneDisplayLabel: {
            $arrayElemAt: ["$dispositionData.dispositionDisplayName", 0],
          },
        },
      },
      {
        $unset: ["dispositionData"],
      },
    ];
    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    finalAggregateQuery.push({
      $match: matchQuery,
    });
    // ------------------------------------------
    let dataFound = await dispositionTwoService.aggregateQuery(
      finalAggregateQuery
    );
    if (dataFound.length === 0) {
      throw new ApiError(httpStatus.OK, `No data Found`);
    }

    let { limit, page, totalData, skip, totalPages } =
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
      moduleType.dispositionTwo,
      userRoleData,
      actionType.pagination
    );
    let result = await dispositionTwoService.aggregateQuery(
      finalAggregateQuery
    );
    let allowedFields = getAllowedField(fieldsToDisplay, result);

    if (allowedFields?.length) {
      return res.status(200).send({
        data: allowedFields,
        totalPage: totalPages,
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

// =============statusChange  start================
exports.statusChange = async (req, res) => {
  try {
    let _id = req.params.id;
    let dataExist = await dispositionTwoService.getOneByMultiField({ _id });
    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }

    let isActive = dataExist.isActive ? false : true;

    let statusChanged = await dispositionTwoService.getOneAndUpdate(
      {
        _id,
      },
      {
        isActive,
      }
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
// =============statusChange end================

// =============delete api start==================
// exports.deleteDocument = async (req, res) => {
//   try {
//     let _id = req.params.id;
//     if (!(await dispositionTwoService.getOneByMultiField({ _id }))) {
//       throw new ApiError(httpStatus.OK, "Data not found.");
//     }

//     const deleteRefCheck = await checkIdInCollectionsThenDelete(
//       collectionArrToMatch,
//       "dispositionTwoId",
//       _id
//     );

//     if (deleteRefCheck.status === true) {
//       let deleted = await dispositionTwoService.getOneAndDelete({ _id });
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
