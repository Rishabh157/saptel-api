const { default: mongoose } = require("mongoose");
const { userRoleType, orderStatusEnum } = require("../../helper/enumUtils");
const userService = require("../user/UserService");

exports.getQueryForComplaint = async (userRole, userId) => {
  let myQuery = [];
  switch (userRole) {
    case userRoleType.customerCareEx:
      myQuery.push({
        $match: {
          isActive: true,
          complaintById: new mongoose.Types.ObjectId(userId),
        },
      });

    case userRoleType.customerCareSrEx:
      let allJrOfExIs = await userService.findAllWithQuery({
        isDeleted: false,
        isActive: true,
        userRole: userRoleType.customerCareEx,
      });
      let allJrIdsOfEx = allJrOfExIs?.map((ele) => {
        return ele?._id;
      });
      myQuery.push({
        $match: {
          isActive: true,
          complaintById: {
            $in: [...allJrIdsOfEx, new mongoose.Types.ObjectId(userId)],
          },
        },
      });
    case userRoleType.customerCareTeamLead ||
      userRoleType.customerCareAm ||
      userRoleType.customerCareManager ||
      userRoleType.customerCareAvp:
      let allJrOfTLIs = await userService.findAllWithQuery({
        isDeleted: false,
        isActive: true,
        userRole: {
          $in: [userRoleType.customerCareEx, userRoleType.customerCareSrEx],
        },
      });
      let allJrIdsOfTL = allJrOfTLIs?.map((ele) => {
        return ele?._id;
      });
      myQuery.push({
        $match: {
          isActive: true,
          complaintById: {
            $in: [...allJrIdsOfTL],
          },
        },
      });

    default:
      break;
  }
  if (myQuery?.length) {
    return myQuery;
  } else {
    return false;
  }
};

exports.getQueryForhouseArrest = async (userRole, userId) => {
  let myQuery = [];
  switch (userRole) {
    case userRoleType.customerCareEx:
      myQuery.push({
        $match: {
          isActive: true,
          requestCreatedBy: new mongoose.Types.ObjectId(userId),
        },
      });

    case userRoleType.customerCareSrEx:
      let allJrOfExIs = await userService.findAllWithQuery({
        isDeleted: false,
        isActive: true,
        userRole: userRoleType.customerCareEx,
      });
      let allJrIdsOfEx = allJrOfExIs?.map((ele) => {
        return ele?._id;
      });
      myQuery.push({
        $match: {
          isActive: true,
          requestCreatedBy: {
            $in: [...allJrIdsOfEx, new mongoose.Types.ObjectId(userId)],
          },
        },
      });
    case userRoleType.customerCareTeamLead ||
      userRoleType.customerCareAm ||
      userRoleType.customerCareManager ||
      userRoleType.customerCareAvp:
      let allJrOfTLIs = await userService.findAllWithQuery({
        isDeleted: false,
        isActive: true,
        userRole: {
          $in: [userRoleType.customerCareEx, userRoleType.customerCareSrEx],
        },
      });
      let allJrIdsOfTL = allJrOfTLIs?.map((ele) => {
        return ele?._id;
      });
      myQuery.push({
        $match: {
          isActive: true,
          requestCreatedBy: {
            $in: [...allJrIdsOfTL],
          },
        },
      });

    default:
      break;
  }
  if (myQuery?.length) {
    return myQuery;
  } else {
    return false;
  }
};

exports.getQueryFormoneyBack = async (userRole, userId) => {
  let myQuery = [];
  switch (userRole) {
    case userRoleType.customerCareEx:
      myQuery.push({
        $match: {
          isActive: true,
          requestCreatedById: new mongoose.Types.ObjectId(userId),
        },
      });

    case userRoleType.customerCareSrEx:
      let allJrOfExIs = await userService.findAllWithQuery({
        isDeleted: false,
        isActive: true,
        userRole: userRoleType.customerCareEx,
      });
      let allJrIdsOfEx = allJrOfExIs?.map((ele) => {
        return ele?._id;
      });
      myQuery.push({
        $match: {
          isActive: true,
          requestCreatedById: {
            $in: [...allJrIdsOfEx, new mongoose.Types.ObjectId(userId)],
          },
        },
      });
    case userRoleType.customerCareTeamLead ||
      userRoleType.customerCareAm ||
      userRoleType.customerCareManager ||
      userRoleType.customerCareAvp:
      let allJrOfTLIs = await userService.findAllWithQuery({
        isDeleted: false,
        isActive: true,
        userRole: {
          $in: [userRoleType.customerCareEx, userRoleType.customerCareSrEx],
        },
      });
      let allJrIdsOfTL = allJrOfTLIs?.map((ele) => {
        return ele?._id;
      });
      myQuery.push({
        $match: {
          isActive: true,
          requestCreatedById: {
            $in: [...allJrIdsOfTL],
          },
        },
      });

    default:
      break;
  }
  if (myQuery?.length) {
    return myQuery;
  } else {
    return false;
  }
};

