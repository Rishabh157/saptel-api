const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const moment = require("moment");
const AWS = require("aws-sdk");

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
const productSummaryService = require("../productGroupSummary/ProductGroupSummaryService");
const CourierPartnerToken = require("../courierPartnerToken/CourierPartnerTokenService");
const awbMaster = require("../awbMaster/AwbMasterService");

const pincodeService = require("../pincode/PincodeService");
const productCategoryService = require("../productCategory/ProductCategoryService");
const userService = require("../user/UserService");
const complaintService = require("../complain/ComplainService");
const areaService = require("../area/AreaService");
const barcodeService = require("../barCode/BarCodeService");
const barcodeFlowService = require("../barCodeFlow/BarCodeFlowService");

const callService = require("../call/CallService");
const ndrDispositionService = require("../ndrDisposition/NdrDispositionService");
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
  getDateFilterQueryForTask,
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
  preferredCourierPartner,
  subDispositionNDR,
  paymentModeType,
  barcodeStatusType,
  orderTypeEnum,
  courierRTOType,
} = require("../../helper/enumUtils");
const {
  getCustomerReputation,
  getDateFilterQueryCallBackAndPreferedDate,
  generateOrderInvoice,
  getTomorrowDate,
} = require("./OrderInquiryHelper");
const { default: axios } = require("axios");
const {
  getEstTime,
  assignOrderToCourier,
} = require("../../third-party-services/courierAPIFunction");
const { getOrderNumber, getInquiryNumber } = require("../call/CallHelper");
const fs = require("fs");
const {
  addToOrderFlow,
} = require("../orderInquiryFlow/OrderInquiryFlowHelper");
const { addToBarcodeFlow } = require("../barCodeFlow/BarCodeFlowHelper");
const {
  addRemoveAvailableQuantity,
  checkFreezeQuantity,
  addReturnQuantity,
} = require("../productGroupSummary/ProductGroupSummaryHelper");

// exports.add = async (req, res) => {
//   try {
//     const orderNumber = await getOrderNumber();
//     const inquiryNumber = await getInquiryNumber();

//     const { idToBeSearch, isOrder, ...rest } = req.body;

//     try {
//       const orderInquiry = await orderService.createNewData({
//         ...rest,
//         orderNumber: isOrder ? orderNumber : null,
//         inquiryNumber: inquiryNumber,
//       });

//       await addToOrderFlow(
//         orderInquiry?._id,
//         orderInquiry?.orderNumber,
//         "E-com order created",
//         orderInquiry.status,
//         req.userData.userName
//       );
//       const dataUpdated = await callService.getOneAndUpdate(
//         {
//           _id: idToBeSearch,
//           isDeleted: false,
//         },
//         {
//           $set: {
//             status: rest.status,
//           },
//         }
//       );

//       return res.status(httpStatus.OK).send({
//         message: "created successfully.",
//         data: null,
//         status: true,
//         code: "OK",
//         issue: null,
//       });
//     } catch (error) {
//       throw new ApiError(httpStatus.NOT_IMPLEMENTED, error.message);
//     }
//   } catch (err) {
//     let errData = errorRes(err); // Assuming it's errorResponse instead of errorRes
//     logger.info(errData.resData);
//     let { message, status, data, code, issue } = errData.resData;
//     return res
//       .status(errData.statusCode)
//       .send({ message, status, data, code, issue });
//   }
// };

// exports.bulkAdd = async (req, res) => {
//   try {
//     const orderNumber = await getOrderNumber();
//     const inquiryNumber = await getInquiryNumber();

//     try {
//       const orderInquiry = await orderService.createNewData({
//         ...req.body,
//         orderNumber: orderNumber,
//         inquiryNumber: inquiryNumber,
//       });

//       await addToOrderFlow(orderInquiry);

//       return res.status(httpStatus.OK).send({
//         message: "created successfully.",
//         data: null,
//         status: true,
//         code: "OK",
//         issue: null,
//       });
//     } catch (error) {
//       throw new ApiError(httpStatus.NOT_IMPLEMENTED, error.message);
//     }
//   } catch (err) {
//     let errData = errorRes(err); // Assuming it's errorResponse instead of errorRes
//     logger.info(errData.resData);
//     let { message, status, data, code, issue } = errData.resData;
//     return res
//       .status(errData.statusCode)
//       .send({ message, status, data, code, issue });
//   }
// };
// // get label
// exports.getOrderLabel = async (req, res) => {
//   try {
//

//     const { awbNumber } = req.body;
//     try {
//       let shipyaariToken = await CourierPartnerToken?.getOneByMultiField({
//         courierPartnerName: preferredCourierPartner.shipyaari,
//       });
//       const HEADER = {
//         "Content-Type": "application/json", // Set the content type
//         Authorization: `Bearer ${shipyaariToken?.token}`,
//       };
//       const data = {
//         awbs: [awbNumber],
//       };
//       let response = await axios.post(
//         `${config.shipyaari_baseurl}/api/v1/labels/fetchLabels`,
//         data,
//         { headers: HEADER }
//       );
// if
//       return res.status(httpStatus.OK).send({
//         message: "created successfully.",
//         data: response?.data,
//         status: true,
//         code: "OK",
//         issue: null,
//       });
//     } catch (err) {
//       throw new ApiError(httpStatus.NOT_IMPLEMENTED, err.message);
//     }
//   } catch (err) {
//     let errData = errorRes(err); // Assuming it's errorResponse instead of errorRes
//     logger.info(errData.resData);
//     let { message, status, data, code, issue } = errData.resData;
//     return res
//       .status(errData.statusCode)
//       .send({ message, status, data, code, issue });
//   }
// };
exports.getOrderLabel = async (req, res) => {
  try {
    const { awbNumber } = req.body;
    try {
      let shipyaariToken = await CourierPartnerToken?.getOneByMultiField({
        courierPartnerName: preferredCourierPartner.shipyaari,
      });
      const HEADER = {
        "Content-Type": "application/json", // Set the content type
        Authorization: `Bearer ${shipyaariToken?.token}`,
      };
      const data = {
        awbs: [awbNumber],
      };
      let response = await axios.post(
        `${config.shipyaari_baseurl}/api/v1/labels/fetchLabels`,
        data,
        { headers: HEADER, responseType: "arraybuffer" }
      );
      // Save the response content to a file
      fs.writeFileSync("response.pdf", response.data);

      res.status(httpStatus.OK).send({
        message: "created successfully.",
        status: true,
        code: "OK",
        issue: null,
        data: fs.readFileSync("response.pdf", "base64"), // Attach the file content as base64
      });
    } catch (err) {
      throw new ApiError(httpStatus.NOT_IMPLEMENTED, err.message);
    }
  } catch (err) {
    let errData = errorRes(err); // Assuming it's errorResponse instead of errorRes
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue });
  }
};

