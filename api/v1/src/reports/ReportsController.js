const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const userService = require("../user/UserService");
const callCenterService = require("../callCenterMaster/CallCenterMasterService");
const { errorRes } = require("../../../utils/resError");

const orderInquiryService = require("../orderInquiry/OrderInquiryService");
const { getDateFilterQuery } = require("../../helper/paginationFilterHelper");

exports.agentOrderStatus = async (req, res) => {
  try {
    const { callCenterId, agentId, dateFilter } = req.body;
    let matchQuery = {
      $and: [{ isDeleted: false }],
    };
    let allowedDateFiletrKeys = ["createdAt", "updatedAt"];

    const datefilterQuery = await getDateFilterQuery(
      dateFilter,
      allowedDateFiletrKeys
    );
    if (datefilterQuery && datefilterQuery.length) {
      matchQuery.$and.push(...datefilterQuery);
    }
    const isCallCenterExists = await callCenterService.findCount({
      _id: callCenterId,
      isDeleted: false,
      isActive: true,
    });
    if (!isCallCenterExists) {
      throw new ApiError(httpStatus.OK, "Invalid Call center");
    }

    const agentExists = await userService.getOneByMultiField({
      _id: agentId,
      isDeleted: false,
      isActive: true,
    });
    if (!agentExists) {
      throw new ApiError(httpStatus.OK, "Invalid Agent");
    }

    if (req.path.includes("/app/") || req.path.includes("/app")) {
      matchQuery.$and.push({ isActive: true });
    }

    //----------------------------

    /**
     * check search keys valid
     **/

    let additionalQuery = [];
    additionalQuery.push({
      $match: { ...matchQuery, agentName: agentExists?.userName },
    });

    let result = await orderInquiryService.aggregateQuery(additionalQuery);

    if (result?.length) {
      return res.status(httpStatus.OK).send({
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
