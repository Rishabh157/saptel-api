const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const userService = require("./UserService");
const userAccessService = require("../userAccess/UserAccessService");
const companyService = require("../company/CompanyService");
const branchService = require("../companyBranch/CompanyBranchService");
const callCenterService = require("../callCenterMaster/CallCenterMasterService");
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
const {
  userEnum,
  moduleType,
  actionType,
  userRoleType,
  userDepartmentType,
} = require("../../helper/enumUtils");
const { getSeniorUserRole } = require("./UserHelper");
const { getRedisClient } = require("../../../../database/redis");

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
      callCenterId,
      floorManagerId,
      teamLeadId,
      mySenior,
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

    if (branchId !== null && branchId !== undefined) {
      const isCompanyBranchExists = await branchService.findCount({
        _id: branchId,
        isDeleted: false,
      });
      if (!isCompanyBranchExists) {
        throw new ApiError(httpStatus.OK, "Invalid Company Branch");
      }
    }

    if (callCenterId !== null && callCenterId !== undefined) {
      const isCallCenterExists = await callCenterService.findCount({
        _id: callCenterId,
        isDeleted: false,
      });
      if (!isCallCenterExists) {
        throw new ApiError(httpStatus.OK, "Invalid call center");
      }
    }
    if (floorManagerId !== null && floorManagerId !== undefined) {
      const isFloorMangerExists = await userService.findCount({
        _id: floorManagerId,
        isDeleted: false,
      });
      if (!isFloorMangerExists) {
        throw new ApiError(httpStatus.OK, "Invalid Floor Manager");
      }
    }

    if (teamLeadId !== null && teamLeadId !== undefined) {
      const isTeamLeaderExists = await userService.findCount({
        _id: teamLeadId,
        isDeleted: false,
      });
      if (!isTeamLeaderExists) {
        throw new ApiError(httpStatus.OK, "Invalid Team Leader");
      }
    }
    if (mySenior !== null) {
      const isMySeniorExists = await userService.findCount({
        _id: mySenior,
        isDeleted: false,
      });
      if (!isMySeniorExists) {
        throw new ApiError(httpStatus.OK, "Invalid Senior!");
      }
    }

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
    //
    //------------------create data-------------------

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
      callCenterId,
      floorManagerId,
      teamLeadId,
      mySenior,
    } = req.body;
    if (req.userData.userType !== userEnum.user) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        `You do not have authority to access this.`
      );
    }

    let idToBeSearch = req.userData.Id;
    if (mySenior !== null) {
      const isMySeniorExists = await userService.findCount({
        _id: mySenior,
        isDeleted: false,
      });
      if (!isMySeniorExists) {
        throw new ApiError(httpStatus.OK, "Invalid Senior!");
      }
    }
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

    if (callCenterId !== null && callCenterId !== undefined) {
      const isCallCenterExists = await callCenterService.findCount({
        _id: callCenterId,
        isDeleted: false,
      });
      if (!isCallCenterExists) {
        throw new ApiError(httpStatus.OK, "Invalid call center");
      }
    }
    if (floorManagerId !== null && floorManagerId !== undefined) {
      const isFloorMangerExists = await userService.findCount({
        _id: floorManagerId,
        isDeleted: false,
      });
      if (!isFloorMangerExists) {
        throw new ApiError(httpStatus.OK, "Invalid Floor Manager");
      }
    }

    if (teamLeadId !== null && teamLeadId !== undefined) {
      const isTeamLeaderExists = await userService.findCount({
        _id: teamLeadId,
        isDeleted: false,
      });
      if (!isTeamLeaderExists) {
        throw new ApiError(httpStatus.OK, "Invalid Team Leader");
      }
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
    let { userName, mobile, companyId, branchId, userDepartment, userRole } =
      req.body;
    let deviceId = req.headers["device-id"];

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

    // if department and roll same

    if (
      datafound?.userDepartment !== userDepartment ||
      datafound?.userRole !== userRole
    ) {
      try {
        await userAccessService?.getOneByIdAndDelete({
          userId: datafound?._id,
        });
        const tokenKey = `${datafound?._id}*`;
        const redisClient = await getRedisClient();
        if (!redisClient) {
          throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            "Failed to connect to Redis."
          );
        }
        const allRedisValue = await redisClient.keys(tokenKey);

        const deletePromises = allRedisValue?.map(
          async (key) => await redisClient.del(key)
        );
        await Promise.all(deletePromises);
      } catch (error) {
        console.error("Error deleting keys:", error);
        // Handle error here, such as logging or sending alerts
      }
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
    let {
      _id: userId,
      userType,
      firstName,

      lastName,
      email,
      companyId: newCompanyId,
    } = dataUpdated;
    let token = await tokenCreate(dataUpdated);
    if (!token) {
      throw new ApiError(
        httpStatus.OK,
        "Something went wrong. Please try again later."
      );
    }
    let refreshToken = await refreshTokenCreate(dataUpdated);
    if (!refreshToken) {
      throw new ApiError(
        httpStatus.OK,
        "Something went wrong. Please try again later."
      );
    }
    const redisClient = await getRedisClient();
    if (!redisClient) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Failed to connect to Redis."
      );
    }
    await redisClient.set(userId + deviceId, token + "***" + refreshToken);
    const redisValue = await redisClient.get(userId + deviceId);
    if (redisValue) {
      return res.status(httpStatus.OK).send({
        message: "updated successfully!",
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
          companyId: newCompanyId,
          branchId: branchId,
        },
        status: true,
        code: null,
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

// update user company

exports.updateUserCompany = async (req, res) => {
  try {
    let { companyId } = req.body;
    let deviceId = req.headers["device-id"];

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

    //------------------Find data-------------------
    let datafound = await userService.getOneByMultiField({ _id: idToBeSearch });
    if (!datafound) {
      throw new ApiError(httpStatus.OK, `User not found.`);
    }

    // if department and roll same

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
    let {
      _id: userId,
      userType,
      firstName,
      userName,
      lastName,
      email,
      userRole,
      branchId,
      companyId: newCompanyId,
    } = dataUpdated;
    const tokenKey = `${dataUpdated?._id}*`;
    const redisClient = await getRedisClient();
    if (!redisClient) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Failed to connect to Redis."
      );
    }
    const allRedisValue = await redisClient.keys(tokenKey);

    const deletePromises = allRedisValue?.map(
      async (key) => await redisClient.del(key)
    );
    await Promise.all(deletePromises);
    let token = await tokenCreate(dataUpdated);
    if (!token) {
      throw new ApiError(
        httpStatus.OK,
        "Something went wrong. Please try again later."
      );
    }
    let refreshToken = await refreshTokenCreate(dataUpdated);
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
        message: "updated successfully!",
        data: {
          token: token,
          refreshToken: refreshToken,
          userId: userId,
          fullName: `${firstName} ${lastName}`,
          firstName: firstName,
          lastName: lastName,
          email: email,
          // mobile: mobile,
          userName: userName,
          userType: userType,
          userRole: userRole ? userRole : "ADMIN",
          companyId: newCompanyId,
          branchId: branchId,
        },
        status: true,
        code: null,
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
    let objectIdFileds = ["companyId", "branchId", "callCenterId"];
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
        $lookup: {
          from: "callcentermasters",
          localField: "callCenterId",
          foreignField: "_id",
          as: "callcenterData",
          pipeline: [
            {
              $project: {
                callCenterName: 1,
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
          callCenterName: {
            $arrayElemAt: ["$callcenterData.callCenterName", 0],
          },
        },
      },
      {
        $unset: ["branch_data", "callcenterData"],
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
    let userRoleData = await getUserRoleData(req);
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
    let userRoleData = await getUserRoleData(req);
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

// get sr exicutive via zonal manager

exports.getSrExicutive = async (req, res) => {
  try {
    let zmid = req.params.zmid;

    //if no default query then pass {}
    let matchQuery = {
      companyId: new mongoose.Types.ObjectId(req.userData.companyId),
      isDeleted: false,
    };

    let userData = await userService?.getOneByMultiField({
      isDeleted: false,
      isActive: true,
      _id: zmid,
    });
    if (!userData) {
      throw new ApiError(httpStatus.OK, "Invalid zonal manager");
    }
    let flag = false;
    if (userData?.userRole === userRoleType.managerArea) {
      flag = true;
      var jrUsers = await userService?.aggregateQuery([
        {
          $match: {
            isDeleted: false,
            isActive: true,
            userRole: userRoleType.srEXECUTIVEArea,
            mySenior: new mongoose.Types.ObjectId(zmid),
          },
        },
      ]);
    }
    let additionalQuery = [{ $match: matchQuery }];

    let dataExist = await userService.aggregateQuery(additionalQuery);

    if (!jrUsers?.length && !dataExist?.length) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successfull.",
        status: true,
        data: flag ? jrUsers : dataExist,
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

// get jr exicutive via sr exicutive

exports.getJrExicutive = async (req, res) => {
  try {
    let zeid = req.params.zeid;

    //if no default query then pass {}

    let userData = await userService?.getOneByMultiField({
      isDeleted: false,
      isActive: true,
      _id: zeid,
    });
    if (!userData) {
      throw new ApiError(httpStatus.OK, "Invalid zonal Exicutive");
    }

    let jrUsers = await userService?.aggregateQuery([
      {
        $match: {
          isDeleted: false,
          isActive: true,
          userRole: userRoleType.EXECUTIVEArea,
          mySenior: new mongoose.Types.ObjectId(zeid),
        },
      },
    ]);

    if (!jrUsers?.length) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successfull.",
        status: true,
        data: jrUsers,
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

// get batch assigne users

exports.getBatchAssignes = async (req, res) => {
  try {
    //if no default query then pass {}
    let matchQuery = {
      companyId: new mongoose.Types.ObjectId(req.userData.companyId),
      userRole: userRoleType.srManagerDistribution,
      // {
      //   $in: [userRoleType.srManagerDistribution, userRoleType.managerArea],
      // }
      isDeleted: false,
      isActive: true,
    };

    let additionalQuery = [{ $match: matchQuery }];
    // let userRoleData = await getUserRoleData(req);
    // let fieldsToDisplay = getFieldsToDisplay(
    //   moduleType.user,
    //   userRoleData,
    //   actionType.listAll
    // );
    let dataExist = await userService.aggregateQuery(additionalQuery);
    // let allowedFields = getAllowedField(fieldsToDisplay, dataExist);

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
    let userRoleData = await getUserRoleData(req);
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

exports.getAllDistributionUser = async (req, res) => {
  try {
    let companyId = req.userData.companyId;
    let role = req.params.role;
    let userRole = [];
    if (role === "manager") {
      // userRole.push("SR_MANAGER_DISTRIBUTION");
      userRole.push(userRoleType.managerArea);
    }
    if (role === "executive") {
      userRole.push(userRoleType.srEXECUTIVEArea);
      userRole.push(userRoleType.EXECUTIVEArea);
    }
    //if no default query then pass {}
    let matchQuery = {
      companyId: companyId,
      isDeleted: false,
      userDepartment: userDepartmentType.distributionDepartment,
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
//get floor managers

exports.getAllFloorManagers = async (req, res) => {
  try {
    let { companyid, callcenterid, departmentid } = req.params;
    let userRoleSales = [
      userRoleType.managerSalesCenter,
      userRoleType.asstManagerSalesCenter,
    ];
    let userRoleCustomer = [
      userRoleType.customerCareManager,
      userRoleType.customerCareAm,
    ];
    const isSales = departmentid === userDepartmentType.salesDepartment;

    let matchQuery = {
      companyId: companyid,
      callCenterId: callcenterid,
      isDeleted: false,
      userDepartment: isSales
        ? userDepartmentType.salesDepartment
        : userDepartmentType.customerCareDepartement,
      userRole: { $in: isSales ? userRoleSales : userRoleCustomer },
    };

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

//get Team leads

exports.getAllTeamLeads = async (req, res) => {
  try {
    let { companyid, callcenterid, departmentid } = req.params;
    let userRoleSales = [
      userRoleType.srTeamLeaderOrSrEXECUTIVEMIS,
      userRoleType.teamLeaderOrEXECUTIVESalesCenter,
    ];
    let userRoleCustomer = [
      userRoleType.customerCareTeamLead,
      userRoleType.customerCareSrEx,
    ];
    const isSales = departmentid === userDepartmentType.salesDepartment;

    let matchQuery = {
      companyId: companyid,
      callCenterId: callcenterid,
      isDeleted: false,
      userDepartment: isSales
        ? userDepartmentType.salesDepartment
        : userDepartmentType.customerCareDepartement,
      userRole: { $in: isSales ? userRoleSales : userRoleCustomer },
    };

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

// get all agents according to call center

exports.getAllAgents = async (req, res) => {
  try {
    let { callcenterid } = req.params;

    let matchQuery = {
      companyId: new mongoose.Types.ObjectId(req.userData.companyId),
      callCenterId: new mongoose.Types.ObjectId(callcenterid),
      isDeleted: false,
      isActive: true,
      userDepartment: {
        $in: [
          userDepartmentType.salesDepartment,
          userDepartmentType.customerCareDepartement,
        ],
      },
      isAgent: true,
    };

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

// get customer care agent

exports.getAllCustomerCareAgents = async (req, res) => {
  try {
    let matchQuery = {
      companyId: new mongoose.Types.ObjectId(req.userData.companyId),
      isDeleted: false,
      isActive: true,
      userDepartment: userDepartmentType.customerCareDepartement,
      isAgent: true,
    };

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

// get all users by user role
exports.getAllUsers = async (req, res) => {
  try {
    let { userrole } = req.params;
    let { department, callCenterId } = req.body;
    let { companyId } = req.userData;
    let allSeniorRoles = [];
    let tempRole = userrole;
    for (let i = 0; i <= 10; i++) {
      let seniorUserRole = await getSeniorUserRole(tempRole);
      tempRole = seniorUserRole;
      if (seniorUserRole) {
        allSeniorRoles.push(seniorUserRole);
      }
    }
    // allSeniorRoles.push(userEnum.admin);

    let matchQuery = {
      companyId: new mongoose.Types.ObjectId(companyId),
      isDeleted: false,
      isActive: true,
      userRole: { $in: allSeniorRoles },
    };

    let newMatchQuery = {
      $and: [],
    };
    let flag = false;
    if (
      (department === userDepartmentType.customerCareDepartement ||
        department === userDepartmentType.salesDepartment) &&
      callCenterId
    ) {
      flag = true;
      newMatchQuery.$and.push({
        callCenterId: new mongoose.Types.ObjectId(callCenterId),
        companyId: new mongoose.Types.ObjectId(companyId),
        userRole: { $in: allSeniorRoles },
        isDeleted: false,
        isActive: true,
      });
    }
    let dataExist = await userService.aggregateQuery([
      { $match: flag ? newMatchQuery : matchQuery },
    ]);
    let adminUser = await userService?.findAllWithQuery({
      userRole: userEnum.admin,
      userType: userEnum.admin,
    });
    if (!dataExist.length && !adminUser.length) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successfull.",
        status: true,
        data: [...dataExist, ...adminUser],
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
    userName = userName.toLowerCase();
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
      throw new ApiError(httpStatus.OK, `User not found`);
    }
    let userFoundIsActive = await userService.getOneByMultiField({
      userName,
      isActive: true,
    });
    if (!userFoundIsActive) {
      throw new ApiError(
        httpStatus.OK,
        `User Deactivated please contact to higher authority to activate your account`
      );
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
      userDepartment,
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
    const redisClient = await getRedisClient();
    if (!redisClient) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Failed to connect to Redis."
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
          userDepartment: userDepartment,
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
    //
    const redisClient = await getRedisClient();
    if (!redisClient) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Failed to connect to Redis."
      );
    }
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
    const redisClient = await getRedisClient();
    if (!redisClient) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Failed to connect to Redis."
      );
    }
    await redisClient.set(
      userId + deviceId,
      newToken + "***" + newRefreshToken
    );
    const allRedisValue = await redisClient.keys(`${userId}*`);
    if (allRedisValue) {
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
    } else {
      throw new ApiError(
        httpStatus.OK,
        "Something went wrong. Please try again later."
      );
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

// change password by admin
exports.changePasswordByAdmin = async (req, res) => {
  try {
    const { newPassword, userId } = req.body;
    const deviceId = req.headers["device-id"];

    const user = await userService.getOneByMultiField({
      _id: userId,
      isDeleted: false,
    });

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password in the database
    user.password = hashedPassword;
    await user.save();
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
    const redisClient = await getRedisClient();
    if (!redisClient) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Failed to connect to Redis."
      );
    }
    await redisClient.set(
      userId + deviceId,
      newToken + "***" + newRefreshToken
    );
    const allRedisValue = await redisClient.keys(`${userId}*`);
    if (allRedisValue) {
      return res.status(httpStatus.OK).send({
        message: `Password change successful!`,
        data: null,
        status: true,
        code: "OK",
        issue: null,
      });
    } else {
      throw new ApiError(
        httpStatus.OK,
        "Something went wrong. Please try again later."
      );
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