// generate invoice
exports.generateOrderInvoice = async (req, res) => {
  try {
    const { awbNumber } = req.body;
    try {
      let shipyaariToken = await CourierPartnerToken?.getOneByMultiField({
        courierPartnerName: preferredCourierPartner.shipyaari,
      });
      const HEADER = {
        "Content-Type": "application/json", // Set the content type
        Authorization: `Bearer ${shipyaariToken?.token}`,
      };
      const data = {
        awbs: [awbNumber],
      };
      let response = await axios.post(
        `${config.shipyaari_baseurl}/api/v1/labels/fetchTaxInvoices`,
        data,
        { headers: HEADER, responseType: "arraybuffer" }
      );
      // Save the response content to a file
      fs.writeFileSync("response.pdf", response.data);

      res.status(httpStatus.OK).send({
        message: "created successfully.",
        status: true,
        code: "OK",
        issue: null,
        data: fs.readFileSync("response.pdf", "base64"), // Attach the file content as base64
      });
    } catch (err) {
      throw new ApiError(httpStatus.NOT_IMPLEMENTED, err.message);
    }
  } catch (err) {
    let errData = errorRes(err); // Assuming it's errorResponse instead of errorRes
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

    const isAreaExists =
      areaId !== null
        ? await areaService.findCount({
            _id: areaId,
            isDeleted: false,
          })
        : null;
    if (areaId !== null && !isAreaExists) {
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
      await orderInquiryFlowService.createNewData({
        ...req.body,
        orderId: idToBeSearch,
        approved: approved,
        dispositionLevelTwoId,
        dispositionLevelThreeId,
      });
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

//====================== Dealer NDR update ===================

exports.updateDealerNdr = async (req, res) => {
  try {
    let {
      alternateNumber,
      dealerValidRemark,
      ndrRemark,
      ndrDiscountApplicable,
      ndrApprovedBy,
      reAttemptDate,
      ndrCallDisposition,
      ndrRtoReattemptReason,
      mobileNo,
    } = req.body;

    let idToBeSearch = req.params.id;
    let dataExist = await orderService.isExists([]);
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }

    //------------------Find data-------------------
    let datafound = await orderService.getOneByMultiField({
      _id: idToBeSearch,
    });
    if (!datafound) {
      throw new ApiError(httpStatus.OK, `Orders not found.`);
    }

    let ndrDispositionFound = await ndrDispositionService.getOneByMultiField({
      _id: ndrCallDisposition,
      isDeleted: false,
      isActive: true,
    });
    if (!ndrDispositionFound) {
      throw new ApiError(httpStatus.OK, `Invalid NDR call disposition`);
    }
    let orderStatusIs = "";

    switch (ndrDispositionFound.rtoAttempt) {
      case subDispositionNDR.attempt:
        orderStatusIs = orderStatusEnum.reattempt;
        break;
      case subDispositionNDR.rto:
        orderStatusIs = orderStatusEnum.rto;
        break;
      case subDispositionNDR.cancel:
        orderStatusIs = orderStatusEnum.cancel;
        break;
      case subDispositionNDR.hold:
        orderStatusIs = orderStatusEnum.hold;
        break;
      case subDispositionNDR.customerWillConnect:
        orderStatusIs = orderStatusEnum.hold;
        break;
      default:
        break;
    }

    let dataUpdated = await orderService.getOneAndUpdate(
      {
        _id: idToBeSearch,
        isDeleted: false,
      },
      {
        $set: {
          ...req.body,
          dealerValidRemark: dealerValidRemark,
          alternateNo: alternateNumber,
          ndrRemark,
          ndrDiscountApplicable,
          status: orderStatusIs,
          ndrApprovedBy: ndrApprovedBy,
          preffered_delivery_date: reAttemptDate,
          ndrCallDisposition,
          ndrRtoReattemptReason,
        },
      }
    );

    if (dataUpdated) {
      await orderInquiryFlowService.createNewData({
        ...dataUpdated,
        orderId: idToBeSearch,
        dealerValidRemark: dealerValidRemark,
        alternateNo: alternateNumber,
        ndrRemark,
        ndrDiscountApplicable,
        status: orderStatusEnum.reattempt,
        ndrRtoReattemptReason,
      });

      await axios.post(
        "https://uat.onetelemart.com/agent/v2/click-2-hangup",
        {
          user: ndrApprovedBy + config.dialer_domain,
          phone_number: mobileNo,
          unique_id: mobileNo,
          disposition: `DEFAULT:${ndrDispositionFound.ndrDisposition}`,
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

//====================== Courier NDR update ===================

exports.updateCourierNdr = async (req, res) => {
  try {
    let {
      alternateNumber,
      dispositionTwoId,
      dispositionThreeId,
      ndrRemark,
      reAttemptDate,
      ndrApprovedBy,
      mobileNo,
    } = req.body;

    let idToBeSearch = req.params.id;
    let dataExist = await orderService.isExists([]);
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }

    const isDispositionTwoExists = await dispositionTwoService.findCount({
      _id: dispositionTwoId,
      isDeleted: false,
    });
    if (!isDispositionTwoExists) {
      throw new ApiError(httpStatus.OK, "Invalid Disposition Two.");
    }

    const isDispositionThreeExists = await dispositionThreeService.findCount({
      _id: dispositionThreeId,
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

    let dataUpdated = await orderService.getOneAndUpdate(
      {
        _id: idToBeSearch,
        isDeleted: false,
      },
      {
        $set: {
          ...req.body,
          dispositionLevelTwoId: dispositionTwoId,
          dispositionLevelThreeId: dispositionThreeId,
          alternateNo: alternateNumber,
          ndrRemark,
          status: orderStatusEnum.reattempt,
          deliveryTimeAndDate: reAttemptDate,
          ndrApprovedBy: ndrApprovedBy,
        },
      }
    );

    if (dataUpdated) {
      await addToOrderFlow(
        dataUpdated?._id,
        dataUpdated?.orderNumber,
        `Order maked for Reattept!`,
        dataUpdated.status,
        ndrApprovedBy
      );

      // await axios.post(
      //   "https://uat.onetelemart.com/agent/v2/click-2-hangup",
      //   {
      //     user: ndrApprovedBy + config.dialer_domain,
      //     phone_number: mobileNo,
      //     unique_id: mobileNo,
      //     disposition: `DEFAULT:${ndrCallDisposition}`,
      //   },
      //   {
      //     headers: {
      //       "Content-Type": "application/json",
      //       XAuth: config.server_auth_key,
      //     },
      //   }
      // );

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

// =============== change scheme ===========

exports.changeScheme = async (req, res) => {
  try {
    let { schemeId, ndrRemark } = req.body;

    let idToBeSearch = req.params.id;
    let dataExist = await orderService.isExists([]);
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }

    const isschemeExists = await schemeService.getOneByMultiField({
      _id: schemeId,
      isDeleted: false,
    });
    if (!isschemeExists) {
      throw new ApiError(httpStatus.OK, "Invalid Scheme");
    }

    //------------------Find data-------------------
    let datafound = await orderService.getOneByMultiField({
      _id: idToBeSearch,
    });
    if (!datafound) {
      throw new ApiError(httpStatus.OK, `Orders not found.`);
    }

    let dataUpdated = await orderService.getOneAndUpdate(
      {
        _id: idToBeSearch,
        isDeleted: false,
      },
      {
        $set: {
          ...req.body,
          schemeId: schemeId,
          schemeName: isschemeExists?.schemeName,
          price: isschemeExists?.schemePrice,
          ndrRemark,
          ndrDiscountApplicable: false,
        },
      }
    );

    if (dataUpdated) {
      await orderInquiryFlowService.createNewData({
        ...dataUpdated,
        orderId: idToBeSearch,
      });
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
    let productData = req.body.productData;
    let warehouseId = req.body.warehouseId;

    // Example usage
    const handleProductData = async (
      productData,
      warehouseId,
      barcodeStatus
    ) => {
      const promises = productData?.map(async (ele) => {
        const foundBarcode = await barcodeService?.getOneByMultiField({
          productGroupId: ele,
          isUsed: true,
          isFreezed: false,
          wareHouseId: warehouseId,
          status: barcodeStatus,
        });

        if (!foundBarcode) {
          return Promise.reject(
            new ApiError(
              httpStatus.OK,
              `Insufficient stock in warehouse for this order!`
            )
          );
        }

        return foundBarcode;
      });

      return Promise.all(promises.map((p) => p.catch((e) => e)));
    };

    if (status === "APPROVED") {
      const results = await handleProductData(
        productData,
        warehouseId,
        barcodeStatusType?.atWarehouse
      );
      const errors = results.filter((result) => result instanceof Error);

      if (errors.length > 0) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Insufficient stock in warehouse for this order!"
        );
      }
    }
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
    // getting prefered courier partner
    let toPincodeData = await pincodeService?.getOneByMultiField({
      _id: dataUpdated?.pincodeId,
    });
    let wareHouseData = await warehouseService?.getOneByMultiField({
      _id: dataUpdated?.assignWarehouseId,
    });
    if (!wareHouseData) {
      throw new ApiError(
        httpStatus.NOT_IMPLEMENTED,
        `Something went wrong. Warehouse not assigned to this order`
      );
    }
    let fromPincodeIs = wareHouseData?.billingAddress?.pincodeId;
    let fromPincodeData = await pincodeService?.getOneByMultiField({
      _id: fromPincodeIs,
    });
    let schemeData = await schemeService.getOneByMultiField({
      _id: dataUpdated?.schemeId,
    });

    let preferredCourier = toPincodeData?.preferredCourier;
    let categorydata = await productCategoryService?.getOneByMultiField({
      _id: schemeData?.category,
    });

    let isOrderAssignedToCourier = await assignOrderToCourier(
      toPincodeData,
      fromPincodeData,
      schemeData,
      dataUpdated,
      preferredCourier,
      wareHouseData,
      categorydata
    );

    if (
      isOrderAssignedToCourier?.apiStatus === false &&
      isOrderAssignedToCourier.courierName === null
    ) {
      await orderService.getOneAndUpdate(
        {
          _id: idToBeSearch,
        },
        {
          $set: {
            shipyaariResponse: isOrderAssignedToCourier?.data,
            firstCallState: "",
            firstCallApproval: false,
            firstCallApprovedBy: "",
          },
        }
      );
      throw new ApiError(
        httpStatus.NOT_IMPLEMENTED,
        isOrderAssignedToCourier?.data
      );
    }

    // if true the hit shipment API else GPO
    if (isOrderAssignedToCourier.apiStatus && isOrderAssignedToCourier?.isApi) {
      if (
        isOrderAssignedToCourier.courierName ===
        preferredCourierPartner.shipyaari
      ) {
        let orderUpdateCourier = await orderService.getOneAndUpdate(
          {
            _id: idToBeSearch,
            isDeleted: false,
          },
          {
            $set: {
              orderAssignedToCourier: isOrderAssignedToCourier.courierName,
              shipyaariResponse: isOrderAssignedToCourier.data,
              awbNumber:
                isOrderAssignedToCourier?.data?.data?.[0]?.awbs[0].tracking.awb,
              secondaryCourierPartner:
                isOrderAssignedToCourier?.data?.data?.[0]?.awbs[0]?.charges
                  ?.partnerName,
              status: orderStatusEnum.intransit,
            },
          }
        );
        await addToOrderFlow(
          orderUpdateCourier?._id,
          orderUpdateCourier?.orderNumber,
          `First call approved order assigned to courier ${orderUpdateCourier?.orderAssignedToCourier}`,
          orderUpdateCourier.status,
          req.userData.userName
        );
      } else if (
        isOrderAssignedToCourier.courierName === preferredCourierPartner.maersk
      ) {
        let orderUpdateCourier = await orderService.getOneAndUpdate(
          {
            _id: idToBeSearch,
            isDeleted: false,
          },
          {
            $set: {
              orderAssignedToCourier: isOrderAssignedToCourier.courierName,
              maerksResponse: isOrderAssignedToCourier.data,
              awbNumber: isOrderAssignedToCourier?.data?.result?.waybill,
              secondaryCourierPartner: null,
              orderInvoice: isOrderAssignedToCourier.invoiceNumber,
            },
          }
        );
        await addToOrderFlow(
          orderUpdateCourier?._id,
          orderUpdateCourier?.orderNumber,
          `First call approved order assigned to courier ${orderUpdateCourier?.orderAssignedToCourier}`,
          orderUpdateCourier.status,
          req.userData.userName
        );
      }
    } else {
      let orderUpdateToOther = await orderService.getOneAndUpdate(
        {
          _id: idToBeSearch,
          isDeleted: false,
        },
        {
          $set: {
            isGPO:
              isOrderAssignedToCourier?.courierName ||
              "GPO" === preferredCourierPartner.gpo
                ? true
                : false,
            orderAssignedToCourier:
              isOrderAssignedToCourier?.courierName || "GPO",
          },
        }
      );
      await addToOrderFlow(
        orderUpdateToOther?._id,
        orderUpdateToOther?.orderNumber,
        `First call approved order assigned to courier ${orderUpdateToOther?.orderAssignedToCourier}`,
        orderUpdateToOther.status,
        req.userData.userName
      );
    }

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
    let {
      address,
      remark,
      callbackDate,
      status,
      alternateNo,
      productData,
      warehouseId,
      areaId,
    } = req.body;

    const handleProductData = async (
      productData,
      warehouseId,
      barcodeStatus
    ) => {
      const promises = productData?.map(async (ele) => {
        const foundBarcode = await barcodeService?.getOneByMultiField({
          productGroupId: ele,
          isUsed: true,
          isFreezed: false,
          wareHouseId: warehouseId,
          status: barcodeStatus,
        });

        if (!foundBarcode) {
          return Promise.reject(
            new ApiError(
              httpStatus.OK,
              `Insufficient stock in warehouse for this order!`
            )
          );
        }

        return foundBarcode;
      });

      return Promise.all(promises.map((p) => p.catch((e) => e)));
    };

    if (status === "APPROVED") {
      const results = await handleProductData(
        productData,
        warehouseId,
        barcodeStatusType?.atWarehouse
      );
      const errors = results.filter((result) => result instanceof Error);

      if (errors.length > 0) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Insufficient stock in warehouse for this order!"
        );
      }
    }
    //------------------Find data-------------------
    let datafound = await orderService.getOneByMultiField({
      _id: idToBeSearch,
    });
    if (!datafound) {
      throw new ApiError(httpStatus.OK, `Orders not found.`);
    }

    let foundArea = await areaService.getOneByMultiField({ _id: areaId });
    if (!foundArea) {
      throw new ApiError(httpStatus.OK, `Invalid area`);
    }
    let approveStatus = status === firstCallDispositions.approved;

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
          alternateNo: alternateNo,
          firstCallCallBackDate: callbackDate,
          firstCallApprovedBy: req.userData?.userName,
          areaId,
          areaLabel: foundArea?.area,
        },
      }
    );

    if (dataUpdated) {
      await orderInquiryFlowService.createNewData({
        ...dataUpdated,
        orderId: idToBeSearch,
        firstCallState: status,
        firstCallApproval: approveStatus,
        autoFillingShippingAddress: address,
        firstCallRemark: remark,

        firstCallCallBackDate: callbackDate,
        firstCallApprovedBy: req.userData?.userName,
      });
      // getting prefered courier partner
      let toPincodeData = await pincodeService?.getOneByMultiField({
        _id: dataUpdated?.pincodeId,
      });
      let wareHouseData = await warehouseService?.getOneByMultiField({
        _id: dataUpdated?.assignWarehouseId,
      });
      if (!wareHouseData) {
        throw new ApiError(
          httpStatus.NOT_IMPLEMENTED,
          `Something went wrong. Warehouse not assigned to this order`
        );
      }
      let fromPincodeIs = wareHouseData?.billingAddress?.pincodeId;
      let fromPincodeData = await pincodeService?.getOneByMultiField({
        _id: fromPincodeIs,
      });
      let schemeData = await schemeService.getOneByMultiField({
        _id: dataUpdated?.schemeId,
      });

      let preferredCourier = toPincodeData?.preferredCourier;
      let categorydata = await productCategoryService?.getOneByMultiField({
        _id: schemeData?.category,
      });

      let isOrderAssignedToCourier = await assignOrderToCourier(
        toPincodeData,
        fromPincodeData,
        schemeData,
        dataUpdated,
        preferredCourier,
        wareHouseData,
        categorydata
      );

      // if true the hit shipment API else GPO
      if (
        isOrderAssignedToCourier.apiStatus &&
        isOrderAssignedToCourier?.isApi
      ) {
        if (
          isOrderAssignedToCourier.courierName ===
          preferredCourierPartner.shipyaari
        ) {
          let orderUpdateCourier = await orderService.getOneAndUpdate(
            {
              _id: idToBeSearch,
              isDeleted: false,
            },
            {
              $set: {
                orderAssignedToCourier: isOrderAssignedToCourier.courierName,
                shipyaariResponse: isOrderAssignedToCourier.data,
                awbNumber:
                  isOrderAssignedToCourier?.data?.data?.[0]?.awbs[0].tracking
                    .awb,
                secondaryCourierPartner:
                  isOrderAssignedToCourier?.data?.data?.[0]?.awbs[0]?.charges
                    ?.partnerName,
                status: orderStatusEnum.intransit,
              },
            }
          );
          await addToOrderFlow(
            orderUpdateCourier?._id,
            orderUpdateCourier?.orderNumber,
            `First call approved order assigned to courier ${orderUpdateCourier?.orderAssignedToCourier}`,
            orderUpdateCourier.status,
            req.userData.userName
          );
        } else if (
          isOrderAssignedToCourier.courierName ===
          preferredCourierPartner.maersk
        ) {
          let orderUpdateCourier = await orderService.getOneAndUpdate(
            {
              _id: idToBeSearch,
              isDeleted: false,
            },
            {
              $set: {
                orderAssignedToCourier: isOrderAssignedToCourier.courierName,
                maerksResponse: isOrderAssignedToCourier.data,
                awbNumber: isOrderAssignedToCourier?.data?.result?.waybill,
                secondaryCourierPartner: null,
                orderInvoice: isOrderAssignedToCourier.invoiceNumber,
              },
            }
          );
          await addToOrderFlow(
            orderUpdateCourier?._id,
            orderUpdateCourier?.orderNumber,
            `First call approved order assigned to courier ${orderUpdateCourier?.orderAssignedToCourier}`,
            orderUpdateCourier.status,
            req.userData.userName
          );
        }
      } else {
        let orderUpdateToOther = await orderService.getOneAndUpdate(
          {
            _id: idToBeSearch,
            isDeleted: false,
          },
          {
            $set: {
              isGPO:
                isOrderAssignedToCourier?.courierName ===
                preferredCourierPartner.gpo
                  ? true
                  : false,
              orderAssignedToCourier: isOrderAssignedToCourier?.courierName,
            },
          }
        );
        await addToOrderFlow(
          orderUpdateToOther?._id,
          orderUpdateToOther?.orderNumber,
          `First call approved order assigned to courier ${orderUpdateToOther?.orderAssignedToCourier}`,
          orderUpdateToOther.status,
          req.userData.userName
        );
      }
      // geting deleverable courier partner
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
    let {
      address,
      remark,
      callbackDate,
      status,
      approvedBy,
      mobileNo,
      alternateNo,
      productData,
      warehouseId,
    } = req.body;

    const handleProductData = async (
      productData,
      warehouseId,
      barcodeStatus
    ) => {
      const promises = productData?.map(async (ele) => {
        const foundBarcode = await barcodeService?.getOneByMultiField({
          productGroupId: ele,
          isUsed: true,
          isFreezed: false,
          wareHouseId: warehouseId,
          status: barcodeStatus,
        });

        if (!foundBarcode) {
          return Promise.reject(
            new ApiError(
              httpStatus.OK,
              `Insufficient stock in warehouse for this order!`
            )
          );
        }

        return foundBarcode;
      });

      return Promise.all(promises.map((p) => p.catch((e) => e)));
    };

    if (status === "APPROVED") {
      const results = await handleProductData(
        productData,
        warehouseId,
        barcodeStatusType?.atWarehouse
      );
      const errors = results.filter((result) => result instanceof Error);

      if (errors.length > 0) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Insufficient stock in warehouse for this order!"
        );
      }
    }
    //------------------Find data-------------------
    let datafound = await orderService.getOneByMultiField({
      _id: idToBeSearch,
    });
    if (!datafound) {
      throw new ApiError(httpStatus.OK, `Orders not found.`);
    }
    let approveStatus = status === firstCallDispositions.approved;

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
          alternateNo: alternateNo,
          firstCallCallBackDate: callbackDate,
          firstCallApprovedBy: approvedBy,
        },
      }
    );
    // getting prefered courier partner
    let toPincodeData = await pincodeService?.getOneByMultiField({
      _id: dataUpdated?.pincodeId,
    });
    let wareHouseData = await warehouseService?.getOneByMultiField({
      _id: dataUpdated?.assignWarehouseId,
    });
    if (!wareHouseData) {
      throw new ApiError(
        httpStatus.NOT_IMPLEMENTED,
        `Something went wrong. Warehouse not assigned to this order`
      );
    }
    let fromPincodeIs = wareHouseData?.billingAddress?.pincodeId;
    let fromPincodeData = await pincodeService?.getOneByMultiField({
      _id: fromPincodeIs,
    });
    let schemeData = await schemeService.getOneByMultiField({
      _id: dataUpdated?.schemeId,
    });

    let preferredCourier = toPincodeData?.preferredCourier;
    let categorydata = await productCategoryService?.getOneByMultiField({
      _id: schemeData?.category,
    });

    let isOrderAssignedToCourier = await assignOrderToCourier(
      toPincodeData,
      fromPincodeData,
      schemeData,
      dataUpdated,
      preferredCourier,
      wareHouseData,
      categorydata
    );

    // if true the hit shipment API else GPO
    if (isOrderAssignedToCourier.apiStatus && isOrderAssignedToCourier?.isApi) {
      if (
        isOrderAssignedToCourier.courierName ===
        preferredCourierPartner.shipyaari
      ) {
        let orderUpdateCourier = await orderService.getOneAndUpdate(
          {
            _id: idToBeSearch,
          },
          {
            $set: {
              orderAssignedToCourier: isOrderAssignedToCourier.courierName,
              shipyaariResponse: isOrderAssignedToCourier.data,
              awbNumber:
                isOrderAssignedToCourier?.data?.data?.[0]?.awbs[0].tracking.awb,
              secondaryCourierPartner:
                isOrderAssignedToCourier?.data?.data?.[0]?.awbs[0]?.charges
                  ?.partnerName,
              status: orderStatusEnum.intransit,
            },
          }
        );
        await addToOrderFlow(
          orderUpdateCourier?._id,
          orderUpdateCourier?.orderNumber,
          `First call approved order assigned to courier ${orderUpdateCourier?.orderAssignedToCourier}`,
          orderUpdateCourier.status,
          approvedBy
        );
      } else if (
        isOrderAssignedToCourier.courierName === preferredCourierPartner.maersk
      ) {
        let orderUpdateCourier = await orderService.getOneAndUpdate(
          {
            _id: idToBeSearch,
          },
          {
            $set: {
              orderAssignedToCourier: isOrderAssignedToCourier.courierName,
              maerksResponse: isOrderAssignedToCourier.data,
              awbNumber: isOrderAssignedToCourier?.data?.result?.waybill,
              secondaryCourierPartner: null,
              orderInvoice: isOrderAssignedToCourier.invoiceNumber,
            },
          }
        );
        await addToOrderFlow(
          orderUpdateCourier?._id,
          orderUpdateCourier?.orderNumber,
          `First call approved order assigned to courier ${orderUpdateCourier?.orderAssignedToCourier}`,
          orderUpdateCourier.status,
          approvedBy
        );
      }
    } else {
      let orderUpdateToOther = await orderService.getOneAndUpdate(
        {
          _id: idToBeSearch,
          isDeleted: false,
        },
        {
          $set: {
            isGPO:
              isOrderAssignedToCourier?.courierName ===
              preferredCourierPartner.gpo
                ? true
                : false,
            orderAssignedToCourier: isOrderAssignedToCourier?.courierName,
          },
        }
      );
      await addToOrderFlow(
        orderUpdateToOther?._id,
        orderUpdateToOther?.orderNumber,
        `First call approved order assigned to courier ${orderUpdateToOther?.orderAssignedToCourier}`,
        orderUpdateToOther.status,
        approvedBy
      );
    }

    if (dataUpdated) {
      await orderInquiryFlowService.createNewData({
        ...dataUpdated,
        orderId: idToBeSearch,
        firstCallState: status,
        firstCallApproval: approveStatus,
        autoFillingShippingAddress: address,
        firstCallRemark: remark,
        alternateNo: alternateNo,
        firstCallCallBackDate: callbackDate,
        firstCallApprovedBy: approvedBy,
      });

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

    let pscDate = status === orderStatusEnum.psc ? new Date() : "";

    let dataUpdated = await orderService
      .getOneAndUpdate(
        {
          _id: orderId,
        },
        {
          $set: {
            // barcodeId: barcode,
            status,
            remark,
            dispositionLevelTwoId: dispositionOne,
            dispositionLevelThreeId: dispositionTwo,
            preShipCancelationDate: pscDate,
          },
        }
      )
      .then(async (ress) => {
        await addToOrderFlow(
          ress?._id,
          ress?.orderNumber,
          `Order status changed to ${status}`,
          ress.status,
          req.userData.userName
        );
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

// warehouse order dispatch

exports.warehouseOrderDispatch = async (req, res) => {
  try {
    const { orderNumber, barcodes, type } = req.body;

    // Find the order
    const order = await orderService.getOneByMultiField({
      orderNumber,
      orderStatus: productStatus.notDispatched,
    });

    if (!order) {
      throw new ApiError(
        httpStatus.OK,
        "Order not found or already dispatched"
      );
    }

    // Check courier type and retrieve AWB data
    const isGPO = type === preferredCourierPartner.gpo;
    const awbFilter = isGPO
      ? { isUsed: false, isGPOAWB: true }
      : { isUsed: false, isGPOAWB: false, orderNumber };
    const awbNumberData = await awbMaster.getOneByMultiField(awbFilter);

    if (!awbNumberData) {
      throw new ApiError(
        httpStatus.OK,
        `No AWB found, please add ${isGPO ? "GPO" : ""} AWB`
      );
    }

    // Check product availability and update quantities
    await Promise.all(
      order.schemeProducts.map(async (product) => {
        const freezeCheck = await checkFreezeQuantity(
          req.userData.companyId,
          order.assignWarehouseId,
          product.productGroupId,
          product.productQuantity
        );

        if (!freezeCheck.status) {
          throw new ApiError(
            httpStatus.NOT_IMPLEMENTED,
            freezeCheck.msg || "Insufficient product in warehouse"
          );
        }
      })
    );

    await Promise.all(
      order.schemeProducts.map(async (product) => {
        const quantityUpdate = await addRemoveAvailableQuantity(
          req.userData.companyId,
          order.assignWarehouseId,
          product.productGroupId,
          product.productQuantity,
          "REMOVE"
        );

        if (!quantityUpdate.status) {
          throw new ApiError(
            httpStatus.NOT_IMPLEMENTED,
            quantityUpdate.msg || "Error removing available quantity"
          );
        }
      })
    );

    // Update AWB data
    await awbMaster.getOneAndUpdate(
      { awbNumber: awbNumberData.awbNumber },
      { $set: { isUsed: true, orderNumber } }
    );

    // Process barcodes
    await Promise.all(
      barcodes.map(async (barcodeItem) => {
        const barcode = await barcodeService.getOneByMultiField({
          _id: barcodeItem.barcodeId,
          isDeleted: false,
          isUsed: true,
          status: barcodeStatusType.atWarehouse,
        });

        if (!barcode) {
          throw new ApiError(httpStatus.OK, "Invalid barcode");
        }

        const updatedBarcode = await barcodeService.getOneAndUpdate(
          { _id: barcodeItem.barcodeId, isUsed: true },
          { $set: { status: barcodeStatusType.inTransit, isFreezed: false } }
        );

        await addToBarcodeFlow(
          updatedBarcode,
          `Barcode status marked as in-transit and assigned to order number: ${orderNumber}`
        );
      })
    );

    // Prepare data for order update
    const orderUpdateData = {
      barcodeData: barcodes,
      status: orderStatusEnum.intransit,
      orderStatus: productStatus.dispatched,
      orderInvoice: generateOrderInvoice(order?.orderNumber),
      orderInvoiceDate: new Date(),
      isFreezed: false,
    };

    if (type !== preferredCourierPartner.shipyaari) {
      orderUpdateData.awbNumber = awbNumberData.awbNumber;
    }

    const updatedOrder = await orderService.getOneAndUpdate(
      { orderNumber, isDeleted: false },
      { $set: orderUpdateData }
    );

    await addToOrderFlow(
      updatedOrder?._id,
      updatedOrder?.orderNumber,
      `Order dispatched from warehouse`,
      updatedOrder.status,
      req.userData.userName
    );
    return res.status(httpStatus.OK).send({
      message: "Order dispatched successfully.",
      data: null,
      status: true,
      code: "OK",
      issue: null,
    });
  } catch (err) {
    const errData = errorRes(err);
    logger.info(errData.resData);
    const { message, status, data, code, issue } = errData.resData;
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue });
  }
};

// unfreeze order

exports.unfreezeOrder = async (req, res) => {
  try {
    const orderNumber = req.params.ordernumber;

    orderData = await orderService?.getOneAndUpdate(
      { orderNumber: orderNumber },
      {
        $set: { isFreezed: false },
      }
    );

    if (!orderData.length) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successful.",
        status: true,
        data: null,

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

// warehouse manual order dispatch

exports.warehouseManualOrderDispatch = async (req, res) => {
  try {
    let { orderNumber, barcodes } = req.body;

    //------------------Find data-------------------
    let datafound = await orderService.getOneByMultiField({
      orderNumber: orderNumber,
      orderStatus: productStatus.notDispatched,
    });
    if (!datafound) {
      throw new ApiError(
        httpStatus.OK,
        `Order not found or already dispatched`
      );
    }
    await Promise.all(
      barcodes?.map(async (ele) => {
        let foundBarcode = await barcodeService.getOneByMultiField({
          _id: ele?.barcodeId,
          isDeleted: false,
          isUsed: true,
          status: barcodeStatusType.atWarehouse,
        });
        if (!foundBarcode) {
          throw new ApiError(httpStatus.OK, `Invalid barcode`);
        } else {
          const updatedBarcode = await barcodeService.getOneAndUpdate(
            {
              _id: new mongoose.Types.ObjectId(ele?.barcodeId),
              isUsed: true,
            },
            {
              $set: {
                status: barcodeStatusType.inTransit,
                isFreezed: false,
              },
            }
          );

          await addToBarcodeFlow(
            updatedBarcode,
            `Barcode status marked as intransit and assigned to order number: ${orderNumber}`
          );
        }
      })
    );
    let dataToBeUpdate = [];

    dataToBeUpdate.push({
      barcodeData: barcodes,
      status: orderStatusEnum.intransit,
      orderStatus: productStatus.dispatched,
    });

    let dataUpdated = await orderService.getOneAndUpdate(
      {
        orderNumber: orderNumber,
        isDeleted: false,
      },
      {
        $set: dataToBeUpdate[0],
      }
    );

    await addToOrderFlow(
      dataUpdated?._id,
      dataUpdated?.orderNumber,
      `Order dispatched from warehouse manually`,
      dataUpdated.status,
      req.userData.userName
    );
    return res.status(httpStatus.OK).send({
      message: "Updated successfully.",
      data: null,
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

// =============update  end================

// ========assign order ===============
exports.assignOrder = async (req, res) => {
  try {
    let { dealerId, warehouseId, orderId } = req.body;

    //------------------Find data-------------------
    let datafound = await orderService.getOneByMultiField({
      _id: orderId,
    });
    if (!datafound) {
      throw new ApiError(httpStatus.OK, `Orders not found.`);
    }
    let allProducts = datafound?.schemeProducts?.map((ele) => {
      return ele?.productGroupId;
    });
    console.log(dealerId, "dealerId");
    if (dealerId !== null) {
      var isDealerExists = await dealerService.getOneByMultiField({
        _id: dealerId,
        isActive: true,
      });
      if (!isDealerExists) {
        throw new ApiError(httpStatus.OK, "Invalid Dealer.");
      }
      var isWarehouseExists = await warehouseService.getOneByMultiField({
        dealerId: isDealerExists?._id,
        isActive: true,
      });
      if (!isWarehouseExists) {
        throw new ApiError(httpStatus.OK, "Invalid Warehouse.");
      }
      let foundInventory = await productSummaryService?.getOneByMultiField({
        warehouseId: isWarehouseExists?._id,
        productGroupId: { $in: allProducts },
      });
      if (!foundInventory) {
        throw new ApiError(httpStatus.OK, "Dealer don't have inventory");
      }
    }
    if (warehouseId !== null) {
      var isWarehouseExists = await warehouseService.getOneByMultiField({
        _id: warehouseId,
        isActive: true,
      });
      if (!isWarehouseExists) {
        throw new ApiError(httpStatus.OK, "Invalid company warehouse");
      }
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
            assignWarehouseLabel: isWarehouseExists
              ? isWarehouseExists?.wareHouseName
              : "",
            assignDealerLabel: isDealerExists
              ? `${isDealerExists?.firstName} ${isDealerExists?.lastName}`
              : "",
          },
        }
      )
      .then(async (ress) => {
        await addToOrderFlow(
          ress?._id,
          ress?.orderNumber,
          ress?.assignWarehouseLabel
            ? `Order assigned to ${ress?.assignWarehouseLabel} warehouse from batch`
            : ress?.assignDealerLabel
            ? `Order assigned to ${ress?.assignDealerLabel} dealer from batch`
            : "",
          ress.status,
          req.userData.userName
        );
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
        await addToOrderFlow(
          ress?._id,
          ress?.orderNumber,
          `Order assigned toDeliveryboy`,
          ress.status,
          req.userData.userName
        );

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

// generate STS token

exports.getAmazoneOrder = async (req, res) => {
  try {
    const sts = new AWS.STS({
      accessKeyId:
        "amzn1.application-oa2-client.435ca9bffce24b97b1a446902cc09631",
      secretAccessKey:
        "amzn1.oa2-cs.v1.fcb81f1ac8c896cc08e625b95431a92d375661b21aeae4a4bfe3da7da",
      region: "ap-south-1",
    });

    // Parameters for AssumeRole
    const params = {
      RoleArn:
        "arn:aws:iam::amzn1.sp.solution.ac9ee5ed-74d2-4ebb-9cb8-121182ed9a15:role/SAPTEL",
      RoleSessionName: "YourSessionName",
      DurationSeconds: 3600, // 1 hour, can be between 900 and 3600 seconds
    };

    // Assume the role
    sts.assumeRole(params, (err, data) => {
      if (err) {
      } else {
        const { Credentials } = data;
      }
    });
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

// get multiple order

exports.getMultipleOrder = async (req, res) => {
  try {
    //if no default query then pass {}
    let { mobileNumbers, orderNumbers } = req.body;

    let matchQuery = {
      $and: [{ isDeleted: false }],
    };

    if (mobileNumbers?.length) {
      matchQuery.$and.push({
        mobileNo: { $in: mobileNumbers },
      });
    }
    if (orderNumbers?.length) {
      matchQuery.$and.push({
        orderNumber: { $in: orderNumbers },
      });
    }

    let additionalQuery = [
      {
        $match: matchQuery,
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

          deleiveryBoyLabel: {
            $arrayElemAt: ["$deleivery_by_data.name", 0],
          },

          callCenterLabel: {
            $arrayElemAt: ["$callcenterdata.callCenterName", 0],
          },
        },
      },
      {
        $unset: [
          "channel_data",
          "did_data",

          "callcenterdata",

          "deleivery_by_data",
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
      $and: [],
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
        { $limit: 10 },
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
          orderStatusEnum.cancel,
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

// get dealaer NDR  order
exports.getDealerNDROrder = async (req, res) => {
  try {
    //if no default query then pass {}
    const { phno } = req.params;
    let matchQuery = {
      isDeleted: false,
      mobileNo: phno,
      assignWarehouseId: null,
      isOrderAssigned: true,
      status: orderStatusEnum.psc,
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
    ];

    let dataExist = await orderService.aggregateQuery(additionalQuery);
    if (!dataExist || !dataExist?.length) {
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

// get warehouse NDR order

exports.getWarehouseNDROrder = async (req, res) => {
  try {
    //if no default query then pass {}
    const { phno } = req.params;
    let matchQuery = {
      isDeleted: false,
      mobileNo: phno,
      assignDealerId: null,
      isOrderAssigned: true,
      status: {
        $ne: [
          orderStatusEnum.delivered,
          orderStatusEnum.doorCancelled,
          orderStatusEnum.rto,
          orderStatusEnum.cancel,
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
    ];

    let dataExist = await orderService.aggregateQuery(additionalQuery);
    if (!dataExist || !dataExist?.length) {
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

//get all orders status count

exports.getAllOrderStatusCount = async (req, res) => {
  try {
    var dateFilter = req.body.dateFilter;
    let allowedDateFiletrKeys = ["createdAt", "updatedAt"];

    const datefilterQuery = await getDateFilterQuery(
      dateFilter,
      allowedDateFiletrKeys
    );
    //if no default query then pass {}
    let additionalQuery = [
      {
        $match: {
          ...datefilterQuery[0],
          companyId: new mongoose.Types.ObjectId(req.userData.companyId),
        },
      },
      {
        $facet: {
          freshOrders: [
            {
              $match: {
                status: orderStatusEnum.fresh,
              },
            },
            {
              $count: "count",
            },
          ],
          allOrders: [
            {
              $count: "count",
            },
          ],
          prepaidOrders: [
            {
              $match: {
                status: orderStatusEnum.prepaid,
              },
            },
            {
              $count: "count",
            },
          ],
          deliveredOrders: [
            {
              $match: {
                status: orderStatusEnum.delivered,
              },
            },
            {
              $count: "count",
            },
          ],
          doorCancelledOrders: [
            {
              $match: {
                status: orderStatusEnum.doorCancelled,
              },
            },
            {
              $count: "count",
            },
          ],
          holdOrders: [
            {
              $match: {
                status: orderStatusEnum.hold,
              },
            },
            {
              $count: "count",
            },
          ],
          pscOrders: [
            {
              $match: {
                status: orderStatusEnum.psc,
              },
            },
            {
              $count: "count",
            },
          ],
          unaOrders: [
            {
              $match: {
                status: orderStatusEnum.una,
              },
            },
            {
              $count: "count",
            },
          ],
          pndOrders: [
            {
              $match: {
                status: orderStatusEnum.pnd,
              },
            },
            {
              $count: "count",
            },
          ],
          urgentOrders: [
            {
              $match: {
                status: orderStatusEnum.urgent,
              },
            },
            {
              $count: "count",
            },
          ],
          nonActionOrders: [
            {
              $match: {
                status: orderStatusEnum.nonAction,
              },
            },
            {
              $count: "count",
            },
          ],
          rtoOrders: [
            {
              $match: {
                status: orderStatusEnum.rto,
              },
            },
            {
              $count: "count",
            },
          ],
          inquiryOrders: [
            {
              $match: {
                status: orderStatusEnum.inquiry,
              },
            },
            {
              $count: "count",
            },
          ],
          reattemptOrders: [
            {
              $match: {
                status: orderStatusEnum.reattempt,
              },
            },
            {
              $count: "count",
            },
          ],
          deliveryOutOfNetworkOrders: [
            {
              $match: {
                status: orderStatusEnum.deliveryOutOfNetwork,
              },
            },
            {
              $count: "count",
            },
          ],
          intransitOrders: [
            {
              $match: {
                status: orderStatusEnum.intransit,
              },
            },
            {
              $count: "count",
            },
          ],
          ndrOrders: [
            {
              $match: {
                status: orderStatusEnum.ndr,
              },
            },
            {
              $count: "count",
            },
          ],
        },
      },
      {
        $project: {
          freshOrders: {
            $ifNull: [{ $arrayElemAt: ["$freshOrders.count", 0] }, 0],
          },
          allOrders: {
            $ifNull: [{ $arrayElemAt: ["$allOrders.count", 0] }, 0],
          },
          prepaidOrders: {
            $ifNull: [{ $arrayElemAt: ["$prepaidOrders.count", 0] }, 0],
          },
          deliveredOrders: {
            $ifNull: [{ $arrayElemAt: ["$deliveredOrders.count", 0] }, 0],
          },
          doorCancelledOrders: {
            $ifNull: [{ $arrayElemAt: ["$doorCancelledOrders.count", 0] }, 0],
          },
          holdOrders: {
            $ifNull: [{ $arrayElemAt: ["$holdOrders.count", 0] }, 0],
          },
          pscOrders: {
            $ifNull: [{ $arrayElemAt: ["$pscOrders.count", 0] }, 0],
          },
          unaOrders: {
            $ifNull: [{ $arrayElemAt: ["$unaOrders.count", 0] }, 0],
          },
          pndOrders: {
            $ifNull: [{ $arrayElemAt: ["$pndOrders.count", 0] }, 0],
          },
          urgentOrders: {
            $ifNull: [{ $arrayElemAt: ["$urgentOrders.count", 0] }, 0],
          },
          nonActionOrders: {
            $ifNull: [{ $arrayElemAt: ["$nonActionOrders.count", 0] }, 0],
          },
          rtoOrders: {
            $ifNull: [{ $arrayElemAt: ["$rtoOrders.count", 0] }, 0],
          },
          inquiryOrders: {
            $ifNull: [{ $arrayElemAt: ["$inquiryOrders.count", 0] }, 0],
          },
          reattemptOrders: {
            $ifNull: [{ $arrayElemAt: ["$reattemptOrders.count", 0] }, 0],
          },
          deliveryOutOfNetworkOrders: {
            $ifNull: [
              { $arrayElemAt: ["$deliveryOutOfNetworkOrders.count", 0] },
              0,
            ],
          },
          intransitOrders: {
            $ifNull: [{ $arrayElemAt: ["$intransitOrders.count", 0] }, 0],
          },
          ndrOrders: {
            $ifNull: [{ $arrayElemAt: ["$ndrOrders.count", 0] }, 0],
          },
        },
      },
    ];

    let dataExist = await orderService.aggregateQuery(additionalQuery);

    if (!dataExist || !dataExist?.length) {
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

// get GPO order status count

exports.getGPOOrderStatusCount = async (req, res) => {
  try {
    var dateFilter = req.body.dateFilter;
    var warehouseId = req.params.wid;
    let allowedDateFiletrKeys = ["createdAt", "updatedAt"];

    const datefilterQuery = await getDateFilterQuery(
      dateFilter,
      allowedDateFiletrKeys
    );

    let additionalQuery = [
      {
        $match: {
          ...datefilterQuery[0],
          assignWarehouseId: new mongoose.Types.ObjectId(warehouseId),
          orderAssignedToCourier: preferredCourierPartner.gpo,
        },
      },
      {
        $project: {
          shcemeQuantity: 1,
          schemeProducts: 1,
          orderStatus: 1,
        },
      },
      {
        $addFields: {
          "schemeProducts.productQantity": "$shcemeQuantity",
        },
      },
      {
        $unwind: "$schemeProducts",
      },
      {
        $group: {
          _id: {
            orderStatus: "$orderStatus",
            productGroupName: "$schemeProducts.productGroupName",
          },
          totalQuantity: { $sum: "$schemeProducts.productQantity" },
        },
      },
      {
        $group: {
          _id: "$_id.orderStatus",
          products: {
            $push: {
              productGroupName: "$_id.productGroupName",
              quantity: "$totalQuantity",
            },
          },
          count: { $sum: "$totalQuantity" },
        },
      },
      {
        $project: {
          _id: 1,
          products: {
            $map: {
              input: "$products",
              as: "product",
              in: {
                productGroupName: "$$product.productGroupName",
                quantity: "$$product.quantity",
              },
            },
          },
          count: 1,
        },
      },
    ];

    let dataExist = await orderService.aggregateQuery(additionalQuery);

    let additionalQueryNew = [
      {
        $match: {
          ...datefilterQuery[0],
          assignWarehouseId: new mongoose.Types.ObjectId(warehouseId),
          orderAssignedToCourier: preferredCourierPartner.gpo,
        },
      },
      {
        $group: {
          _id: "$orderStatus",
          count: { $sum: 1 },
        },
      },
    ];
    let OrderCount = await orderService.aggregateQuery(additionalQueryNew);

    if (!dataExist || !dataExist?.length) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successfull.",
        status: true,
        data: { products: dataExist, orders: OrderCount },
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

// get GPO order status count

exports.getShipyaariOrderStatusCount = async (req, res) => {
  try {
    var dateFilter = req.body.dateFilter;
    var warehouseId = req.params.wid;
    let allowedDateFiletrKeys = ["createdAt", "updatedAt"];

    const datefilterQuery = await getDateFilterQuery(
      dateFilter,
      allowedDateFiletrKeys
    );

    let additionalQuery = [
      {
        $match: {
          ...datefilterQuery[0],
          assignWarehouseId: new mongoose.Types.ObjectId(warehouseId),
          orderAssignedToCourier: preferredCourierPartner.shipyaari,
        },
      },
      {
        $project: {
          shcemeQuantity: 1,
          schemeProducts: 1,
          orderStatus: 1,
        },
      },
      {
        $addFields: {
          "schemeProducts.productQantity": "$shcemeQuantity",
        },
      },
      {
        $unwind: "$schemeProducts",
      },
      {
        $group: {
          _id: {
            orderStatus: "$orderStatus",
            productGroupName: "$schemeProducts.productGroupName",
          },
          totalQuantity: { $sum: "$schemeProducts.productQantity" },
        },
      },
      {
        $group: {
          _id: "$_id.orderStatus",
          products: {
            $push: {
              productGroupName: "$_id.productGroupName",
              quantity: "$totalQuantity",
            },
          },
          count: { $sum: "$totalQuantity" },
        },
      },
      {
        $project: {
          _id: 1,
          products: {
            $map: {
              input: "$products",
              as: "product",
              in: {
                productGroupName: "$$product.productGroupName",
                quantity: "$$product.quantity",
              },
            },
          },
          count: 1,
        },
      },
    ];

    let dataExist = await orderService.aggregateQuery(additionalQuery);

    let additionalQueryNew = [
      {
        $match: {
          ...datefilterQuery[0],
          assignWarehouseId: new mongoose.Types.ObjectId(warehouseId),
          orderAssignedToCourier: preferredCourierPartner.shipyaari,
        },
      },
      {
        $group: {
          _id: "$orderStatus",
          count: { $sum: 1 },
        },
      },
    ];
    let OrderCount = await orderService.aggregateQuery(additionalQueryNew);

    if (!dataExist || !dataExist?.length) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successfull.",
        status: true,
        data: { products: dataExist, orders: OrderCount },
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

// get GPO order status count

exports.getEcomOrderStatusCount = async (req, res) => {
  try {
    var dateFilter = req.body.dateFilter;
    var warehouseId = req.params.wid;
    let allowedDateFiletrKeys = ["createdAt", "updatedAt"];

    const datefilterQuery = await getDateFilterQuery(
      dateFilter,
      allowedDateFiletrKeys
    );

    let additionalQuery = [
      {
        $match: {
          ...datefilterQuery[0],
          assignWarehouseId: new mongoose.Types.ObjectId(warehouseId),
          orderType: { $in: [orderTypeEnum.website, orderTypeEnum.amazone] },
        },
      },
      {
        $project: {
          shcemeQuantity: 1,
          schemeProducts: 1,
          orderStatus: 1,
        },
      },
      {
        $addFields: {
          "schemeProducts.productQantity": "$shcemeQuantity",
        },
      },
      {
        $unwind: "$schemeProducts",
      },
      {
        $group: {
          _id: {
            orderStatus: "$orderStatus",
            productGroupName: "$schemeProducts.productGroupName",
          },
          totalQuantity: { $sum: "$schemeProducts.productQantity" },
        },
      },
      {
        $group: {
          _id: "$_id.orderStatus",
          products: {
            $push: {
              productGroupName: "$_id.productGroupName",
              quantity: "$totalQuantity",
            },
          },
          count: { $sum: "$totalQuantity" },
        },
      },
      {
        $project: {
          _id: 1,
          products: {
            $map: {
              input: "$products",
              as: "product",
              in: {
                productGroupName: "$$product.productGroupName",
                quantity: "$$product.quantity",
              },
            },
          },
          count: 1,
        },
      },
    ];

    let dataExist = await orderService.aggregateQuery(additionalQuery);

    let additionalQueryNew = [
      {
        $match: {
          ...datefilterQuery[0],
          assignWarehouseId: new mongoose.Types.ObjectId(warehouseId),
          orderType: { $in: [orderTypeEnum.website, orderTypeEnum.amazone] },
        },
      },
      {
        $group: {
          _id: "$orderStatus",
          count: { $sum: 1 },
        },
      },
    ];
    let OrderCount = await orderService.aggregateQuery(additionalQueryNew);

    if (!dataExist || !dataExist?.length) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successfull.",
        status: true,
        data: { products: dataExist, orders: OrderCount },
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
        },
      },
    ];
    // let userRoleData = await getUserRoleData(req);
    // let fieldsToDisplay = getFieldsToDisplay(
    //   moduleType.order,
    //   userRoleData,
    //   actionType.view
    // );
    let dataExist = await orderService.aggregateQuery(additionalQuery);
    // let allowedFields = getAllowedField(fieldsToDisplay, dataExist);

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

// get by mobilenumber

exports.getByMobileNumber = async (req, res) => {
  try {
    let { barcode, contactNumber, complaintNumber, email, orderNumber } =
      req.body;

    // let matchQuery = {
    //   companyId: new mongoose.Types.ObjectId(req.userData.companyId),
    // };

    let matchQuery = {
      $and: [
        { companyId: new mongoose.Types.ObjectId(req.userData.companyId) },
      ],
    };

    if (contactNumber) {
      matchQuery.$or = [
        { mobileNo: contactNumber },
        { alternateNo: contactNumber },
        // { alternateNo: complaintNumber },
      ];
    }

    if (email) {
      matchQuery.emailId = email;
    }
    if (orderNumber) {
      // matchQuery.orderNumber = orderNumber;
      matchQuery.$and.push({ orderNumber: orderNumber });
    }
    if (barcode) {
      let barcodeData = await barcodeService.getOneByMultiField({
        barcodeNumber: barcode,
      });
      if (barcodeData) {
        matchQuery.$and.push({
          "barcodeData.barcodeId": {
            $in: [new mongoose.Types.ObjectId(barcodeData?._id)],
          },
        });
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
    matchQuery.orderNumber = { $ne: null };

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
    let additionalQuery = [];
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

// get by order number for mannual mapping

exports.getByOrderNumberForMannualMapping = async (req, res) => {
  try {
    let ordernumber = req.params.ordernumber;
    let assignWarehouseId = req.params.assignWarehouseId;
    let additionalQuery = [
      {
        $match: {
          orderNumber: parseInt(ordernumber),
          isDeleted: false,
          status: {
            $in: [
              orderStatusEnum.fresh,
              orderStatusEnum.prepaid,
              orderStatusEnum.urgent,
            ],
          },
          orderStatus: productStatus.notDispatched,
          assignDealerId: null,
          assignWarehouseId: new mongoose.Types.ObjectId(assignWarehouseId),
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

// get by order number for invoice
exports.getByOrderNumberForInvoice = async (req, res) => {
  try {
    let ordernumber = req.params.ordernumber;
    let additionalQuery = [
      {
        $match: {
          orderNumber: parseInt(ordernumber),
        },
      },
      {
        $lookup: {
          from: "companies",
          localField: "companyId",
          foreignField: "_id",
          as: "companyDetail",
        },
      },
      {
        $lookup: {
          from: "warehouses",
          localField: "assignWarehouseId",
          foreignField: "_id",
          as: "warehouseData",
          pipeline: [
            {
              $project: {
                billingAddress: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "countries",
          localField: "warehouseData.billingAddress.countryId",
          foreignField: "_id",
          as: "country_name",
          pipeline: [{ $project: { countryName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "states",
          localField: "warehouseData.billingAddress.stateId",
          foreignField: "_id",
          as: "state_name",
          pipeline: [{ $project: { stateName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "districts",
          localField: "warehouseData.billingAddress.districtId",
          foreignField: "_id",
          as: "district_name",
          pipeline: [{ $project: { districtName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "pincodes",
          localField: "warehouseData.billingAddress.pincodeId",
          foreignField: "_id",
          as: "pincode_name",
          pipeline: [{ $project: { pincode: 1 } }],
        },
      },
      {
        $addFields: {
          itemName: {
            $arrayElemAt: ["$item_name.itemName", 0],
          },
          companyDetails: {
            $arrayElemAt: ["$companyDetail", 0],
          },
          warehouseBillingInfo: {
            $mergeObjects: [
              {
                $arrayElemAt: ["$warehouseData.billingAddress", 0],
              },
              {
                countryLable: {
                  $arrayElemAt: ["$country_name.countryName", 0],
                },
                stateLable: {
                  $arrayElemAt: ["$state_name.stateName", 0],
                },
                districtLable: {
                  $arrayElemAt: ["$district_name.districtName", 0],
                },
                pincodeLable: {
                  $arrayElemAt: ["$pincode_name.pincode", 0],
                },
              },
            ],
          },
        },
      },
      {
        $unset: [
          "item_name",
          "companyDetail",
          "warehouseData",
          "country_name",
          "state_name",
          "district_name",
          "pincode_name",
        ],
      },
      {
        $unwind: {
          path: "$schemeProducts",
          preserveNullAndEmptyArrays: true, // Keep orders even if no schemeProducts
        },
      },
      {
        $lookup: {
          from: "productgroups",
          localField: "schemeProducts.productGroupId",
          foreignField: "_id",
          as: "productInfo",
        },
      },

      {
        $lookup: {
          from: "productsubcategories",
          localField: "productInfo.productSubCategoryId",
          foreignField: "_id",
          as: "productSubCategoryInfo",
        },
      },
      {
        $unwind: {
          path: "$productInfo",
          preserveNullAndEmptyArrays: true, // Keep orders even if no productInfo
        },
      },
      {
        $unwind: {
          path: "$productSubCategoryInfo",
          preserveNullAndEmptyArrays: true, // Keep orders even if no productInfo
        },
      },
      {
        $addFields: {
          // Add product details directly into schemeProducts
          "schemeProducts.dealerSalePrice": "$productInfo.dealerSalePrice",
          "schemeProducts.gst": "$productInfo.gst",
          "schemeProducts.cgst": "$productInfo.cgst",
          "schemeProducts.sgst": "$productInfo.sgst",
          "schemeProducts.igst": "$productInfo.igst",
          "schemeProducts.utgst": "$productInfo.utgst",
          "schemeProducts.productSubCategory":
            "$productSubCategoryInfo.subCategoryName",
          "schemeProducts.hsnCode": "$productSubCategoryInfo.hsnCode",
        },
      },
      {
        $group: {
          _id: "$_id", // Group by order ID
          schemeProducts: { $push: "$schemeProducts" },
          // Include all other fields from the original document
          mergedData: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              "$mergedData", // Original order document
              {
                schemeProducts: "$schemeProducts", // Updated schemeProducts array
              },
            ],
          },
        },
      },
      { $unset: ["productInfo"] },
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
    let searchValue = req.body.searchValue;
    var callbackDateFilter = req.body.callbackDateFilter;
    var prefferedDeliveryDate = req.body.prefferedDeliveryDate;
    let searchIn = req.body.searchIn;
    let filterBy = req.body.filterBy;
    let rangeFilterBy = req.body.rangeFilterBy;
    let orderNumber = req.body.orderNumber;
    let barcodeNumber = req.body.barcodeNumber;

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
      $and: [],
    };

    // if order number given
    if (orderNumber) {
      matchQuery.$and.push({ orderNumber: parseInt(orderNumber) });
    }

    if (barcodeNumber) {
      let barcodeData = await barcodeService.getOneByMultiField({
        isDeleted: false,
        isUsed: true,
        barcodeNumber: barcodeNumber,
      });

      if (barcodeData) {
        matchQuery.$and.push({
          "barcodeData.barcodeId": barcodeData?._id,
        });
      }
    }

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
    let booleanFields = ["firstCallApproval", "isUrgentOrder", "approved"];
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
      "schemeProducts.productGroupId",
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

    // const datefilterQuery = await getDateFilterQuery(
    //   dateFilter,
    //   allowedDateFiletrKeys
    // );
    const datefilterQuery = await getDateFilterQueryForTask(
      dateFilter,
      allowedDateFiletrKeys
    );

    if (datefilterQuery && datefilterQuery.length) {
      matchQuery.$and.push(...datefilterQuery);
    }
    //
    let allowedPrefferedDeliveryDate = ["preffered_delivery_date"];
    const prefferedDeliverydatefilterQuery =
      await getDateFilterQueryCallBackAndPreferedDate(
        prefferedDeliveryDate,
        allowedPrefferedDeliveryDate
      );
    if (
      prefferedDeliverydatefilterQuery &&
      prefferedDeliverydatefilterQuery.length
    ) {
      matchQuery.$and.push(...prefferedDeliverydatefilterQuery);
    }

    let allowedCallbackDateFiletrKeys = ["firstCallCallBackDate"];

    const datefilterCallbackQuery =
      await getDateFilterQueryCallBackAndPreferedDate(
        callbackDateFilter,
        allowedCallbackDateFiletrKeys
      );
    if (datefilterCallbackQuery && datefilterCallbackQuery.length) {
      matchQuery.$and.push(...datefilterCallbackQuery);
    }

    finalAggregateQuery.push({
      $match: matchQuery,
    });
    let { limit, page, totalData, skip, totalpages } =
      await getLimitAndTotalCount(
        req.body.limit,
        req.body.page,
        await orderService.findCount(matchQuery),
        req.body.isPaginationRequired
      );

    finalAggregateQuery.push({ $sort: { [orderBy]: parseInt(orderByValue) } });
    if (isPaginationRequired) {
      finalAggregateQuery.push({ $skip: skip });
      finalAggregateQuery.push({ $limit: limit });
    }
    /**
     * for lookups , project , addfields or group in aggregate pipeline form dynamic quer in additionalQuery array
     */
    let additionalQuery = [
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

          deleiveryBoyLabel: {
            $arrayElemAt: ["$deleivery_by_data.name", 0],
          },

          callCenterLabel: {
            $arrayElemAt: ["$callcenterdata.callCenterName", 0],
          },
        },
      },

      {
        $unset: ["did_data", "callcenterdata", "deleivery_by_data"],
      },
    ];
    // let additionalQuery = [];
    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    //-----------------------------------
    let dataFound = await orderService.aggregateQuery(finalAggregateQuery);
    if (dataFound.length === 0) {
      throw new ApiError(httpStatus.OK, `No data Found`);
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

    if (
      req.userData.userRole === userRoleType.srManagerDistribution ||
      req.userData.userRole === userRoleType.managerArea
    ) {
      allowedFields?.forEach((ele) => {
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

// =================== all inquiry ===============

// ====================== get all batch filter pagination =============

exports.getBatchFilterPagination = async (req, res) => {
  try {
    const { Id } = req.userData;
    var dateFilter = req.body.dateFilter;
    let searchValue = req.body.searchValue;

    let searchIn = req.body.searchIn;
    let filterBy = req.body.filterBy;
    let rangeFilterBy = req.body.rangeFilterBy;
    let orderNumber = req.body.orderNumber;

    let isPaginationRequired = req.body.isPaginationRequired
      ? req.body.isPaginationRequired
      : true;
    let finalAggregateQuery = [];

    let matchQuery = {
      $and: [
        { assignDealerId: null },
        { assignWarehouseId: null },
        { batchId: null },
      ],
    };
    // if order number given
    if (orderNumber) {
      matchQuery.$and.push({ orderNumber: parseInt(orderNumber) });
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
    let booleanFields = ["firstCallApproval", "isUrgentOrder", "approved"];
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
      "schemeProducts.productGroupId",
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

    // const datefilterQuery = await getDateFilterQuery(
    //   dateFilter,
    //   allowedDateFiletrKeys
    // );
    const datefilterQuery = await getDateFilterQueryForTask(
      dateFilter,
      allowedDateFiletrKeys
    );

    if (datefilterQuery && datefilterQuery.length) {
      matchQuery.$and.push(...datefilterQuery);
    }

    finalAggregateQuery.push({
      $match: matchQuery,
    });
    let { limit, page, totalData, skip, totalpages } =
      await getLimitAndTotalCount(
        req.body.limit,
        req.body.page,
        await orderService.findCount(matchQuery),
        req.body.isPaginationRequired
      );

    finalAggregateQuery.push({ $sort: { [orderBy]: parseInt(orderByValue) } });
    if (isPaginationRequired) {
      finalAggregateQuery.push({ $skip: skip });
      finalAggregateQuery.push({ $limit: limit });
    }
    /**
     * for lookups , project , addfields or group in aggregate pipeline form dynamic quer in additionalQuery array
     */
    let additionalQuery = [
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

          deleiveryBoyLabel: {
            $arrayElemAt: ["$deleivery_by_data.name", 0],
          },

          callCenterLabel: {
            $arrayElemAt: ["$callcenterdata.callCenterName", 0],
          },
        },
      },

      {
        $unset: ["did_data", "callcenterdata", "deleivery_by_data"],
      },
    ];
    // let additionalQuery = [];
    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    //-----------------------------------
    let dataFound = await orderService.aggregateQuery(finalAggregateQuery);
    if (dataFound.length === 0) {
      throw new ApiError(httpStatus.OK, `No data Found`);
    }

    // let userRoleData = await getUserRoleData(req);
    // let fieldsToDisplay = getFieldsToDisplay(
    //   moduleType.order,
    //   userRoleData,
    //   actionType.pagination
    // );
    let result = await orderService.aggregateQuery(finalAggregateQuery);
    // let allowedFields = getAllowedField(fieldsToDisplay, result);

    // check for zonal manager and zonal exicutive

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

// =============all filter pagination api start================
exports.allFilterPaginationFirstCall = async (req, res) => {
  try {
    const { Id } = req.userData;
    let getBatchData = req.body.getBatchData;
    var dateFilter = req.body.dateFilter;
    var callbackDateFilter = req.body.callbackDateFilter;
    let searchValue = req.body.searchValue;
    let searchIn = req.body.searchIn;
    let filterBy = req.body.filterBy;
    let rangeFilterBy = req.body.rangeFilterBy;
    let callCenterId = req.body.callCenterId;

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
      $and: [
        { isDeleted: false },
        { assignDealerId: null },
        { assignWarehouseId: { $ne: null } },
        { status: { $ne: orderStatusEnum.inquiry } },
      ],
    };

    // if callCenterId givin
    if (callCenterId !== null) {
      matchQuery.$and.push({
        callCenterId: new mongoose.Types.ObjectId(callCenterId),
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

    const datefilterQuery = await getDateFilterQueryForTask(
      dateFilter,
      allowedDateFiletrKeys
    );

    if (datefilterQuery && datefilterQuery.length) {
      matchQuery.$and.push(...datefilterQuery);
    }

    finalAggregateQuery.push({
      $match: matchQuery,
    });
    let { limit, page, totalData, skip, totalpages } =
      await getLimitAndTotalCount(
        req.body.limit,
        req.body.page,
        await orderService.findCount(matchQuery),
        req.body.isPaginationRequired
      );

    finalAggregateQuery.push({ $sort: { [orderBy]: parseInt(orderByValue) } });
    if (isPaginationRequired) {
      finalAggregateQuery.push({ $skip: skip });
      finalAggregateQuery.push({ $limit: limit });
    }
    /**
     * for lookups , project , addfields or group in aggregate pipeline form dynamic quer in additionalQuery array
     */
    let additionalQuery = [
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

          deleiveryBoyLabel: {
            $arrayElemAt: ["$deleivery_by_data.name", 0],
          },

          callCenterLabel: {
            $arrayElemAt: ["$callcenterdata.callCenterName", 0],
          },
        },
      },

      {
        $unset: ["did_data", "callcenterdata", "deleivery_by_data"],
      },
    ];
    // let additionalQuery = [];
    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    //-----------------------------------
    let dataFound = await orderService.aggregateQuery(finalAggregateQuery);
    if (dataFound.length === 0) {
      throw new ApiError(httpStatus.OK, `No data Found`);
    }

    // let userRoleData = await getUserRoleData(req);
    // let fieldsToDisplay = getFieldsToDisplay(
    //   moduleType.order,
    //   userRoleData,
    //   actionType.pagination
    // );
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
    if (datefilterQuery && datefilterQuery.length) {
      matchQuery.$and.push(...datefilterQuery);
    }

    finalAggregateQuery.push({
      $match: matchQuery,
    });

    //calander filter
    //----------------------------
    /**
     * for lookups , project , addfields or group in aggregate pipeline form dynamic quer in additionalQuery array
     */
    let { limit, page, totalData, skip, totalpages } =
      await getLimitAndTotalCount(
        req.body.limit,
        req.body.page,
        await orderService.findCount(matchQuery),
        req.body.isPaginationRequired
      );

    finalAggregateQuery.push({ $sort: { [orderBy]: parseInt(orderByValue) } });
    if (isPaginationRequired) {
      finalAggregateQuery.push({ $skip: skip });
      finalAggregateQuery.push({ $limit: limit });
    }

    let additionalQuery = [
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
          channelLabel: {
            $arrayElemAt: ["$channelData.channelName", 0],
          },

          deleiveryBoyLabel: {
            $arrayElemAt: ["$deleivery_by_data.name", 0],
          },
        },
      },
      {
        $unset: ["channelData", "deleivery_by_data"],
      },
    ];

    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    finalAggregateQuery.push({
      $match: matchQuery,
    });

    // //-----------------------------------
    // //
    // let dataFound = await orderService.aggregateQuery(finalAggregateQuery);
    // console.log(dataFound, "dataFound");
    // if (dataFound.length === 0) {
    //   throw new ApiError(httpStatus.OK, `No data Found`);
    // }

    // // let userRoleData = await getUserRoleData(req);
    // // let fieldsToDisplay = getFieldsToDisplay(
    // //   moduleType.order,
    // //   userRoleData,
    // //   actionType.pagination
    // // );
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
          channelLabel: {
            $arrayElemAt: ["$channelData.channelName", 0],
          },

          deleiveryBoyLabel: {
            $arrayElemAt: ["$deleivery_by_data.name", 0],
          },
        },
      },
      {
        $unset: ["channelData", "deleivery_by_data"],
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
    var callbackDateFilter = req.body.callbackDateFilter;
    var prefferedDeliveryDate = req.body.prefferedDeliveryDate;
    let searchValue = req.body.searchValue;
    let searchIn = req.body.searchIn;
    let filterBy = req.body.filterBy;
    let rangeFilterBy = req.body.rangeFilterBy;
    let dealerId = req.params.dealerId;
    let isPaginationRequired = req.body.isPaginationRequired
      ? req.body.isPaginationRequired
      : true;
    let finalAggregateQuery = [];

    let tomorrowData = getTomorrowDate();

    let matchQuery = {
      $and: [
        {
          assignDealerId: new mongoose.Types.ObjectId(dealerId),
        },
      ],
    };

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
      "delivery_boy_id",
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
    matchQuery.$and.push({
      $or: [
        // Condition 1: preferred_delivery_date is less than or equal to tomorrow
        { preffered_delivery_date: { $lte: new Date(tomorrowData) } },

        // Condition 2: preffered_delivery_date is empty, null, or does not exist

        { preffered_delivery_date: "" },
      ],
    });

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
    let allowedPrefferedDeliveryDate = ["preffered_delivery_date"];
    const prefferedDeliverydatefilterQuery =
      await getDateFilterQueryCallBackAndPreferedDate(
        prefferedDeliveryDate,
        allowedPrefferedDeliveryDate
      );

    if (
      prefferedDeliverydatefilterQuery &&
      prefferedDeliverydatefilterQuery.length
    ) {
      matchQuery.$and.push(...prefferedDeliverydatefilterQuery);
    }

    let allowedCallbackDateFiletrKeys = ["firstCallCallBackDate"];

    const datefilterCallbackQuery =
      await getDateFilterQueryCallBackAndPreferedDate(
        callbackDateFilter,
        allowedCallbackDateFiletrKeys
      );
    if (datefilterCallbackQuery && datefilterCallbackQuery.length) {
      matchQuery.$and.push(...datefilterCallbackQuery);
    }
    //calander filter
    //----------------------------

    /**
     * for lookups , project , addfields or group in aggregate pipeline form dynamic quer in additionalQuery array
     */

    finalAggregateQuery.push({
      $match: matchQuery,
    });

    //-----------------------------------
    // let dataFound = await orderService.aggregateQuery(finalAggregateQuery);

    // if (dataFound.length === 0) {
    //   throw new ApiError(httpStatus.OK, `No data Found here`);
    // }

    let { limit, page, totalData, skip, totalpages } =
      await getLimitAndTotalCount(
        req.body.limit,
        req.body.page,
        await orderService.findCount(matchQuery),

        req.body.isPaginationRequired
      );

    finalAggregateQuery.push({ $sort: { [orderBy]: parseInt(orderByValue) } });
    if (isPaginationRequired) {
      finalAggregateQuery.push({ $skip: skip });
      finalAggregateQuery.push({ $limit: limit });
    }
    let additionalQuery = [
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
          channelLabel: {
            $arrayElemAt: ["$channelData.channelName", 0],
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
        $unset: ["channelData", "deleivery_by_data"],
      },
    ];

    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
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

    let updatedOrder = await orderService.getOneAndUpdate(
      { _id },
      { orderStatus: productStatus.complete }
    );
    if (updatedOrder) {
      await addToOrderFlow(
        updatedOrder?._id,
        updatedOrder?.orderNumber,
        `Order completed`,
        updatedOrder.status,
        req.userData.userName
      );

      return res.status(httpStatus.OK).send({
        message: "Updated successfully",
        status: true,
        data: null,
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

// mark as delivered

exports.markAsDelivered = async (req, res) => {
  try {
    let _id = req.params.id;
    if (
      !(await orderService.getOneByMultiField({
        _id,
        status: orderStatusEnum.intransit,
      }))
    ) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }

    let updatedOrder = await orderService.getOneAndUpdate(
      { _id },
      {
        status: orderStatusEnum.delivered,
        deliveredBy: req.userData.userName,
      }
    );
    if (updatedOrder) {
      await addToOrderFlow(
        updatedOrder?._id,
        updatedOrder?.orderNumber,
        `Order Delivered by ${req.userData.userName}`,
        updatedOrder.status,
        req.userData.userName
      );

      return res.status(httpStatus.OK).send({
        message: "Updated successfully",
        status: true,
        data: null,
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

// dealer ordaer status change
exports.dealerOrderStatusChange = async (req, res) => {
  try {
    let _id = req.params.id;
    let {
      status,
      remark,
      dealerReason,
      dealerFirstCaller,
      callBackDate,
      barcodeData,
    } = req.body;
    if (!(await orderService.getOneByMultiField({ _id }))) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let pscDate = status === orderStatusEnum.psc ? new Date() : "";

    let dataToUpdate = {
      status: status,
      remark,
      preShipCancelationDate: pscDate,
      dealerReason,
      dealerFirstCaller,
      firstCallCallBackDate: callBackDate,
    };
    if (status === orderStatusEnum.delivered) {
      dataToUpdate.deliveredBy = req.userData.userName;
      dataToUpdate.barcodeData = barcodeData?.map((ele) => {
        return { barcodeId: ele.barcodeId, barcode: ele?.barcode };
      });
      await Promise.all(
        barcodeData?.map(async (ele) => {
          await addRemoveAvailableQuantity(
            req.userData.companyId,
            ele?.dealerWareHouseId,
            ele?.productGroupId,
            1,
            "REMOVE"
          );
          await barcodeService?.getOneAndUpdate(
            { barcode: ele?.barcode },
            { $set: { status: barcodeStatusType.delivered } }
          );
        })
      );
    }
    let orderUpdated = await orderService.getOneAndUpdate(
      { _id },
      {
        $set: dataToUpdate,
      }
    );
    if (!orderUpdated) {
      throw new ApiError(httpStatus.OK, "Some thing went wrong.");
    }

    await addToOrderFlow(
      orderUpdated?._id,
      orderUpdated?.orderNumber,
      `Dealer changed order status to ${orderUpdated.status}`,
      orderUpdated.status,
      req.userData.userName
    );
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

exports.prePaidApprove = async (req, res) => {
  try {
    let _id = req.params.orderid;
    let transactionId = req.body.transactionId;

    if (!(await orderService.getOneByMultiField({ _id }))) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }

    let updatedOrder = await orderService.getOneAndUpdate(
      { _id },
      {
        approved: true,
        transactionId: transactionId,
      }
    );

    await addToOrderFlow(
      updatedOrder?._id,
      updatedOrder?.orderNumber,
      `Prepaid order approved transaction ID is : ${updatedOrder?.transactionId}`,
      updatedOrder.status,
      req.userData.userName
    );
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

// bulk status change

exports.bulkStatusChange = async (req, res) => {
  try {
    const warehouseId = req.params.wid;
    const { companyId } = req.userData;
    const { orderNumbers, courierType, status, condition } = req.body;

    // Prepare update object for orders based on status and condition
    let barcodeUpdateObject = {};
    if (status === orderStatusEnum.rto) {
      barcodeUpdateObject.status =
        condition === courierRTOType.fresh
          ? barcodeStatusType.atWarehouse
          : condition;
    }

    // Loop through all order numbers and perform bulk operations
    for (const orderNumber of orderNumbers) {
      try {
        // Update order status

        const orderUpdated = await orderService?.getOneAndUpdate(
          {
            orderNumber: parseInt(orderNumber),
            orderAssignedToCourier: courierType,
            orderStatus: productStatus.dispatched,
            companyId,
          },
          { $set: { orderStatus: productStatus.complete, status } }
        );
        if (!orderUpdated || !orderUpdated?.barcodeData?.length) {
          continue; // Skip if no barcodes or order not found
        }
        if (status === orderStatusEnum.rto) {
          // Perform batch update on barcodes
          const barcodes = orderUpdated.barcodeData?.map((ele) => {
            return ele?.barcode;
          });

          const updateResult = await barcodeService.updateMany(
            {
              barcodeNumber: { $in: barcodes },
              isUsed: true,
              wareHouseId: warehouseId,
              companyId: companyId,
            },
            { $set: barcodeUpdateObject }
          );

          // Process barcode flows and return quantities only for valid updates
          if (updateResult.matchedCount > 0) {
            await Promise.all(
              barcodes.map(async (barcode) => {
                const updatedBarcode = await barcodeService.getOneByMultiField({
                  barcodeNumber: barcode,
                  isUsed: true,
                  wareHouseId: warehouseId,
                  companyId: companyId,
                });

                if (updatedBarcode) {
                  await addToBarcodeFlow(
                    updatedBarcode,
                    "Barcode discontinued as it was Damaged or Expired"
                  );

                  await addReturnQuantity(
                    companyId,
                    warehouseId,
                    updatedBarcode.productGroupId,
                    1,
                    condition,
                    null
                  );
                }
              })
            );
          }
        }
      } catch (orderErr) {
        logger.error(
          `Failed to update order ${orderNumber}: ${orderErr.message}`
        );
      }
    }

    res.status(httpStatus.CREATED).send({
      message: "Updated successfully!",
      data: null,
      status: true,
      code: null,
      issue: null,
    });
  } catch (err) {
    const errData = errorRes(err);
    logger.info(errData.resData);
    const { message, status, data, code, issue } = errData.resData;
    res.status(errData.statusCode).send({ message, status, data, code, issue });
  }
};
