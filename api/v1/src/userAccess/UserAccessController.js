const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const userAccessService = require("./UserAccessService");
const userService = require("../user/UserService");
const { searchKeys } = require("./UserAccessSchema");
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

// add start
// exports.add = async (req, res) => {
//   try {
//     let { userId, userRoleId } = req.body;
//     /**
//      * check duplicate exist
//      */

//     let dataExist = await userAccessService.isExists(
//       [{ userId }, { userRoleId }],
//       false,
//       true
//     );
//     if (dataExist.exists && dataExist.existsSummary) {
//       throw new ApiError(httpStatus.OK, dataExist.existsSummary);
//     }

//     //------------------create data-------------------
//     let dataCreated = await userAccessService.createNewData({ ...req.body });

//     if (dataCreated) {
//       return res.status(httpStatus.CREATED).send({
//         message: "Added successfully.",
//         data: dataCreated,
//         status: true,
//         code: null,
//         issue: null,
//       });
//     } else {
//       throw new ApiError(httpStatus.NOT_IMPLEMENTED, `Something went wrong.`);
//     }
//   } catch (err) {
//     let errData = errorRes(err);
//     logger.info(errData.resData);
//     let { message, status, data, code, issue } = errData.resData;
//     return res
//       .status(errData.statusCode)
//       .send({ message, status, data, code, issue });
//   }
// };

exports.add = async (req, res) => {
  try {
    let { userId, departmentId, userRoleId } = req.body;

    /**
     * check user exist
     */
    if (userId) {
      let userExist = await userService.getOneByMultiField({
        _id: userId,
      });
      if (!userExist) {
        throw new ApiError(httpStatus.OK, "User not found.");
      }
    }

    /**
     * check department exist
     */

    /**
     * check duplicate exist
     */

    if (userId === null) {
      let dataExistWithPosition = await userAccessService.getOneByMultiField({
        userRoleId: userRoleId,
        isDeleted: false,
      });

      if (dataExistWithPosition) {
        let dataUpdated = await userAccessService.updateMany(
          {
            userRoleId: userRoleId,
            isDeleted: false,
          },
          {
            $set: {
              module: req.body.module,
            },
          }
        );
        if (dataUpdated) {
          return res.status(httpStatus.CREATED).send({
            message: "Updated successfully.",
            data: dataUpdated,
            status: true,
            code: "OK",
            issue: null,
          });
        }
      } else {
        let dataCreated = await userAccessService.createNewData({
          ...req.body,
        });

        if (dataCreated) {
          return res.status(httpStatus.CREATED).send({
            message: "Added successfully.",
            data: dataCreated,
            status: true,
            code: "OK",
            issue: null,
          });
        } else {
          throw new ApiError(
            httpStatus.NOT_IMPLEMENTED,
            `Something went wrong.`
          );
        }
      }
    } else {
      let dataExist = await userAccessService.getOneByMultiField({
        userId: userId,
      });

      if (dataExist) {
        let dataUpdated = await userAccessService.getOneAndUpdate(
          {
            _id: dataExist._id,
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
            code: "OK",
            issue: null,
          });
        }
      } else {
        let dataCreated = await userAccessService.createNewData({
          ...req.body,
        });

        if (dataCreated) {
          return res.status(httpStatus.CREATED).send({
            message: "Added successfully.",
            data: dataCreated,
            status: true,
            code: "OK",
            issue: null,
          });
        } else {
          throw new ApiError(
            httpStatus.NOT_IMPLEMENTED,
            `Something went wrong.`
          );
        }
      }
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
    // let { userId, departmentId } = req.body;

    let idToBeSearch = req.params.id;
    // let dataExist = await userAccessService.isExists(
    //   [{ userId }, { departmentId }],
    //   idToBeSearch,
    //   true
    // );
    // if (dataExist.exists && dataExist.existsSummary) {
    //   throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    // }
    //------------------Find data-------------------
    let datafound = await userAccessService.getOneByMultiField({
      userId: idToBeSearch,
    });
    if (!datafound) {
      throw new ApiError(httpStatus.OK, `User not found.`);
    }

    let dataUpdated = await userAccessService.getOneAndUpdate(
      {
        userId: idToBeSearch,
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

//update all by deaprtmentid
exports.userRoleUpdate = async (req, res) => {
  try {
    // let { userId, departmentId } = req.body;

    let idToBeSearch = req.params.id;
    //------------------Find data-------------------
    let datafound = await userAccessService.findAllWithQuery({
      userRoleId: idToBeSearch,
    });

    if (!datafound) {
      throw new ApiError(httpStatus.OK, `UserAccess not found.`);
    }

    let dataUpdated = await userAccessService.updateMany(
      {
        userRoleId: idToBeSearch,
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
    let objectIdFields = [];
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
    let additionalQuery = [];

    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    finalAggregateQuery.push({
      $match: matchQuery,
    });

    //-----------------------------------
    let dataFound = await userAccessService.aggregateQuery(finalAggregateQuery);
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

    let result = await userAccessService.aggregateQuery(finalAggregateQuery);
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
    const userId = req.query.userId;
    const userRoleId = req.query.userRoleId;
    let isUserExists = await userAccessService.getOneByMultiField({
      userId: userId,
      isDeleted: false,
    });

    let matchQueryUser = {};
    if (userId && isUserExists) {
      matchQueryUser["userId"] = userId;
    }
    if (userRoleId && !matchQueryUser["userId"]) {
      matchQueryUser["userRoleId"] = userRoleId;
    }
    // let matchQueryUserRole = { isDeleted: false, userRoleId: userRoleId };
    // if (req.query && Object.keys(req.query).length) {
    //   matchQuery = getQuery(matchQuery, req.query);
    // }

    let dataExist = await userAccessService.getOneByMultiField(
      { ...matchQueryUser },
      {
        "module._id": 0,
        "module.moduleAction._id": 0,
        "module.moduleAction.fields._id": 0,
      }
    );

    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successfull.",
        status: true,
        data: dataExist,
        userId: userId ? userId : null,
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

//get by id
exports.getById = async (req, res) => {
  try {
    let idToBeSearch = req.params.userRoleId;
    let userId = req.params.userId;

    let dataExist = await userAccessService.getOneByMultiField({
      userRoleId: idToBeSearch,
      userId: userId,
      isDeleted: false,
    });

    if (!dataExist) {
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

//get by id
exports.isUserExists = async (req, res) => {
  try {
    let userId = req.params.id;

    let dataExist = await userAccessService.getOneByMultiField({
      userId: userId,
      isDeleted: false,
    });

    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      status: true,
      data: dataExist ? true : false,
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
//delete api
exports.deleteDocument = async (req, res) => {
  try {
    let _id = req.params.id;
    if (!(await userAccessService.getOneByMultiField({ _id }))) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let deleted = await userAccessService.getOneAndDelete({ _id });
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
    let dataExist = await userAccessService.getOneByMultiField({ _id });
    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let isActive = dataExist.isActive ? false : true;

    let statusChanged = await userAccessService.getOneAndUpdate(
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
