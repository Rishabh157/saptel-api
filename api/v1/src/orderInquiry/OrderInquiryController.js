const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");

// ----service---------
const orderService = require("./OrderInquiryService");
const orderInquiryFlowService = require("../orderInquiryFlow/OrderInquiryFlowService");
// const callService = require("./CallService");
const countryService = require("../country/CountryService");
const stateService = require("../state/StateService");
const schemeService = require("../scheme/SchemeService");
const districtService = require("../district/DistrictService");
const dealerService = require("../dealer/DealerService");
const deliveryBoyService = require("../deliveryBoy/DeliveryBoyService");
const tehsilService = require("../tehsil/TehsilService");
const warehouseService = require("../wareHouse/WareHouseService");
const pincodeService = require("../pincode/PincodeService");
const userService = require("../user/UserService");
const complaintService = require("../complain/ComplainService");
const areaService = require("../area/AreaService");
const barcodeService = require("../barCode/BarCodeService");
const channelService = require("../channelMaster/ChannelMasterService");
const dispositionTwoService = require("../dispositionTwo/DispositionTwoService");
const dispositionThreeService = require("../dispositionThree/DispositionThreeService");
// ----service---------
const mongoose = require("mongoose");
const { searchKeys } = require("./OrderInquirySchema");
const { errorRes } = require("../../../utils/resError");
const {
  getQuery,
  getUserRoleData,
  getFieldsToDisplay,
  getAllowedField,
} = require("../../helper/utils");
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
const {
  moduleType,
  actionType,
  productStatus,
  userEnum,
  callPageTabType,
  orderStatusEnum,
  userRoleType,
  firstCallDispositions,
} = require("../../helper/enumUtils");
const {
  getCustomerReputation,
  getDateFilterQueryCallBackDate,
} = require("./OrderInquiryHelper");
const { default: axios } = require("axios");

