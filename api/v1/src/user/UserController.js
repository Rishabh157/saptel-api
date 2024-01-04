const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const userService = require("./UserService");
const companyService = require("../company/CompanyService");
const branchService = require("../companyBranch/CompanyBranchService");
const jwt = require("jsonwebtoken");

const {
  checkIdInCollectionsThenDelete,
  collectionArrToMatch,
} = require("../../helper/commonHelper");

const { searchKeys } = require("./UserSchema");
const { errorRes } = require("../../../utils/resError");
const {
  getQuery,
  getUserRoleData,
  getFieldsToDisplay,
  getAllowedField,
  logOut,
} = require("../../helper/utils");
const bcryptjs = require("bcryptjs");
const otpHelper = require("../otp/OtpHelper");
const { sendMsg91Function } = require("../../helper/msgHelper");
const {
  tokenCreate,
  otpTokenCreate,
  refreshTokenCreate,
} = require("../../helper/tokenCreate");
const { isAfter } = require("date-fns");
const bcrypt = require("bcrypt");

const mongoose = require("mongoose");
const {
  getSearchQuery,
  checkInvalidParams,
  getRangeQuery,
  getFilterQuery,
  getDateFilterQuery,
  getLimitAndTotalCount,
  getOrderByAndItsValue,
} = require("../../helper/paginationFilterHelper");
const { userEnum, moduleType, actionType } = require("../../helper/enumUtils");
const redisClient = require("../../../../database/redis");