exports.getQueryForreplacement = async (userRole, userId) => {
  let myQuery = [];
  switch (userRole) {
    case userRoleType.customerCareEx:
      myQuery.push({
        $match: {
          isActive: true,
          requestCreatedById: new mongoose.Types.ObjectId(userId),
        },
      });

    case userRoleType.customerCareSrEx:
      let allJrOfExIs = await userService.findAllWithQuery({
        isDeleted: false,
        isActive: true,
        userRole: userRoleType.customerCareEx,
      });
      let allJrIdsOfEx = allJrOfExIs?.map((ele) => {
        return ele?._id;
      });
      myQuery.push({
        $match: {
          isActive: true,
          requestCreatedById: {
            $in: [...allJrIdsOfEx, new mongoose.Types.ObjectId(userId)],
          },
        },
      });
    case userRoleType.customerCareTeamLead ||
      userRoleType.customerCareAm ||
      userRoleType.customerCareManager ||
      userRoleType.customerCareAvp:
      let allJrOfTLIs = await userService.findAllWithQuery({
        isDeleted: false,
        isActive: true,
        userRole: {
          $in: [userRoleType.customerCareEx, userRoleType.customerCareSrEx],
        },
      });
      let allJrIdsOfTL = allJrOfTLIs?.map((ele) => {
        return ele?._id;
      });
      myQuery.push({
        $match: {
          isActive: true,
          requestCreatedById: {
            $in: [...allJrIdsOfTL],
          },
        },
      });

    default:
      break;
  }
  if (myQuery?.length) {
    return myQuery;
  } else {
    return false;
  }
};

exports.getQueryForinquiry = async (userRole, userId) => {
  let myQuery = [];
  switch (userRole) {
    case userRoleType.customerCareEx:
      myQuery.push({
        $match: {
          agentId: new mongoose.Types.ObjectId(userId),
          isActive: true,
          isDeleted: false,
          status: orderStatusEnum.inquiry,
        },
      });

    case userRoleType.customerCareSrEx:
      let allJrOfExIs = await userService.findAllWithQuery({
        isDeleted: false,
        isActive: true,
        userRole: userRoleType.customerCareEx,
      });
      let allJrIdsOfEx = allJrOfExIs?.map((ele) => {
        return ele?._id;
      });
      myQuery.push({
        $match: {
          agentId: {
            $in: [...allJrIdsOfEx, new mongoose.Types.ObjectId(userId)],
          },
          isActive: true,
          isDeleted: false,
          status: orderStatusEnum.inquiry,
        },
      });
    case userRoleType.customerCareTeamLead ||
      userRoleType.customerCareAm ||
      userRoleType.customerCareManager ||
      userRoleType.customerCareAvp:
      let allJrOfTLIs = await userService.findAllWithQuery({
        isDeleted: false,
        isActive: true,
        userRole: {
          $in: [userRoleType.customerCareEx, userRoleType.customerCareSrEx],
        },
      });
      let allJrIdsOfTL = allJrOfTLIs?.map((ele) => {
        return ele?._id;
      });
      myQuery.push({
        $match: {
          agentId: {
            $in: [...allJrIdsOfTL],
          },
          isActive: true,
          isDeleted: false,
          status: orderStatusEnum.inquiry,
        },
      });

    default:
      break;
  }
  if (myQuery?.length) {
    return myQuery;
  } else {
    return false;
  }
};

exports.getQueryFororder = async (userRole, userId) => {
  let myQuery = [];
  switch (userRole) {
    case userRoleType.customerCareEx:
      myQuery.push({
        $match: {
          agentId: new mongoose.Types.ObjectId(userId),
          isActive: true,
          isDeleted: false,
          status: {
            $in: [
              orderStatusEnum.fresh,
              orderStatusEnum.urgent,
              orderStatusEnum.prepaid,
            ],
          },
        },
      });

    case userRoleType.customerCareSrEx:
      let allJrOfExIs = await userService.findAllWithQuery({
        isDeleted: false,
        isActive: true,
        userRole: userRoleType.customerCareEx,
      });
      let allJrIdsOfEx = allJrOfExIs?.map((ele) => {
        return ele?._id;
      });
      myQuery.push({
        $match: {
          agentId: {
            $in: [...allJrIdsOfEx, new mongoose.Types.ObjectId(userId)],
          },
          isActive: true,
          isDeleted: false,
          status: {
            $in: [
              orderStatusEnum.fresh,
              orderStatusEnum.urgent,
              orderStatusEnum.prepaid,
            ],
          },
        },
      });
    case userRoleType.customerCareTeamLead ||
      userRoleType.customerCareAm ||
      userRoleType.customerCareManager ||
      userRoleType.customerCareAvp:
      let allJrOfTLIs = await userService.findAllWithQuery({
        isDeleted: false,
        isActive: true,
        userRole: {
          $in: [userRoleType.customerCareEx, userRoleType.customerCareSrEx],
        },
      });
      let allJrIdsOfTL = allJrOfTLIs?.map((ele) => {
        return ele?._id;
      });
      myQuery.push({
        $match: {
          agentId: {
            $in: [...allJrIdsOfTL],
          },
          isActive: true,
          isDeleted: false,
          status: {
            $in: [
              orderStatusEnum.fresh,
              orderStatusEnum.urgent,
              orderStatusEnum.prepaid,
            ],
          },
        },
      });

    default:
      break;
  }
  if (myQuery?.length) {
    return myQuery;
  } else {
    return false;
  }
};