exports.add = async (req, res) => {
  try {
    let { fullName, mobile, email, pincode, address } = req.body;

    let dataCreated = await orderService.createNewData({
      customerName: fullName,
      mobileNo: mobile,
      emailId: email,
      pincodeId: pincode,
      address: address,
    });

    if (dataCreated) {
      await orderInquiryFlowService.createNewData({
        customerName: fullName,
        mobileNo: mobile,
        emailId: email,
        pincodeId: pincode,
        address: address,
      });

      return res.status(httpStatus.OK).send({
        message: "Updated successfully.",
        data: dataCreated,
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
// =============update  start================
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
      watsappNo,
      gender,
      prepaid,
      emailId,
      channel,
      remark,
      shcemeQuantity,
      dispositionLevelTwoId,
      dispositionLevelThreeId,
    } = req.body;

    let idToBeSearch = req.params.id;
    let dataExist = await orderService.isExists([]);
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
    let datafound = await orderService.getOneByMultiField({
      _id: idToBeSearch,
    });
    if (!datafound) {
      throw new ApiError(httpStatus.OK, `Orders not found.`);
    }
    await orderInquiryFlowService.createNewData({
      ...req.body,
      orderId: idToBeSearch,
      approved: approved,
      dispositionLevelTwoId,
      dispositionLevelThreeId,
    });

    let dataUpdated = await orderService.getOneAndUpdate(
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

//approve first call directly without call

exports.approveFirstCallDirectly = async (req, res) => {
  try {
    let idToBeSearch = req.params.id;
    let status = req.body.status;

    //------------------Find data-------------------
    let datafound = await orderService.getOneByMultiField({
      _id: idToBeSearch,
    });
    if (!datafound) {
      throw new ApiError(httpStatus.OK, `Orders not found.`);
    }
    await orderInquiryFlowService.createNewData({
      ...datafound,
      orderId: idToBeSearch,
      firstCallState: status,
      firstCallApproval:
        status === firstCallDispositions.approved ? true : false,
      firstCallApprovedBy: req.userData?.userName,
    });

    let dataUpdated = await orderService.getOneAndUpdate(
      {
        _id: idToBeSearch,
        isDeleted: false,
      },
      {
        $set: {
          firstCallState: status,
          firstCallApproval:
            status === firstCallDispositions.approved ? true : false,
          firstCallApprovedBy: req.userData?.userName,
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

//first call confirmation
exports.firstCallConfirmation = async (req, res) => {
  try {
    let idToBeSearch = req.params.id;
    let { address, remark, callbackDate, status } = req.body;

    //------------------Find data-------------------
    let datafound = await orderService.getOneByMultiField({
      _id: idToBeSearch,
    });
    if (!datafound) {
      throw new ApiError(httpStatus.OK, `Orders not found.`);
    }
    let approveStatus = status === firstCallDispositions.approved;
    await orderInquiryFlowService.createNewData({
      ...datafound,
      orderId: idToBeSearch,
      firstCallState: status,
      firstCallApproval: approveStatus,
      autoFillingShippingAddress: address,
      firstCallRemark: remark,

      firstCallCallBackDate: callbackDate,
      firstCallApprovedBy: req.userData?.userName,
    });

    let dataUpdated = await orderService.getOneAndUpdate(
      {
        _id: idToBeSearch,
        isDeleted: false,
      },
      {
        $set: {
          firstCallState: status,
          firstCallApproval: approveStatus,
          autoFillingShippingAddress: address,
          firstCallRemark: remark,

          firstCallCallBackDate: callbackDate,
          firstCallApprovedBy: req.userData?.userName,
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

//first call confirmation unauth
exports.firstCallConfirmationUnauth = async (req, res) => {
  try {
    let idToBeSearch = req.params.id;
    let { address, remark, callbackDate, status, approvedBy, mobileNo } =
      req.body;

    //------------------Find data-------------------
    let datafound = await orderService.getOneByMultiField({
      _id: idToBeSearch,
    });
    if (!datafound) {
      throw new ApiError(httpStatus.OK, `Orders not found.`);
    }
    let approveStatus = status === firstCallDispositions.approved;
    await orderInquiryFlowService.createNewData({
      ...datafound,
      orderId: idToBeSearch,
      firstCallState: status,
      firstCallApproval: approveStatus,
      autoFillingShippingAddress: address,
      firstCallRemark: remark,

      firstCallCallBackDate: callbackDate,
      firstCallApprovedBy: approvedBy,
    });

    let dataUpdated = await orderService.getOneAndUpdate(
      {
        _id: idToBeSearch,
        isDeleted: false,
      },
      {
        $set: {
          firstCallState: status,
          firstCallApproval: approveStatus,
          autoFillingShippingAddress: address,
          firstCallRemark: remark,

          firstCallCallBackDate: callbackDate,
          firstCallApprovedBy: approvedBy,
        },
      }
    );

    if (dataUpdated) {
      await axios.post(
        "https://uat.onetelemart.com/agent/v2/click-2-hangup",
        {
          user: approvedBy + config.dialer_domain,
          phone_number: mobileNo,
          unique_id: mobileNo,
          disposition: `DEFAULT:${status}`,
        },
        {
          headers: {
            "Content-Type": "application/json",
            XAuth: config.server_auth_key,
          },
        }
      );
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

exports.updateOrderStatus = async (req, res) => {
  try {
    let { status, remark, dispositionOne, dispositionTwo, orderId } = req.body;

    let dataExist = await orderService.isExists([]);
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }

    const isDispositionTwoExists = await dispositionTwoService.findCount({
      _id: dispositionOne,
      isDeleted: false,
    });
    if (!isDispositionTwoExists) {
      throw new ApiError(httpStatus.OK, "Invalid Disposition Two.");
    }

    const isDispositionThreeExists = await dispositionThreeService.findCount({
      _id: dispositionTwo,
      isDeleted: false,
    });
    if (!isDispositionThreeExists) {
      throw new ApiError(httpStatus.OK, "Invalid Disposition Three.");
    }

    //------------------Find data-------------------
    let datafound = await orderService.getOneByMultiField({
      _id: orderId,
    });
    if (!datafound) {
      throw new ApiError(httpStatus.OK, `Orders not found.`);
    }

    let dataUpdated = await orderService
      .getOneAndUpdate(
        {
          _id: orderId,
          isDeleted: false,
        },
        {
          $set: {
            // barcodeId: barcode,
            status,
            remark,
            dispositionLevelTwoId: dispositionOne,
            dispositionLevelThreeId: dispositionTwo,
          },
        }
      )
      .then(async (ress) => {
        await orderInquiryFlowService.createNewData({
          ...ress,
          orderId: orderId,
          status,
          dispositionLevelTwoId: dispositionOne,
          dispositionLevelThreeId: dispositionTwo,
        });
        return res.status(httpStatus.OK).send({
          message: "Updated successfully.",
          data: null,
          status: true,
          code: "OK",
          issue: null,
        });
      });
    //barcode, status, remark, dispositionOne, dispositionTwo
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

// ========assign order ===============
exports.assignOrder = async (req, res) => {
  try {
    let { dealerId, warehouseId, orderId } = req.body;

    if (dealerId !== null) {
      const isDealerExists = await dealerService.findCount({
        _id: dealerId,
        isDeleted: false,
      });
      if (!isDealerExists) {
        throw new ApiError(httpStatus.OK, "Invalid Dealer.");
      }
    }
    if (warehouseId !== null) {
      const isWarehouseExists = await warehouseService.findCount({
        _id: warehouseId,
        isDeleted: false,
      });
      if (!isWarehouseExists) {
        throw new ApiError(httpStatus.OK, "Invalid company warehouse");
      }
    }

    //------------------Find data-------------------
    let datafound = await orderService.getOneByMultiField({
      _id: orderId,
    });
    if (!datafound) {
      throw new ApiError(httpStatus.OK, `Orders not found.`);
    }

    let dataUpdated = await orderService
      .getOneAndUpdate(
        {
          _id: orderId,
          isDeleted: false,
        },
        {
          $set: {
            assignDealerId: dealerId,
            assignWarehouseId: warehouseId,
            isOrderAssigned: true,
          },
        }
      )
      .then(async (ress) => {
        await orderInquiryFlowService.createNewData({
          ...ress,
          orderId: orderId,
          assignDealerId: dealerId,
          assignWarehouseId: warehouseId,
        });
        return res.status(httpStatus.OK).send({
          message: "Updated successfully.",
          data: null,
          status: true,
          code: "OK",
          issue: null,
        });
      });
    //barcode, status, remark, dispositionOne, dispositionTwo
  } catch (err) {
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue });
  }
};

// assign delivery boy order
exports.assignOrderToDeliveryBoy = async (req, res) => {
  try {
    let { deliveryBoyId, orderId } = req.body;
    const isDeliveryBoyExists = await deliveryBoyService.findCount({
      _id: deliveryBoyId,
      isDeleted: false,
    });
    if (!isDeliveryBoyExists) {
      throw new ApiError(httpStatus.OK, "Invalid Delivery boy.");
    }

    //------------------Find data-------------------
    let datafound = await orderService.getOneByMultiField({
      _id: orderId,
    });
    if (!datafound) {
      throw new ApiError(httpStatus.OK, `Orders not found.`);
    }

    let dataUpdated = await orderService
      .getOneAndUpdate(
        {
          _id: orderId,
          isDeleted: false,
        },
        {
          $set: {
            delivery_boy_id: deliveryBoyId,
          },
        }
      )
      .then(async (ress) => {
        await orderInquiryFlowService.createNewData({
          ...ress,
          orderId: orderId,
          delivery_boy_id: deliveryBoyId,
        });
        return res.status(httpStatus.OK).send({
          message: "Updated successfully.",
          data: null,
          status: true,
          code: "OK",
          issue: null,
        });
      });
    //barcode, status, remark, dispositionOne, dispositionTwo
  } catch (err) {
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue });
  }
};

// =============get  start================
exports.get = async (req, res) => {
  try {
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
        $lookup: {
          from: "productgroups",
          localField: "productGroupId",
          foreignField: "_id",
          as: "product_group",
          pipeline: [
            { $match: { isDeleted: false } },
            { $project: { groupName: 1 } },
          ],
        },
      },

      {
        $addFields: {
          dispositionLevelTwo: {
            $arrayElemAt: ["$dispositionLevelTwoData.dispositionName", 0],
          },
          dispositionLevelThree: {
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
          productGroupLabel: {
            $arrayElemAt: ["$product_group.groupName", 0],
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
          "product_group",
        ],
      },
    ];
    let userRoleData = await getUserRoleData(req);
    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.order,
      userRoleData,
      actionType.listAll
    );
    let dataExist = await orderService.aggregateQuery(additionalQuery);
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

// Global search
exports.globalSearch = async (req, res) => {
  try {
    //if no default query then pass {}
    const { orderNumber, phoneNumber } = req.body;
    let matchQuery = {
      $and: [{ isDeleted: false }],
    };
    if (req.query && Object.keys(req.query).length) {
      matchQuery = getQuery(matchQuery, req.query);
    }

    if (parseInt(orderNumber) > 0) {
      matchQuery.$and.push({
        orderNumber: parseInt(orderNumber),
      });
    }
    if (phoneNumber) {
      matchQuery.$and.push({
        mobileNo: phoneNumber,
      });
    }

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
          from: "productgroups",
          localField: "productGroupId",
          foreignField: "_id",
          as: "product_group",
          pipeline: [
            { $match: { isDeleted: false } },
            { $project: { groupName: 1 } },
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
          from: "callcentermasters",
          localField: "callCenterId",
          foreignField: "_id",
          as: "callcenterdata",
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
                schemeCode: 1,
                deliveryCharges: 1,
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
        $lookup: {
          from: "deliveryboys",
          localField: "delivery_boy_id",
          foreignField: "_id",
          as: "deleivery_by_data",
          pipeline: [
            {
              $project: {
                name: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "dealers",
          localField: "assignDealerId",
          foreignField: "_id",
          as: "dealer_data",
          pipeline: [
            {
              $project: {
                firstName: 1,
                lastName: 1,
                dealerCode: 1,
                isActive: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "warehouses",
          localField: "assignWarehouseId",
          foreignField: "_id",
          as: "warehouse_data",
          pipeline: [
            {
              $project: {
                wareHouseName: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "warehouses",
          localField: "assignWarehouseId",
          foreignField: "_id",
          as: "warehouse_data",
          pipeline: [
            {
              $project: {
                wareHouseName: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "didmanagements",
          localField: "didNo",
          foreignField: "didNumber",
          as: "did_data",
          pipeline: [
            {
              $lookup: {
                from: "channelmasters",
                localField: "channelId",
                foreignField: "_id",
                as: "channel_data",
                pipeline: [
                  {
                    $project: {
                      channelName: 1,
                    },
                  },
                ],
              },
            },
          ],
        },
      },

      {
        $addFields: {
          channelLabel: {
            $arrayElemAt: ["$did_data.channel_data.channelName", 0],
          },

          dispositionLevelTwo: {
            $arrayElemAt: ["$dispositionLevelTwoData.dispositionName", 0],
          },
          dispositionLevelThree: {
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
          schemeCode: {
            $arrayElemAt: ["$schemeData.schemeCode", 0],
          },
          deliveryCharges: {
            $arrayElemAt: ["$schemeData.deliveryCharges", 0],
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

          agentDistrictLabel: {
            $arrayElemAt: ["$agentDistrictData.districtName", 0],
          },
          productGroupLabel: {
            $arrayElemAt: ["$product_group.groupName", 0],
          },
          deleiveryBoyLabel: {
            $arrayElemAt: ["$deleivery_by_data.name", 0],
          },
          assignWarehouseLabel: {
            $arrayElemAt: ["$warehouse_data.wareHouseName", 0],
          },
          dealerCode: {
            $arrayElemAt: ["$dealer_data.dealerCode", 0],
          },
          dealerStatus: {
            $arrayElemAt: ["$dealer_data.isActive", 0],
          },
          callCenterLabel: {
            $arrayElemAt: ["$callcenterdata.callCenterName", 0],
          },

          assignDealerLabel: {
            $concat: [
              { $arrayElemAt: ["$dealer_data.firstName", 0] },
              " ",
              { $arrayElemAt: ["$dealer_data.lastName", 0] },
            ],
          },
        },
      },
      {
        $unset: [
          "channel_data",
          "did_data",
          "dispositionLevelTwoData",
          "callcenterdata",
          "dispositionthreesData",
          "countrieData",
          "stateData",
          "schemeData",
          "districtData",
          "tehsilData",
          "pincodeData",
          "areaData",
          "channelData",
          "agentDistrictData",
          "product_group",
          "deleivery_by_data",
          "dealer_data",
          "warehouse_data",
        ],
      },
    ];
    let userRoleData = await getUserRoleData(req);
    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.order,
      userRoleData,
      actionType.listAll
    );
    let dataExist = await orderService.aggregateQuery(additionalQuery);
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

// =============update start end================
// =============get  start================
exports.getUnAuth = async (req, res) => {
  try {
    //if no default query then pass {}
    const { phno, type } = req.params;

    let matchQuery = {
      $and: [{ isDeleted: false }],
    };

    if (type === callPageTabType.order) {
      matchQuery.$and.push({
        orderNumber: { $ne: null },
      });
      matchQuery.$and.push({
        mobileNo: phno,
      });
    }
    if (type === callPageTabType.history) {
      matchQuery.$and.push({
        mobileNo: phno,
      });
    }
    if (type === callPageTabType.complaint) {
      matchQuery.$and.push({
        customerNumber: phno,
      });
    }
    if (req.query && Object.keys(req.query).length) {
      matchQuery = getQuery(matchQuery, req.query);
    }
    if (type === callPageTabType.history || type === callPageTabType.order) {
      var additionalQuery = [
        {
          $match: matchQuery,
        },
        { $sort: { _id: -1 } },
        { $limit: 15 },
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
          $lookup: {
            from: "dealers",
            localField: "assignDealerId",
            foreignField: "_id",
            as: "dealer_data",
            pipeline: [
              {
                $project: {
                  firstName: 1,
                  lastName: 1,
                  dealerCode: 1,
                  isActive: 1,
                },
              },
            ],
          },
        },
        {
          $lookup: {
            from: "warehouses",
            localField: "assignWarehouseId",
            foreignField: "_id",
            as: "warehouse_data",
            pipeline: [
              {
                $project: {
                  wareHouseName: 1,
                  wareHouseCode: 1,
                },
              },
            ],
          },
        },
        {
          $lookup: {
            from: "productgroups",
            localField: "productGroupId",
            foreignField: "_id",
            as: "product_group",
            pipeline: [
              { $match: { isDeleted: false } },
              { $project: { groupName: 1 } },
            ],
          },
        },

        {
          $addFields: {
            dispositionLevelTwo: {
              $arrayElemAt: ["$dispositionLevelTwoData.dispositionName", 0],
            },
            dispositionLevelThree: {
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
            productGroupLabel: {
              $arrayElemAt: ["$product_group.groupName", 0],
            },
            dealerLabel: {
              $concat: [
                { $arrayElemAt: ["$dealer_data.firstName", 0] },
                " ",
                { $arrayElemAt: ["$dealer_data.lastName", 0] },
              ],
            },
            wareHouseLabel: {
              $arrayElemAt: ["$warehouse_data.wareHouseName", 0],
            },
            dealerCode: {
              $arrayElemAt: ["$dealer_data.dealerCode", 0],
            },
            dealerStatus: {
              $arrayElemAt: ["$dealer_data.isActive", 0],
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
            "product_group",
            "dealer_data",
            "warehouse_data",
          ],
        },
      ];
    }
    if (type === callPageTabType.complaint) {
      var additionalComplaintQuery = [
        {
          $match: matchQuery,
        },

        { $sort: { _id: -1 } },
        { $limit: 15 },
        {
          $lookup: {
            from: "initialcallones",
            localField: "icOne",
            foreignField: "_id",
            as: "icOneData",
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
          $lookup: {
            from: "initialcalltwos",
            localField: "icTwo",
            foreignField: "_id",
            as: "icTwoData",
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
          $lookup: {
            from: "initialcallthrees",
            localField: "icThree",
            foreignField: "_id",
            as: "icThreeData",
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
            icOneLabel: {
              $arrayElemAt: ["$icOneData.initialCallName", 0],
            },
            icTwoLabel: {
              $arrayElemAt: ["$icTwoData.initialCallName", 0],
            },
            icThreeLabel: {
              $arrayElemAt: ["$icThreeData.initialCallName", 0],
            },
          },
        },
        {
          $unset: ["icOneData", "icTwoData", "icThreeData"],
        },
      ];
    }

    if (type === callPageTabType.complaint) {
      var complaintDataExist = await complaintService.aggregateQuery(
        additionalComplaintQuery
      );
    } else {
      var dataExist = await orderService.aggregateQuery(additionalQuery);
    }

    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      status: true,
      data: dataExist ? dataExist : complaintDataExist,
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

// get by ph number unauth

exports.getUnAuthGetByPhNumber = async (req, res) => {
  try {
    //if no default query then pass {}
    const { phno } = req.params;
    let matchQuery = { isDeleted: false, mobileNo: phno };
    if (req.query && Object.keys(req.query).length) {
      matchQuery = getQuery(matchQuery, req.query);
    }

    let additionalQuery = [
      {
        $match: matchQuery,
      },
      { $sort: { _id: -1 } },
      { $limit: 1 },
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
        $lookup: {
          from: "dealers",
          localField: "assignDealerId",
          foreignField: "_id",
          as: "dealer_data",
          pipeline: [
            {
              $project: {
                firstName: 1,
                lastName: 1,
                dealerCode: 1,
                isActive: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "warehouses",
          localField: "assignWarehouseId",
          foreignField: "_id",
          as: "warehouse_data",
          pipeline: [
            {
              $project: {
                wareHouseName: 1,
                wareHouseCode: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "productgroups",
          localField: "productGroupId",
          foreignField: "_id",
          as: "product_group",
          pipeline: [
            { $match: { isDeleted: false } },
            { $project: { groupName: 1 } },
          ],
        },
      },

      {
        $addFields: {
          dispositionLevelTwo: {
            $arrayElemAt: ["$dispositionLevelTwoData.dispositionName", 0],
          },
          dispositionLevelThree: {
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
          productGroupLabel: {
            $arrayElemAt: ["$product_group.groupName", 0],
          },
          dealerLabel: {
            $concat: [
              { $arrayElemAt: ["$dealer_data.firstName", 0] },
              " ",
              { $arrayElemAt: ["$dealer_data.lastName", 0] },
            ],
          },
          wareHouseLabel: {
            $arrayElemAt: ["$warehouse_data.wareHouseName", 0],
          },
          dealerCode: {
            $arrayElemAt: ["$dealer_data.dealerCode", 0],
          },
          dealerStatus: {
            $arrayElemAt: ["$dealer_data.isActive", 0],
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
          "product_group",
          "dealer_data",
          "warehouse_data",
        ],
      },
    ];
    let allComplaints = await complaintService.findAllWithQuery({
      customerNumber: phno,
    });
    let customerReputation = await getCustomerReputation(allComplaints);
    let dataExist = await orderService.aggregateQuery(additionalQuery);
    if (!dataExist || !dataExist?.length) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successfull.",
        status: true,
        customerReputation: customerReputation,
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

//get acttive order of a number
exports.getActiveOrder = async (req, res) => {
  try {
    //if no default query then pass {}
    const { phno } = req.params;
    let matchQuery = {
      isDeleted: false,
      mobileNo: phno,
      assignDealerId: null,
      firstCallApproval: false,
      firstCallState: {
        $ne: [firstCallDispositions.cancel, firstCallDispositions.approved],
      },
      status: {
        $ne: [
          orderStatusEnum.doorCancelled,
          orderStatusEnum.delivered,
          orderStatusEnum.inquiry,
          orderStatusEnum.rto,
        ],
      },
    };
    if (req.query && Object.keys(req.query).length) {
      matchQuery = getQuery(matchQuery, req.query);
    }

    let additionalQuery = [
      {
        $match: matchQuery,
      },
      { $sort: { _id: -1 } },
      { $limit: 1 },
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
                schemeCode: 1,
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
        $lookup: {
          from: "dealers",
          localField: "assignDealerId",
          foreignField: "_id",
          as: "dealer_data",
          pipeline: [
            {
              $project: {
                firstName: 1,
                lastName: 1,
                dealerCode: 1,
                isActive: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "warehouses",
          localField: "assignWarehouseId",
          foreignField: "_id",
          as: "warehouse_data",
          pipeline: [
            {
              $project: {
                wareHouseName: 1,
                wareHouseCode: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "productgroups",
          localField: "productGroupId",
          foreignField: "_id",
          as: "product_group",
          pipeline: [
            { $match: { isDeleted: false } },
            { $project: { groupName: 1 } },
          ],
        },
      },

      {
        $addFields: {
          dispositionLevelTwo: {
            $arrayElemAt: ["$dispositionLevelTwoData.dispositionName", 0],
          },
          dispositionLevelThree: {
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
          schemeCode: {
            $arrayElemAt: ["$schemeData.schemeCode", 0],
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
          productGroupLabel: {
            $arrayElemAt: ["$product_group.groupName", 0],
          },
          dealerLabel: {
            $concat: [
              { $arrayElemAt: ["$dealer_data.firstName", 0] },
              " ",
              { $arrayElemAt: ["$dealer_data.lastName", 0] },
            ],
          },
          wareHouseLabel: {
            $arrayElemAt: ["$warehouse_data.wareHouseName", 0],
          },
          dealerCode: {
            $arrayElemAt: ["$dealer_data.dealerCode", 0],
          },
          dealerStatus: {
            $arrayElemAt: ["$dealer_data.isActive", 0],
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
          "product_group",
          "dealer_data",
          "warehouse_data",
        ],
      },
    ];
    let allComplaints = await complaintService.findAllWithQuery({
      customerNumber: phno,
    });
    let customerReputation = await getCustomerReputation(allComplaints);
    let dataExist = await orderService.aggregateQuery(additionalQuery);
    if (!dataExist || !dataExist?.length) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successfull.",
        status: true,
        customerReputation: customerReputation,
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

// =============get DispositionTwo by Id start================
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
                schemeCode: 1,
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
        $lookup: {
          from: "productgroups",
          localField: "productGroupId",
          foreignField: "_id",
          as: "product_group",
          pipeline: [
            { $match: { isDeleted: false } },
            { $project: { groupName: 1 } },
          ],
        },
      },
      {
        $lookup: {
          from: "dealers",
          localField: "assignDealerId",
          foreignField: "_id",
          as: "dealer_data",
          pipeline: [
            {
              $project: {
                firstName: 1,
                lastName: 1,
                dealerCode: 1,
                isActive: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "warehouses",
          localField: "assignWarehouseId",
          foreignField: "_id",
          as: "warehouse_data",
          pipeline: [
            {
              $project: {
                wareHouseName: 1,
              },
            },
          ],
        },
      },

      {
        $addFields: {
          dispositionLevelTwo: {
            $arrayElemAt: ["$dispositionLevelTwoData.dispositionName", 0],
          },
          dispositionLevelThree: {
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
          schemeCode: {
            $arrayElemAt: ["$schemeData.schemeCode", 0],
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
          assignWarehouseLabel: {
            $arrayElemAt: ["$warehouse_data.wareHouseName", 0],
          },
          assignDealerLabel: {
            $concat: [
              { $arrayElemAt: ["$dealer_data.firstName", 0] },
              " ",
              { $arrayElemAt: ["$dealer_data.lastName", 0] },
            ],
          },
          // channelLabel: {
          //   $arrayElemAt: ["$channelData.channelName", 0],
          // },
          agentDistrictLabel: {
            $arrayElemAt: ["$agentDistrictData.districtName", 0],
          },
          productGroupLabel: {
            $arrayElemAt: ["$product_group.groupName", 0],
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
          "product_group",
        ],
      },
    ];
    let userRoleData = await getUserRoleData(req);
    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.order,
      userRoleData,
      actionType.view
    );
    let dataExist = await orderService.aggregateQuery(additionalQuery);
    let allowedFields = getAllowedField(fieldsToDisplay, dataExist);

    if (!allowedFields[0]) {
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

// get by mobilenumber

exports.getByMobileNumber = async (req, res) => {
  try {
    let { barcode, contactNumber, complaintNumber, email, orderNumber } =
      req.body;

    let matchQuery = {};

    if (contactNumber) {
      matchQuery.$or = [
        { mobileNo: contactNumber },
        { alternateNo: contactNumber },
      ];
    }

    if (email) {
      matchQuery.emailId = email;
    }
    if (orderNumber) {
      matchQuery.orderNumber = orderNumber;
    }
    if (barcode) {
      let barcodeData = await barcodeService.getOneByMultiField({
        barcodeNumber: barcode,
      });
      if (barcodeData) {
        matchQuery.barcodeId = {
          $in: [new mongoose.Types.ObjectId(barcodeData?._id)],
        };
      }
    }
    if (complaintNumber) {
      let complaintData = await complaintService.getOneByMultiField({
        isDeleted: false,
        complaintNumber,
      });
      if (complaintData) {
        matchQuery.orderNumber = complaintData.orderNumber;
      }
    }

    const isEmpty = (obj) => {
      return Object.keys(obj).length === 0;
    };
    if (isEmpty(matchQuery)) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let isDataFound = await orderService.aggregateQuery([
      {
        $match: matchQuery,
      },
    ]);
    if (!isDataFound.length) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let additionalQuery = [
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
        $lookup: {
          from: "productgroups",
          localField: "productGroupId",
          foreignField: "_id",
          as: "product_group",
          pipeline: [
            { $match: { isDeleted: false } },
            { $project: { groupName: 1 } },
          ],
        },
      },

      {
        $addFields: {
          dispositionLevelTwo: {
            $arrayElemAt: ["$dispositionLevelTwoData.dispositionName", 0],
          },
          dispositionLevelThree: {
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
          productGroupLabel: {
            $arrayElemAt: ["$product_group.groupName", 0],
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
          "product_group",
        ],
      },
    ];
    if (isDataFound.length) {
      additionalQuery.push({
        $match: matchQuery,
      });
    }
    let userRoleData = await getUserRoleData(req);
    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.order,
      userRoleData,
      actionType.view
    );
    let dataExist = await orderService.aggregateQuery(additionalQuery);

    let allowedFields = getAllowedField(fieldsToDisplay, dataExist);

    if (!allowedFields[0]) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successfull.",
        status: true,
        data: allowedFields[0],
        allOrderData: allowedFields,
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

// get by id for dealer
exports.getByIdForDealer = async (req, res) => {
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
          from: "dispositiontwos",
          localField: "dispositionLevelTwoId",
          foreignField: "_id",
          as: "dispositionLevelTwoData",
          pipeline: [
            {
              $project: {
                dispositionDisplayName: 1,
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
                dispositionDisplayName: 1,
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
        $lookup: {
          from: "productgroups",
          localField: "productGroupId",
          foreignField: "_id",
          as: "product_group",
          pipeline: [
            { $match: { isDeleted: false } },
            { $project: { groupName: 1 } },
          ],
        },
      },

      {
        $addFields: {
          dispositionLevelTwo: {
            $arrayElemAt: [
              "$dispositionLevelTwoData.dispositionDisplayName",
              0,
            ],
          },
          dispositionLevelThree: {
            $arrayElemAt: ["$dispositionthreesData.dispositionDisplayName", 0],
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
          productGroupLabel: {
            $arrayElemAt: ["$product_group.groupName", 0],
          },
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
          "product_group",
        ],
      },
    ];

    let dataExist = await orderService.aggregateQuery(additionalQuery);

    if (!dataExist[0]) {
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

// get by order number
exports.getByOrderNumber = async (req, res) => {
  try {
    let ordernumber = req.params.ordernumber;
    let additionalQuery = [
      {
        $match: {
          orderNumber: parseInt(ordernumber),
          isDeleted: false,
          status: orderStatusEnum.delivered,
        },
      },
      {
        $project: {
          customerName: 1,
          mobileNo: 1,
          autoFillingShippingAddress: 1,
          orderNumber: 1,
        },
      },
    ];

    let dataExist = await orderService.aggregateQuery(additionalQuery);

    if (!dataExist[0]) {
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

// =============all filter pagination api start================
exports.allFilterPagination = async (req, res) => {
  try {
    const { Id } = req.userData;
    let getBatchData = req.body.getBatchData;
    var dateFilter = req.body.dateFilter;
    var callbackDateFilter = req.body.callbackDateFilter;
    let searchValue = req.body.searchValue;
    let searchIn = req.body.searchIn;
    let filterBy = req.body.filterBy;
    let rangeFilterBy = req.body.rangeFilterBy;
    let isPaginationRequired = req.body.isPaginationRequired
      ? req.body.isPaginationRequired
      : true;
    let finalAggregateQuery = [];

    const isUserExists = await userService.getOneByMultiField({
      _id: Id,
      isDeleted: false,
      isActive: true,
    });

    if (!isUserExists) {
      throw new ApiError(httpStatus.OK, "Invalid Agent ");
    }
    let matchQuery = {
      $and: [{ isDeleted: false }],
    };

    let dealersOfZonalManager = [];
    if (
      req.userData.userRole === userRoleType.srManagerDistribution ||
      req.userData.userRole === userRoleType.managerArea
    ) {
      let allDealers = await dealerService.findAllWithQuery({
        isActive: true,
        isDeleted: false,
        zonalManagerId: req.userData.Id,
      });
      allDealers?.forEach((ele) => {
        dealersOfZonalManager?.push(ele?._id.toString());
      });
    }
    let dealersOfZonalExicutive = [];
    if (req.userData.userRole === userRoleType.srEXECUTIVEArea) {
      let allDealers = await dealerService.findAllWithQuery({
        isActive: true,
        isDeleted: false,
        zonalExecutiveId: req.userData.Id,
      });
      allDealers?.forEach((ele) => {
        dealersOfZonalExicutive?.push(ele?._id.toString());
      });
    }
    if (req.userData.userRole === userRoleType.EXECUTIVEArea) {
      console.log("in...");
      let allDealers = await dealerService.findAllWithQuery({
        isActive: true,
        isDeleted: false,
        zonalExecutiveAreaId: { $in: [req.userData.Id] },
      });
      allDealers?.forEach((ele) => {
        dealersOfZonalExicutive?.push(ele?._id.toString());
      });
    }

    if (isUserExists?.isAgent) {
      matchQuery.$and.push({ agentId: new mongoose.Types.ObjectId(Id) });
      matchQuery.$and.push({
        callCenterId: new mongoose.Types.ObjectId(isUserExists?.callCenterId),
      });
    }

    if (
      isUserExists?.userType !== userEnum.admin &&
      isUserExists?.isAgent === false &&
      isUserExists?.callCenterId === null
    ) {
      matchQuery.$and.push({
        branchId: new mongoose.Types.ObjectId(isUserExists?.branchId),
      });
    }

    if (
      isUserExists?.userType !== userEnum.admin &&
      isUserExists?.isAgent === false &&
      isUserExists?.callCenterId !== null
    ) {
      matchQuery.$and.push({
        callCenterId: new mongoose.Types.ObjectId(isUserExists?.callCenterId),
      });
    }

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
    let booleanFields = ["firstCallApproval"];
    let numberFileds = ["orderNumber", "inquiryNumber"];
    let objectIdFields = [
      "dispositionLevelTwoId",
      "dispositionLevelThreeId",
      "countryId",
      "companyId",
      "stateId",
      "schemeId",
      "districtId",
      "tehsilId",
      "pincodeId",
      "areaId",
      "channel",
      "agentDistrictId",
      "batchId",
      "assignDealerId",
      "assignWarehouseId",
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
    if (getBatchData) {
      matchQuery.$and.push({ batchId: null });
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

    let allowedCallbackDateFiletrKeys = ["firstCallCallBackDate"];

    const datefilterCallbackQuery = await getDateFilterQueryCallBackDate(
      callbackDateFilter,
      allowedCallbackDateFiletrKeys
    );
    console.log(matchQuery, "matchQuery");
    if (datefilterCallbackQuery && datefilterCallbackQuery.length) {
      matchQuery.$and.push(...datefilterCallbackQuery);
    }

    //calander filter
    //----------------------------

    /**
     * for lookups , project , addfields or group in aggregate pipeline form dynamic quer in additionalQuery array
     */
    let additionalQuery = [
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
          from: "productgroups",
          localField: "productGroupId",
          foreignField: "_id",
          as: "product_group",
          pipeline: [
            { $match: { isDeleted: false } },
            { $project: { groupName: 1 } },
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
          from: "callcentermasters",
          localField: "callCenterId",
          foreignField: "_id",
          as: "callcenterdata",
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
                schemeCode: 1,
                deliveryCharges: 1,
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
        $lookup: {
          from: "deliveryboys",
          localField: "delivery_boy_id",
          foreignField: "_id",
          as: "deleivery_by_data",
          pipeline: [
            {
              $project: {
                name: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "dealers",
          localField: "assignDealerId",
          foreignField: "_id",
          as: "dealer_data",
          pipeline: [
            {
              $project: {
                firstName: 1,
                lastName: 1,
                dealerCode: 1,
                isActive: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "warehouses",
          localField: "assignWarehouseId",
          foreignField: "_id",
          as: "warehouse_data",
          pipeline: [
            {
              $project: {
                wareHouseName: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "warehouses",
          localField: "assignWarehouseId",
          foreignField: "_id",
          as: "warehouse_data",
          pipeline: [
            {
              $project: {
                wareHouseName: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "didmanagements",
          localField: "didNo",
          foreignField: "didNumber",
          as: "did_data",
          pipeline: [
            {
              $lookup: {
                from: "channelmasters",
                localField: "channelId",
                foreignField: "_id",
                as: "channel_data",
                pipeline: [
                  {
                    $project: {
                      channelName: 1,
                    },
                  },
                ],
              },
            },
          ],
        },
      },

      {
        $addFields: {
          channelLabel: {
            $arrayElemAt: ["$did_data.channel_data.channelName", 0],
          },

          dispositionLevelTwo: {
            $arrayElemAt: ["$dispositionLevelTwoData.dispositionName", 0],
          },
          dispositionLevelThree: {
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
          schemeCode: {
            $arrayElemAt: ["$schemeData.schemeCode", 0],
          },
          deliveryCharges: {
            $arrayElemAt: ["$schemeData.deliveryCharges", 0],
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

          agentDistrictLabel: {
            $arrayElemAt: ["$agentDistrictData.districtName", 0],
          },
          productGroupLabel: {
            $arrayElemAt: ["$product_group.groupName", 0],
          },
          deleiveryBoyLabel: {
            $arrayElemAt: ["$deleivery_by_data.name", 0],
          },
          assignWarehouseLabel: {
            $arrayElemAt: ["$warehouse_data.wareHouseName", 0],
          },
          dealerCode: {
            $arrayElemAt: ["$dealer_data.dealerCode", 0],
          },
          dealerStatus: {
            $arrayElemAt: ["$dealer_data.isActive", 0],
          },
          callCenterLabel: {
            $arrayElemAt: ["$callcenterdata.callCenterName", 0],
          },

          assignDealerLabel: {
            $concat: [
              { $arrayElemAt: ["$dealer_data.firstName", 0] },
              " ",
              { $arrayElemAt: ["$dealer_data.lastName", 0] },
            ],
          },
        },
      },
      {
        $unset: [
          "channel_data",
          "did_data",
          "dispositionLevelTwoData",
          "callcenterdata",
          "dispositionthreesData",
          "countrieData",
          "stateData",
          "schemeData",
          "districtData",
          "tehsilData",
          "pincodeData",
          "areaData",
          "channelData",
          "agentDistrictData",
          "product_group",
          "deleivery_by_data",
          "dealer_data",
          "warehouse_data",
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
    let dataFound = await orderService.aggregateQuery(finalAggregateQuery);
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
      moduleType.order,
      userRoleData,
      actionType.pagination
    );
    let result = await orderService.aggregateQuery(finalAggregateQuery);
    let allowedFields = getAllowedField(fieldsToDisplay, result);

    let finalData = [];
    // check for zonal manager and zonal exicutive
    console.log(dealersOfZonalManager, "dealersOfZonalManager");
    if (
      req.userData.userRole === userRoleType.srManagerDistribution ||
      req.userData.userRole === userRoleType.managerArea
    ) {
      allowedFields?.forEach((ele) => {
        console.log(ele?.assignDealerId, "ele?.assignDealerId");
        if (
          ele?.assignDealerId !== null &&
          dealersOfZonalManager.includes(ele?.assignDealerId?.toString())
        ) {
          finalData.push(ele);
        }
      });
    }
    if (
      req.userData.userRole === userRoleType.srEXECUTIVEArea ||
      req.userData.userRole === userRoleType.EXECUTIVEArea
    ) {
      allowedFields?.forEach((ele) => {
        if (
          ele?.assignDealerId !== null &&
          dealersOfZonalExicutive.includes(ele?.assignDealerId?.toString())
        ) {
          finalData.push(ele);
        }
      });
    }
    let dataToShow =
      req.userData.userRole === userRoleType.srManagerDistribution ||
      req.userData.userRole === userRoleType.managerArea ||
      req.userData.userRole === userRoleType.srEXECUTIVEArea ||
      req.userData.userRole === userRoleType.EXECUTIVEArea
        ? finalData
        : allowedFields;

    if (dataToShow?.length) {
      return res.status(200).send({
        data: dataToShow,
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

exports.allFilterPaginationDileveryBoy = async (req, res) => {
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
      $and: [
        {
          isDeleted: false,
          delivery_boy_id: new mongoose.Types.ObjectId(req.userData.Id),
        },
      ],
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
    let objectIdFields = [
      "dispositionLevelTwoId",
      "dispositionLevelThreeId",
      "countryId",
      "stateId",
      "schemeId",
      "districtId",
      "tehsilId",
      "pincodeId",
      "areaId",
      "channel",
      "agentDistrictId",
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
    // if (datefilterQuery && datefilterQuery.length) {
    //

    //   matchQuery.$and.push(...datefilterQuery);
    // }

    //calander filter
    //----------------------------

    /**
     * for lookups , project , addfields or group in aggregate pipeline form dynamic quer in additionalQuery array
     */
    let additionalQuery = [
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
          from: "productgroups",
          localField: "productGroupId",
          foreignField: "_id",
          as: "product_group",
          pipeline: [
            { $match: { isDeleted: false } },
            { $project: { groupName: 1 } },
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
      {
        $lookup: {
          from: "channelmasters",
          localField: "channelId",
          foreignField: "_id",
          as: "channelData",
          pipeline: [
            {
              $project: {
                channelName: 1,
              },
            },
          ],
        },
      },
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
        $lookup: {
          from: "deliveryboys",
          localField: "delivery_boy_id",
          foreignField: "_id",
          as: "deleivery_by_data",
          pipeline: [
            {
              $project: {
                name: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          dispositionLevelTwo: {
            $arrayElemAt: ["$dispositionLevelTwoData.dispositionName", 0],
          },
          dispositionLevelThree: {
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
          channelLabel: {
            $arrayElemAt: ["$channelData.channelName", 0],
          },
          agentDistrictLabel: {
            $arrayElemAt: ["$agentDistrictData.districtName", 0],
          },
          productGroupLabel: {
            $arrayElemAt: ["$product_group.groupName", 0],
          },
          deleiveryBoyLabel: {
            $arrayElemAt: ["$deleivery_by_data.name", 0],
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
          "channelData",
          "agentDistrictData",
          "product_group",
          "deleivery_by_data",
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
    //
    let dataFound = await orderService.aggregateQuery(finalAggregateQuery);

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
    // let userRoleData = await getUserRoleData(req);
    // let fieldsToDisplay = getFieldsToDisplay(
    //   moduleType.order,
    //   userRoleData,
    //   actionType.pagination
    // );
    let result = await orderService.aggregateQuery(finalAggregateQuery);
    // let allowedFields = getAllowedField(fieldsToDisplay, result);

    if (result?.length) {
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

// delivery boy order for dealer app

exports.allFilterPaginationDileveryBoyForDealerPanel = async (req, res) => {
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
      $and: [
        {
          isDeleted: false,
          delivery_boy_id: new mongoose.Types.ObjectId(req.body.deliveryBoyId),
        },
      ],
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
    let objectIdFields = [
      "dispositionLevelTwoId",
      "dispositionLevelThreeId",
      "countryId",
      "stateId",
      "schemeId",
      "districtId",
      "tehsilId",
      "pincodeId",
      "areaId",
      "channel",
      "agentDistrictId",
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
    // if (datefilterQuery && datefilterQuery.length) {
    //

    //   matchQuery.$and.push(...datefilterQuery);
    // }

    //calander filter
    //----------------------------

    /**
     * for lookups , project , addfields or group in aggregate pipeline form dynamic quer in additionalQuery array
     */
    let additionalQuery = [
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
          from: "productgroups",
          localField: "productGroupId",
          foreignField: "_id",
          as: "product_group",
          pipeline: [
            { $match: { isDeleted: false } },
            { $project: { groupName: 1 } },
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
      {
        $lookup: {
          from: "channelmasters",
          localField: "channelId",
          foreignField: "_id",
          as: "channelData",
          pipeline: [
            {
              $project: {
                channelName: 1,
              },
            },
          ],
        },
      },
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
        $lookup: {
          from: "deliveryboys",
          localField: "delivery_boy_id",
          foreignField: "_id",
          as: "deleivery_by_data",
          pipeline: [
            {
              $project: {
                name: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          dispositionLevelTwo: {
            $arrayElemAt: ["$dispositionLevelTwoData.dispositionName", 0],
          },
          dispositionLevelThree: {
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
          channelLabel: {
            $arrayElemAt: ["$channelData.channelName", 0],
          },
          agentDistrictLabel: {
            $arrayElemAt: ["$agentDistrictData.districtName", 0],
          },
          productGroupLabel: {
            $arrayElemAt: ["$product_group.groupName", 0],
          },
          deleiveryBoyLabel: {
            $arrayElemAt: ["$deleivery_by_data.name", 0],
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
          "channelData",
          "agentDistrictData",
          "product_group",
          "deleivery_by_data",
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
    //
    let dataFound = await orderService.aggregateQuery(finalAggregateQuery);

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
    // let userRoleData = await getUserRoleData(req);
    // let fieldsToDisplay = getFieldsToDisplay(
    //   moduleType.order,
    //   userRoleData,
    //   actionType.pagination
    // );
    let result = await orderService.aggregateQuery(finalAggregateQuery);
    // let allowedFields = getAllowedField(fieldsToDisplay, result);

    if (result?.length) {
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
// =============all filter dealer order pagination api start================
exports.allFilterDealerOrderPagination = async (req, res) => {
  try {
    var dateFilter = req.body.dateFilter;
    let searchValue = req.body.searchValue;
    let searchIn = req.body.searchIn;
    let filterBy = req.body.filterBy;
    let rangeFilterBy = req.body.rangeFilterBy;
    let dealerId = req.params.dealerId;
    let isPaginationRequired = req.body.isPaginationRequired
      ? req.body.isPaginationRequired
      : true;
    let finalAggregateQuery = [];
    let matchQuery = {
      $and: [
        {
          isDeleted: false,
          assignDealerId: new mongoose.Types.ObjectId(dealerId),
        },
      ],
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
    let objectIdFields = [
      "dispositionLevelTwoId",
      "dispositionLevelThreeId",
      "countryId",
      "stateId",
      "schemeId",
      "districtId",
      "tehsilId",
      "pincodeId",
      "areaId",
      "channel",
      "agentDistrictId",
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
          from: "productgroups",
          localField: "productGroupId",
          foreignField: "_id",
          as: "product_group",
          pipeline: [
            { $match: { isDeleted: false } },
            { $project: { groupName: 1 } },
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
      // {
      //   $lookup: {
      //     from: "barcodes",
      //     localField: "barcodeId",
      //     foreignField: "_id",
      //     as: "barcodeData",
      //     pipeline: [
      //       {
      //         $project: {
      //           barcodeNumber: 1,
      //         },
      //       },
      //     ],
      //   },
      // },
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
      {
        $lookup: {
          from: "channelmasters",
          localField: "channelId",
          foreignField: "_id",
          as: "channelData",
          pipeline: [
            {
              $project: {
                channelName: 1,
              },
            },
          ],
        },
      },
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
        $lookup: {
          from: "deliveryboys",
          localField: "delivery_boy_id",
          foreignField: "_id",
          as: "deleivery_by_data",
          pipeline: [
            {
              $project: {
                name: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "dealers",
          localField: "assignDealerId",
          foreignField: "_id",
          as: "dealer_data",
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
        $addFields: {
          dispositionLevelTwo: {
            $arrayElemAt: ["$dispositionLevelTwoData.dispositionName", 0],
          },
          dispositionLevelThree: {
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
          channelLabel: {
            $arrayElemAt: ["$channelData.channelName", 0],
          },
          agentDistrictLabel: {
            $arrayElemAt: ["$agentDistrictData.districtName", 0],
          },
          productGroupLabel: {
            $arrayElemAt: ["$product_group.groupName", 0],
          },
          deleiveryBoyLabel: {
            $arrayElemAt: ["$deleivery_by_data.name", 0],
          },

          dealerLabel: {
            $concat: [
              { $arrayElemAt: ["$dealer_data.firstName", 0] },
              " ",
              { $arrayElemAt: ["$dealer_data.lastName", 0] },
            ],
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
          "channelData",
          "agentDistrictData",
          "product_group",
          "deleivery_by_data",
          "dealer_data",
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
    let dataFound = await orderService.aggregateQuery(finalAggregateQuery);
    if (dataFound.length === 0) {
      throw new ApiError(httpStatus.OK, `No data Found here`);
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

    let result = await orderService.aggregateQuery(finalAggregateQuery);
    if (result?.length) {
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
// =============all filter pagination api end=================

// =============delete start================
exports.deleteDocument = async (req, res) => {
  try {
    let _id = req.params.id;
    if (!(await orderService.getOneByMultiField({ _id }))) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    const deleteRefCheck = await checkIdInCollectionsThenDelete(
      collectionArrToMatch,
      "orderId",
      _id
    );

    if (deleteRefCheck.status === true) {
      let deleted = await orderService.getOneAndDelete({ _id });
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
// =============delete end================

// order status change

exports.orderStatusChange = async (req, res) => {
  try {
    let _id = req.params.id;
    if (!(await orderService.getOneByMultiField({ _id }))) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }

    await orderService.getOneAndUpdate(
      { _id },
      { orderStatus: productStatus.complete }
    );
    if (!deleted) {
      throw new ApiError(httpStatus.OK, "Some thing went wrong.");
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

// dealer ordaer status change
exports.dealerOrderStatusChange = async (req, res) => {
  try {
    let _id = req.params.id;
    let { status } = req.body;
    if (!(await orderService.getOneByMultiField({ _id }))) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }

    let orderUpdated = await orderService.getOneAndUpdate(
      { _id },
      { status: status }
    );
    if (!orderUpdated) {
      throw new ApiError(httpStatus.OK, "Some thing went wrong.");
    }

    return res.status(httpStatus.OK).send({
      message: "Updated successfully!",
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

exports.dealerApprove = async (req, res) => {
  try {
    let _id = req.params.orderid;
    if (!(await orderService.getOneByMultiField({ _id }))) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }

    await orderService.getOneAndUpdate({ _id }, { approved: true });

    return res.status(httpStatus.OK).send({
      message: "Approved!",
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