//add start
exports.add = async (req, res) => {
  try {
    let {
      firstName,
      lastName,
      userName,
      mobile,
      email,
      companyId,
      branchId,
      password,
      userDepartment,
      userRole,
      userType,
    } = req.body;

    if (companyId !== null && companyId !== undefined) {
      const isCompanyExists = await companyService.findCount({
        _id: companyId,
        isDeleted: false,
      });
      if (!isCompanyExists) {
        throw new ApiError(httpStatus.OK, "Invalid Company");
      }
    }

    if (branchId !== null && companyId !== undefined) {
      const isCompanyBranchExists = await branchService.findCount({
        _id: branchId,
        isDeleted: false,
      });
      if (!isCompanyBranchExists) {
        throw new ApiError(httpStatus.OK, "Invalid Company Branch");
      }
    }

    console.log("here");
    /**
     * check duplicate exist
     */
    let dataExist = await userService.isExists([{ userName }]);
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }
    // let randomPassword = generateRandomPassword();
    let hashedPassword = await bcryptjs.hash(password, 12);
    if (!hashedPassword) {
      throw new ApiError(
        httpStatus.OK,
        `Something went wrong with the password.`
      );
    }
    req.body.password = hashedPassword;

    if (mobile.length) {
      req.body.maskedPhoneNo = "******" + req.body.mobile.substring(6);
    } else {
      req.body.maskedPhoneNo = "";
    }
    // let dataToUpload = { ...req.body, password: hashedPassword };
    // console.log(dataToUpload);
    //------------------create data-------------------
    console.log("creating new data");
    let dataCreated = await userService.createNewData({ ...req.body });

    if (dataCreated) {
      return res.status(httpStatus.CREATED).send({
        message: `User added successfull`,
        data: {
          fullName: `${firstName} ${lastName}`,
          firstName: firstName,
          lastName: lastName,
          email: email,
          mobile: mobile,
          companyId: companyId,
          userType: userType,
          userDepartment: userDepartment,
          userRole: userRole,
        },
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

//update start
exports.update = async (req, res) => {
  try {
    let {
      firstName,
      lastName,
      mobile,
      email,
      companyId,
      branchId,
      userDepartment,
      userRole,
    } = req.body;
    if (req.userData.userType !== userEnum.user) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        `You do not have authority to access this.`
      );
    }

    let idToBeSearch = req.userData.Id;

    const isCompanyExists = await companyService.findCount({
      _id: companyId,
      isDeleted: false,
    });
    if (!isCompanyExists) {
      throw new ApiError(httpStatus.OK, "Invalid Company");
    }
    const isCompanyBranchExists = await branchService.findCount({
      _id: branchId,
      isDeleted: false,
    });
    if (!isCompanyBranchExists) {
      throw new ApiError(httpStatus.OK, "Invalid Company Branch");
    }

    /**
     * check duplicate exist
     */
    let dataExist = await userService.isExists([{ email }], [idToBeSearch]);
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }

    //------------------Find data-------------------
    let datafound = await userService.getOneByMultiField({ _id: idToBeSearch });
    if (!datafound) {
      throw new ApiError(httpStatus.OK, `User not found.`);
    }

    let dataUpdated = await userService.getOneAndUpdate(
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

//update start
exports.updateUser = async (req, res) => {
  try {
    let {
      firstName,
      lastName,
      userName,
      mobile,
      email,
      password,
      companyId,
      branchId,
      userDepartment,
      userRole,
    } = req.body;
    // if (req.userData.userType !== userEnum.user) {
    //   throw new ApiError(
    //     httpStatus.UNAUTHORIZED,
    //     `You do not have authority to access this.`
    //   );
    // }

    let idToBeSearch = req.params.id;

    const isCompanyExists = await companyService.findCount({
      _id: companyId,
      isDeleted: false,
    });
    if (!isCompanyExists) {
      throw new ApiError(httpStatus.OK, "Invalid Company");
    }
    const isCompanyBranchExists = await branchService.findCount({
      _id: branchId,
      isDeleted: false,
    });
    if (!isCompanyBranchExists) {
      throw new ApiError(httpStatus.OK, "Invalid Company Branch");
    }

    /**
     * check duplicate exist
     */
    let dataExist = await userService.isExists([{ userName }], [idToBeSearch]);
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }

    //------------------Find data-------------------
    let datafound = await userService.getOneByMultiField({ _id: idToBeSearch });
    if (!datafound) {
      throw new ApiError(httpStatus.OK, `User not found.`);
    }
    if (password) {
      let hashedPassword = await bcryptjs.hash(password, 12);
      if (!hashedPassword) {
        throw new ApiError(
          httpStatus.OK,
          `Something went wrong with the password.`
        );
      }
      req.body.password = hashedPassword;
    }
    if (mobile.length) {
      req.body.maskedPhoneNo = "******" + req.body.mobile.substring(6);
    } else {
      req.body.maskedPhoneNo = "";
    }
    let dataUpdated = await userService.getOneAndUpdate(
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
    // if (req.userData.userType === userEnum.user) {
    //   matchQuery.$and.push({
    //     _id: new mongoose.Types.ObjectId(req.userData.Id),
    //   });
    // }

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
    let objectIdFileds = ["companyId"];
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
          from: "companybranches",
          localField: "branchId",
          foreignField: "_id",
          as: "branch_data",
          pipeline: [
            {
              $project: {
                branchName: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          branchLabel: {
            $arrayElemAt: ["$branch_data.branchName", 0],
          },
        },
      },
      {
        $unset: ["branch_data"],
      },
    ];

    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    finalAggregateQuery.push({
      $match: matchQuery,
    });

    //-----------------------------------
    let dataFound = await userService.aggregateQuery(finalAggregateQuery);
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
    let userRoleData = await getUserRoleData(req, userService);
    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.user,
      userRoleData,
      actionType.pagination
    );

    let result = await userService.aggregateQuery(finalAggregateQuery);
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
    let companyId = req.params.companyid;

    //if no default query then pass {}
    let matchQuery = {
      companyId: companyId,
      isDeleted: false,
    };
    if (req.userData.userType === userEnum.user) {
      matchQuery["_id"] = req.userData.Id;
    }
    if (
      req.userData.userType !== userEnum.user &&
      req.query &&
      Object.keys(req.query).length
    ) {
      matchQuery = getQuery(matchQuery, req.query);
    }

    let additionalQuery = [
      { $match: matchQuery },
      {
        $lookup: {
          from: "companybranches",
          localField: "branchId",
          foreignField: "_id",
          as: "branch_data",
          pipeline: [
            {
              $project: {
                branchName: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          branchLabel: {
            $arrayElemAt: ["$branch_data.branchName", 0],
          },
        },
      },
      {
        $unset: ["branch_data"],
      },
    ];
    let userRoleData = await getUserRoleData(req, userService);
    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.user,
      userRoleData,
      actionType.listAll
    );
    let dataExist = await userService.aggregateQuery(additionalQuery);
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
          from: "companybranches",
          localField: "branchId",
          foreignField: "_id",
          as: "branch_data",
          pipeline: [
            {
              $project: {
                branchName: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          branchLabel: {
            $arrayElemAt: ["$branch_data.branchName", 0],
          },
        },
      },
      {
        $unset: ["branch_data"],
      },
    ];
    let userRoleData = await getUserRoleData(req, userService);
    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.user,
      userRoleData,
      actionType.view
    );
    let dataExist = await userService.aggregateQuery(additionalQuery);
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

exports.getAllDistributionUser = async (req, res) => {
  try {
    let companyId = req.params.companyid;
    let role = req.params.role;
    let userRole = [];
    if (role === "manager") {
      userRole.push("SR_MANAGER_DISTRIBUTION");
      userRole.push("MANAGER_AREA");
    }
    if (role === "executive") {
      userRole.push("SR_EXECUTIVE_AREA");
      userRole.push("EXECUTIVE_AREA");
    }
    //if no default query then pass {}
    let matchQuery = {
      companyId: companyId,
      isDeleted: false,
      userDepartment: "DISTRIBUTION_DEPARTMENT",
      userRole: { $in: userRole },
    };
    // if (req.userData.userType === userEnum.user) {
    //   matchQuery["_id"] = req.userData.Id;
    // }
    if (
      req.userData.userType !== userEnum.user &&
      req.query &&
      Object.keys(req.query).length
    ) {
      matchQuery = getQuery(matchQuery, req.query);
    }
    let dataExist = await userService.findAllWithQuery(matchQuery);
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
//delete api
exports.deleteDocument = async (req, res) => {
  try {
    let _id = req.params.id;
    if (req.userData.userType === userEnum.user) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        `You do not have authority to access this.`
      );
    }
    if (!(await userService.getOneByMultiField({ _id }))) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    const deleteRefCheck = await checkIdInCollectionsThenDelete(
      collectionArrToMatch,
      "userId",
      _id
    );

    if (deleteRefCheck.status === true) {
      let deleted = await userService.getOneAndDelete({ _id });
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
    if (req.userData.userType === userEnum.user) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        `You do not have authority to access this.`
      );
    }
    let dataExist = await userService.getOneByMultiField({ _id });
    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let isActive = dataExist.isActive ? false : true;

    let statusChanged = await userService.getOneAndUpdate(
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

/**
 *login
 */
exports.login = async (req, res) => {
  try {
    let userName = req.body.userName;
    let password = req.body.password;
    let deviceId = req.headers["device-id"];
    const userIP =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const userNewIp = userIP.replace("::ffff:", "");
    let userFound = await userService.getOneByMultiField({ userName });
    let userAllowedIp = userFound?.allowedIp;
    let isUserAllowed = false;
    userAllowedIp?.forEach((ele) => {
      if (ele === userNewIp) {
        isUserAllowed = true;
        return;
      }
    });

    if (!userFound) {
      throw new ApiError(httpStatus.OK, `User not found.`);
    }
    let matched = await bcrypt.compare(password, userFound?.password);
    if (!matched) {
      throw new ApiError(httpStatus.OK, `Invalid Pasword!`);
    }
    if (!isUserAllowed && userAllowedIp?.[0]?.length) {
      throw new ApiError(
        httpStatus.OK,
        `User not allowed to login, Due to IP restriction.`
      );
    }
    let {
      _id: userId,
      userType,
      firstName,
      mobile,
      lastName,
      email,
      companyId,
      userRole,
      branchId,
    } = userFound;

    let token = await tokenCreate(userFound);
    if (!token) {
      throw new ApiError(
        httpStatus.OK,
        "Something went wrong. Please try again later."
      );
    }
    let refreshToken = await refreshTokenCreate(userFound);
    if (!refreshToken) {
      throw new ApiError(
        httpStatus.OK,
        "Something went wrong. Please try again later."
      );
    }

    await redisClient.set(userId + deviceId, token + "***" + refreshToken);
    const redisValue = await redisClient.get(userId + deviceId);
    if (redisValue) {
      return res.status(httpStatus.OK).send({
        message: `Login successful!`,
        data: {
          token: token,
          refreshToken: refreshToken,
          userId: userId,
          fullName: `${firstName} ${lastName}`,
          firstName: firstName,
          lastName: lastName,
          email: email,
          mobile: mobile,
          userName: userName,
          userType: userType,
          userRole: userRole ? userRole : "ADMIN",
          companyId: companyId,
          branchId: branchId,
        },
        status: true,
        code: "OK",
        issue: null,
      });
    }
  } catch (err) {
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res.status(errData.statusCode).send({
      message,
      status,
      data,
      code,
      issue,
      ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
    });
  }
};

/**
 * verify otp
 */
exports.verifyOtp = async (req, res) => {
  try {
    let otp = req.body.otp;
    let { Id: userId, userType } = req.userData;

    let userExist = await userService.getOneByMultiField({
      _id: userId,
      userType,
    });
    if (!userExist) {
      throw new ApiError(httpStatus.OK, "User Not Found");
    }
    let { firstName, lastName, email, mobile } = userExist;

    let isOtpValid = await otpHelper.getOtpValidity(req.userData, otp);
    if (!isOtpValid.status) {
      throw new ApiError(httpStatus.OK, isOtpValid.message);
    }

    let token = await tokenCreate(userExist);
    if (!token) {
      throw new ApiError(httpStatus.OK, `Something went wrong`);
    }

    return res.status(httpStatus.OK).send({
      message: "Login Successfull.",
      status: true,
      data: {
        token: token,
        fullName: `${firstName} ${lastName}`,
        email: email,
        mobile: mobile,
      },
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

// refresh
exports.refreshToken = async (req, res) => {
  try {
    let refreshTokenValue = req.body.refreshToken;
    let deviceId = req.headers["device-id"];

    const decoded = await jwt.verify(
      refreshTokenValue,
      config.jwt_secret_refresh
    );
    if (!decoded) {
      throw new ApiError(httpStatus.OK, `Invalid refreshToken`);
    }
    const tokenKey = `${decoded.Id}*`;
    // const allKeys = await redisClient.keys();
    // console.log(allKeys, "redisClient.keys");
    const allRedisValue = await redisClient.keys(tokenKey);
    if (!allRedisValue.length) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        "Invalid token User not found."
      );
    }
    let userData = await userService.getOneByMultiField({
      _id: decoded.Id,
      isDeleted: false,
    });
    if (!userData) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        "Invalid token User not found."
      );
    }

    let newToken = await tokenCreate(userData);
    if (!newToken) {
      throw new ApiError(
        httpStatus.OK,
        "Something went wrong. Please try again later."
      );
    }
    let newRefreshToken = await refreshTokenCreate(userData);

    if (!newRefreshToken) {
      throw new ApiError(
        httpStatus.OK,
        "Something went wrong. Please try again later."
      );
    }

    await redisClient.set(
      decoded.Id + deviceId,
      newToken + "***" + newRefreshToken
    );

    return res.status(httpStatus.OK).send({
      message: `successfull!`,
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
      },
      status: true,
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

exports.changePassword = async (req, res) => {
  try {
    const deviceId = req.headers["device-id"];
    const token = req.headers["x-access-token"];
    const { currentPassword, newPassword, userId } = req.body;
    console.log(
      currentPassword,
      newPassword,
      userId,
      " currentPassword, newPassword, userId"
    );
    const decoded = await jwt.verify(token, config.jwt_secret);
    if (decoded.Id !== userId) {
      throw new ApiError(httpStatus.OK, `Invalid Token`);
    }
    const user = await userService.getOneByMultiField({
      _id: userId,
      isDeleted: false,
    }); // assuming you're using Passport.js or similar for authentication
    let { _id, userType, firstName, mobile, lastName, email, userName } = user;
    // Check if the current password matches the user's password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new ApiError(httpStatus.OK, `Current password not matched`);
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password in the database
    user.password = hashedPassword;
    await user.save();
    await logOut(req, true);
    let newToken = await tokenCreate(user);
    if (!newToken) {
      throw new ApiError(
        httpStatus.OK,
        "Something went wrong. Please try again later."
      );
    }
    let newRefreshToken = await refreshTokenCreate(user);

    if (!newRefreshToken) {
      throw new ApiError(
        httpStatus.OK,
        "Something went wrong. Please try again later."
      );
    }
    await redisClient.set(
      userId + deviceId,
      newToken + "***" + newRefreshToken
    );
    const allRedisValue = await redisClient.keys(`${userId}*`);
    return res.status(httpStatus.OK).send({
      message: `Password change successful!`,
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
        fullName: `${firstName} ${lastName}`,
        email: email,
        mobile: mobile,
        userName: userName,
      },
      status: true,
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

exports.logout = async (req, res) => {
  logOut(req, req.body.logoutAll);
  return res.status(httpStatus.OK).send({
    message: `Logout successfull!`,
    data: [],
    status: true,
    code: "OK",
    issue: null,
  });
};
