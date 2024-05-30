const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
// ----service---------
const callService = require("./CallService");
const orderService = require("../orderInquiry/OrderInquiryService");
const orderInquiryFlowService = require("../orderInquiryFlow/OrderInquiryFlowService");
const stateService = require("../state/StateService");
const schemeService = require("../scheme/SchemeService");
const districtService = require("../district/DistrictService");
const tehsilService = require("../tehsil/TehsilService");
const pincodeService = require("../pincode/PincodeService");
const dealerService = require("../dealer/DealerService");
const areaService = require("../area/AreaService");
const dispositionTwoService = require("../dispositionTwo/DispositionTwoService");
const dispositionThreeService = require("../dispositionThree/DispositionThreeService");
const userService = require("../user/UserService");
const subcategoryService = require("../productSubCategory/ProductSubCategoryService");
const companyService = require("../company/CompanyService");

const dealerPincodeService = require("../dealerPincode/DealerPincodeService");

const {
  getDealer,
  getInquiryNumber,
  getOrderNumber,
  isOrder,
  dealerSurvingPincode,
  getAssignWarehouse,
  isPrepaid,
} = require("./CallHelper");
// ----service---------
const { searchKeys } = require("./CallSchema");
const { errorRes } = require("../../../utils/resError");
const {
  getQuery,
  getUserRoleData,
  getFieldsToDisplay,
  getAllowedField,
} = require("../../helper/utils");
const mongoose = require("mongoose");
const {
  applicableCriteria,
  orderType,
  moduleType,
  actionType,
  orderStatusEnum,
  paymentModeType,
} = require("../../helper/enumUtils");

const {
  getSearchQuery,
  checkInvalidParams,
  getRangeQuery,
  getFilterQuery,
  getDateFilterQuery,
  getLimitAndTotalCount,
  getOrderByAndItsValue,
} = require("../../helper/paginationFilterHelper");
const { default: axios } = require("axios");
const {
  addToOrderFlow,
} = require("../orderInquiryFlow/OrderInquiryFlowHelper");

//add start
exports.add = async (req, res) => {
  try {
    let {
      stateId,
      schemeId,
      districtId,
      tehsilId,
      pincodeId,
      areaId,
      agentName,
      dispositionLevelTwoId,
      dispositionLevelThreeId,
    } = req.body;
    // ===============check id Exist in DB==========

    const isUserExists =
      agentName !== null
        ? await userService.findCount({
            userName: agentName,
            isDeleted: false,
          })
        : null;
    if (agentName !== null && !isUserExists) {
      throw new ApiError(httpStatus.OK, "Invalid Agent User Name.");
    }

    const isStateExists =
      stateId !== null
        ? await stateService.findCount({
            _id: stateId,
            isDeleted: false,
          })
        : null;
    if (stateId !== null && !isStateExists) {
      throw new ApiError(httpStatus.OK, "Invalid State.");
    }

    const isSchemeExists =
      schemeId !== null
        ? await schemeService.findCount({
            _id: schemeId,
            isDeleted: false,
          })
        : null;
    if (schemeId !== null && !isSchemeExists) {
      throw new ApiError(httpStatus.OK, "Invalid Scheme.");
    }

    const isDistrictExists =
      districtId !== null
        ? await districtService.findCount({
            _id: districtId,
            isDeleted: false,
          })
        : null;
    if (districtId !== null && !isDistrictExists) {
      throw new ApiError(httpStatus.OK, "Invalid District.");
    }

    const isTehsilExists =
      tehsilId !== null
        ? await tehsilService.findCount({
            _id: tehsilId,
            isDeleted: false,
          })
        : null;
    if (tehsilId !== null && !isTehsilExists) {
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

    const isPincodeExists =
      pincodeId !== null
        ? await pincodeService.findCount({
            _id: pincodeId,
            isDeleted: false,
          })
        : null;
    if (pincodeId !== null && !isPincodeExists) {
      throw new ApiError(httpStatus.OK, "Invalid Pincode.");
    }

    // const isChannelExists =
    //   channel !== null
    //     ? await channelService.findCount({
    //         _id: channel,
    //         isDeleted: false,
    //       })
    //     : null;
    // if (channel !== null && !isChannelExists) {
    //   throw new ApiError(httpStatus.OK, "Invalid Channel.");
    // }

    const isDispositionTwoExists =
      dispositionLevelTwoId !== null
        ? await dispositionTwoService.findCount({
            _id: dispositionLevelTwoId,
            isDeleted: false,
          })
        : null;
    if (dispositionLevelTwoId !== null && !isDispositionTwoExists) {
      throw new ApiError(httpStatus.OK, "Invalid Disposition Two.");
    }

    const isDispositionThreeExists =
      dispositionLevelThreeId !== null
        ? await dispositionThreeService.findCount({
            _id: dispositionLevelThreeId,
            isDeleted: false,
          })
        : null;
    if (dispositionLevelThreeId !== null && !isDispositionThreeExists) {
      throw new ApiError(httpStatus.OK, "Invalid Disposition Three.");
    }
    // getting userId and company id from userName / agentName
    const userData = await userService.getOneByMultiField({
      userName: agentName,
      isDeleted: false,
    });

    // ===============check id Exist in DB end==========

    /**
     * check duplicate exist
     */
    let dataExist = await callService.isExists([]);
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }

    //------------------create data-------------------
    let dataCreated = await callService.createNewData({
      ...req.body,
      agentId: userData?._id,
      companyId: userData?.companyId,
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

//update start
exports.update = async (req, res) => {
  try {
    let {
      stateId,
      districtId,
      tehsilId,
      schemeId,
      pincodeId,

      areaId,
      paymentMode,
      companyId,
      dispositionLevelTwoId,
      dispositionLevelThreeId,
      agentId,
      agentName,
      recordingStartTime,
      recordingEndTime,
      status,
      shcemeQuantity,
      mobileNo,
      alternateNo,
      productGroupId,
      countryLabel,
      stateLabel,
      districtLabel,
      tehsilLabel,
      pincodeLabel,

      areaLabel,
      dispositionLevelTwoLabel,
      dispositionLevelThreeLabel,
      productGroupLabel,
    } = req.body;

    const isDispositionThreeExists =
      await dispositionThreeService.getOneByMultiField({
        _id: dispositionLevelThreeId,
        isDeleted: false,
        isActive: true,
      });
    if (!isDispositionThreeExists) {
      throw new ApiError(httpStatus.OK, "Invalid Disposition Three.");
    }
    let applicableCriteriaData =
      isDispositionThreeExists?.applicableCriteria[0];
    if (
      applicableCriteriaData === applicableCriteria.isOrder ||
      applicableCriteriaData === applicableCriteria.isPrepaid ||
      applicableCriteriaData === applicableCriteria.isUrgent
    ) {
      let isOrderExists = await orderService.aggregateQuery([
        {
          $match: {
            isDeleted: false,
            isActive: true,
            productGroupId: new mongoose.Types.ObjectId(productGroupId),
            mobileNo: mobileNo,
            orderNumber: { $ne: null },

            status: {
              $nin: [
                orderStatusEnum.delivered,
                orderStatusEnum.doorCancelled,
                orderStatusEnum.rto,
                orderStatusEnum.cancel,
              ],
            },
          },
        },
      ]);
      if (isOrderExists.length) {
        throw new ApiError(
          httpStatus.OK,
          "Order with this number already in process"
        );
      }
    }

    let idToBeSearch = req.params.id;

    if (shcemeQuantity > 9) {
      throw new ApiError(
        httpStatus.OK,
        "Scheme quantity should not be more than 9"
      );
    }

    const isUserExists = await userService.getOneByMultiField({
      _id: agentId,
      isDeleted: false,
      isActive: true,
    });

    if (!isUserExists) {
      throw new ApiError(httpStatus.OK, "Invalid Agent ");
    }

    const isStateExists = await stateService.findCount({
      _id: stateId,
      isDeleted: false,
    });
    if (!isStateExists) {
      throw new ApiError(httpStatus.OK, "Invalid State.");
    }
    const iscompanyExists = await companyService.getOneByMultiField({
      _id: companyId,
      isDeleted: false,
    });
    if (!iscompanyExists) {
      throw new ApiError(httpStatus.OK, "Invalid company.");
    }

    const isSchemeExists = await schemeService.getOneByMultiField({
      _id: schemeId,
      isDeleted: false,
    });
    if (!isSchemeExists) {
      throw new ApiError(httpStatus.OK, "Invalid Scheme.");
    }
    let schemeProductsForOrder = isSchemeExists.productInformation?.map(
      (ele) => {
        return {
          productGroupName: ele?.productGroupName,
          productGroupId: ele?.productGroup,
        };
      }
    );

    let subCatData = await subcategoryService?.getOneByMultiField({
      isDeleted: false,
      _id: isSchemeExists.subCategory,
    });
    if (!subCatData) {
      throw new ApiError(httpStatus.OK, "Invalid Subcategory");
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

    const isPincodeExists = await pincodeService.getOneByMultiField({
      _id: pincodeId,
      isDeleted: false,
      isActive: true,
    });
    if (!isPincodeExists) {
      throw new ApiError(httpStatus.OK, "Invalid Pincode.");
    }

    const isDispositionTwoExists = await dispositionTwoService.findCount({
      _id: dispositionLevelTwoId,
      isDeleted: false,
    });
    if (!isDispositionTwoExists) {
      throw new ApiError(httpStatus.OK, "Invalid Disposition Two.");
    }

    //------------------Find data-------------------
    let datafound = await callService.getOneByMultiField({
      _id: idToBeSearch,
    });
    if (!datafound) {
      throw new ApiError(httpStatus.OK, `Inbound not found.`);
    }

    // let dispositionThreeId = dataCreated.dispositionLevelThreeId;

    let dispositionThreeData = await dispositionThreeService.findAllWithQuery({
      _id: new mongoose.Types.ObjectId(dispositionLevelThreeId),
    });

    // ---------map for order-------
    let flag = await isOrder(dispositionThreeData[0]?.applicableCriteria);
    let prepaidOrderFlag = await isPrepaid(
      dispositionThreeData[0]?.applicableCriteria
    );

    // dealers who serves on this pincode
    const dealerServingPincode = await dealerSurvingPincode(
      isPincodeExists?.pincode,
      companyId,
      schemeId
    );
    if (dealerServingPincode.length === 1) {
      var assidnedDealerData = await dealerService?.getOneByMultiField({
        _id: dealerServingPincode[0]?.dealerId,
      });
    }
    // getting warehouse ID
    const servingWarehouse = await getAssignWarehouse(companyId);

    const orderNumber = await getOrderNumber();
    const inquiryNumber = await getInquiryNumber();

    try {
      const orderInquiry = await orderService.createNewData({
        ...req.body,
        status: flag
          ? status
          : prepaidOrderFlag
          ? orderStatusEnum.prepaid
          : orderStatusEnum.inquiry,
        orderNumber: flag || prepaidOrderFlag ? orderNumber : null,
        inquiryNumber: inquiryNumber,
        isOrderAssigned:
          dealerServingPincode.length > 1 || servingWarehouse === undefined
            ? false
            : true,
        assignDealerId:
          dealerServingPincode.length === 1
            ? dealerServingPincode[0]?.dealerId
            : null,
        assignDealerLabel:
          dealerServingPincode.length === 1
            ? assidnedDealerData?.firstName + " " + assidnedDealerData?.lastName
            : "",
        assignDealerCode:
          dealerServingPincode.length === 1
            ? assidnedDealerData?.dealerCode
            : "",
        assignDealerStatus:
          dealerServingPincode.length === 1 ? assidnedDealerData?.isActive : "",
        assignWarehouseId:
          dealerServingPincode.length === 0 ? servingWarehouse?._id : null,
        assignWarehouseLabel:
          dealerServingPincode.length === 0
            ? servingWarehouse?.wareHouseName
            : "",
        approved: flag ? true : prepaidOrderFlag ? false : true,
        agentId: isUserExists?.agentId,
        agentName: agentName,
        recordingStartTime: recordingStartTime,
        recordingEndTime: recordingEndTime,
        callCenterId: isUserExists?.callCenterId,
        branchId: isUserExists?.branchId,
        paymentMode: prepaidOrderFlag
          ? paymentModeType.UPI_ONLINE
          : paymentModeType.COD,
        isUrgentOrder:
          dispositionThreeData[0]?.applicableCriteria ===
          applicableCriteria.isUrgent,
        countryLabel,
        stateLabel,
        districtLabel,
        tehsilLabel,
        pincodeLabel,

        areaLabel,
        dispositionLevelTwoLabel,
        dispositionLevelThreeLabel,
        productGroupLabel,
        hsnCode: subCatData?.hsnCode,
        companyAddress: iscompanyExists?.address,
        schemeProducts: schemeProductsForOrder,
        // dealerAssignedId: dealerId,
      });

      await addToOrderFlow(orderInquiry);

      const dataUpdated = await callService.getOneAndUpdate(
        {
          _id: idToBeSearch,
          isDeleted: false,
        },
        {
          $set: {
            status: inquiryNumber ? orderStatusEnum.inquiry : status,
            ...req.body,
          },
        }
      );

      if (dataUpdated) {
        await axios.post(
          "https://uat.onetelemart.com/agent/v2/click-2-hangup",
          {
            user: agentName + config.dialer_domain,
            phone_number: mobileNo,
            unique_id: mobileNo,
            disposition: `DEFAULT:${isDispositionThreeExists?.dispositionName}`,
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
      }
    } catch (error) {
      // Rollback logic
      // if (orderInquiry) {
      //   // Delete created order inquiry
      //   await orderService.getByIdAndDelete(orderInquiry._id);
      // }

      // if (orderInquiryFlow) {
      //   // Delete created order inquiry flow
      //   await orderInquiryFlowService.getByIdAndDelete(orderInquiryFlow._id);
      // }

      // // Handle status rollback for call service
      // await callService.getOneAndUpdate(
      //   { _id: idToBeSearch, isDeleted: false },
      //   { $set: { status: status } }
      // );

      // Handle error response
      console.error("API call failed:", error);
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
        message: "Something went wrong!",
        data: null,
        status: false,
        code: "ERROR",
        issue: "API call failed",
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

//update start
// exports.update = async (req, res) => {
//   try {
//     let {
//       stateId,
//       districtId,
//       tehsilId,
//       schemeId,
//       pincodeId,
//       pincodeLabel,
//       areaId,
//       paymentMode,
//       companyId,
//       dispositionLevelTwoId,
//       dispositionLevelThreeId,
//       agentId,
//       agentName,
//       recordingStartTime,
//       recordingEndTime,
//       status,
//       shcemeQuantity,
//       mobileNo,
//       alternateNo,
//       productGroupId,
//     } = req.body;

//     const isDispositionThreeExists =
//       await dispositionThreeService.getOneByMultiField({
//         _id: dispositionLevelThreeId,
//         isDeleted: false,
//         isActive: true,
//       });
//     if (!isDispositionThreeExists) {
//       throw new ApiError(httpStatus.OK, "Invalid Disposition Three.");
//     }
//     let applicableCriteriaData =
//       isDispositionThreeExists?.applicableCriteria[0];
//     if (
//       applicableCriteriaData === applicableCriteria.isOrder ||
//       applicableCriteriaData === applicableCriteria.isPrepaid ||
//       applicableCriteriaData === applicableCriteria.isUrgent
//     ) {
//       let isOrderExists = await orderService.aggregateQuery([
//         {
//           $match: {
//             isDeleted: false,
//             isActive: true,
//             productGroupId: new mongoose.Types.ObjectId(productGroupId),
//             mobileNo: mobileNo,
//             orderNumber: { $ne: null },

//             status: {
//               $nin: [
//                 orderStatusEnum.delivered,
//                 orderStatusEnum.doorCancelled,
//                 orderStatusEnum.rto,
//               ],
//             },
//           },
//         },
//       ]);
//       if (isOrderExists.length) {
//         throw new ApiError(
//           httpStatus.OK,
//           "Order with this number already in process"
//         );
//       }
//     }

//     let idToBeSearch = req.params.id;

//     if (shcemeQuantity > 9) {
//       throw new ApiError(
//         httpStatus.OK,
//         "Scheme quantity should not be more than 9"
//       );
//     }

//     const isUserExists = await userService.getOneByMultiField({
//       _id: agentId,
//       isDeleted: false,
//       isActive: true,
//     });

//     if (!isUserExists) {
//       throw new ApiError(httpStatus.OK, "Invalid Agent ");
//     }

//     const isStateExists = await stateService.findCount({
//       _id: stateId,
//       isDeleted: false,
//     });
//     if (!isStateExists) {
//       throw new ApiError(httpStatus.OK, "Invalid State.");
//     }

//     const isSchemeExists = await schemeService.findCount({
//       _id: schemeId,
//       isDeleted: false,
//     });
//     if (!isSchemeExists) {
//       throw new ApiError(httpStatus.OK, "Invalid Scheme.");
//     }

//     const isDistrictExists = await districtService.findCount({
//       _id: districtId,
//       isDeleted: false,
//     });
//     if (!isDistrictExists) {
//       throw new ApiError(httpStatus.OK, "Invalid District.");
//     }

//     const isTehsilExists = await tehsilService.findCount({
//       _id: tehsilId,
//       isDeleted: false,
//     });
//     if (!isTehsilExists) {
//       throw new ApiError(httpStatus.OK, "Invalid Tehsil.");
//     }

//     const isAreaExists = await areaService.findCount({
//       _id: areaId,
//       isDeleted: false,
//     });
//     if (!isAreaExists) {
//       throw new ApiError(httpStatus.OK, "Invalid Area.");
//     }

//     const isPincodeExists = await pincodeService.getOneByMultiField({
//       _id: pincodeId,
//       isDeleted: false,
//       isActive: true,
//     });
//     if (!isPincodeExists) {
//       throw new ApiError(httpStatus.OK, "Invalid Pincode.");
//     }

//     const isDispositionTwoExists = await dispositionTwoService.findCount({
//       _id: dispositionLevelTwoId,
//       isDeleted: false,
//     });
//     if (!isDispositionTwoExists) {
//       throw new ApiError(httpStatus.OK, "Invalid Disposition Two.");
//     }

//     //------------------Find data-------------------
//     let datafound = await callService.getOneByMultiField({
//       _id: idToBeSearch,
//     });
//     if (!datafound) {
//       throw new ApiError(httpStatus.OK, `Inbound not found.`);
//     }

//     // let dispositionThreeId = dataCreated.dispositionLevelThreeId;

//     let dispositionThreeData = await dispositionThreeService.findAllWithQuery({
//       _id: new mongoose.Types.ObjectId(dispositionLevelThreeId),
//     });

//     // ---------map for order-------
//     let flag = await isOrder(dispositionThreeData[0]?.applicableCriteria);
//     let prepaidOrderFlag = await isPrepaid(
//       dispositionThreeData[0]?.applicableCriteria
//     );

//     // dealers who serves on this pincode
//     const dealerServingPincode = await dealerSurvingPincode(
//       isPincodeExists?.pincode,
//       companyId,
//       schemeId
//     );

//     // getting warehouse ID
//     const servingWarehouse = await getAssignWarehouse(companyId);

//     const orderNumber = await getOrderNumber();
//     const inquiryNumber = await getInquiryNumber();

//     try {
//       const isOrder = flag || prepaidOrderFlag;
//       // console.log(isOrder, flag, prepaidOrderFlag, "pp");
//       const orderInquiryData = {
//         ...req.body,
//         isOrder: isOrder,
//         idToBeSearch: idToBeSearch,
//         status: flag
//           ? status
//           : prepaidOrderFlag
//           ? orderStatusEnum.prepaid
//           : orderStatusEnum.inquiry,

//         isOrderAssigned:
//           dealerServingPincode.length > 1 || servingWarehouse === undefined
//             ? false
//             : true,
//         assignDealerId: !isOrder
//           ? null
//           : dealerServingPincode.length === 1
//           ? dealerServingPincode[0]?.dealerId
//           : null,
//         assignWarehouseId: !isOrder
//           ? null
//           : dealerServingPincode.length === 0
//           ? servingWarehouse
//           : null,
//         approved: flag ? true : prepaidOrderFlag ? false : true,
//         agentId: isUserExists?._id,
//         agentName: agentName,
//         recordingStartTime: recordingStartTime,
//         recordingEndTime: recordingEndTime,
//         callCenterId: isUserExists?.callCenterId,
//         branchId: isUserExists?.branchId,
//         paymentMode: prepaidOrderFlag
//           ? paymentModeType.UPI_ONLINE
//           : paymentModeType.COD,
//         isUrgentOrder:
//           dispositionThreeData[0]?.applicableCriteria ===
//           applicableCriteria.isUrgent,
//         companyId: isUserExists?.companyId,
//       };

//       let orderQueueComplete = await axios.post(
//         `${config.order_queue_url}add-order`,
//         orderInquiryData,
//         {
//           // params: {
//           //   token: req.headers["x-access-token"],
//           //   deviceid: req.headers["device-id"],
//           // },
//           headers: {
//             "Content-Type": "application/json",
//             token: req.headers["x-access-token"],
//             deviceid: req.headers["device-id"],
//           },
//         }
//       );
//       console.log(orderQueueComplete, "orderQueueComplete");

//       if (orderQueueComplete) {
//         await axios.post(
//           "https://uat.onetelemart.com/agent/v2/click-2-hangup",
//           {
//             user: agentName + config.dialer_domain,
//             phone_number: mobileNo,
//             unique_id: mobileNo,
//             disposition: `DEFAULT:${isDispositionThreeExists?.dispositionName}`,
//           },
//           {
//             headers: {
//               "Content-Type": "application/json",
//               XAuth: config.server_auth_key,
//             },
//           }
//         );

//         return res.status(httpStatus.OK).send({
//           message: "Updated successfully.",
//           data: dataUpdated,
//           status: true,
//           code: "OK",
//           issue: null,
//         });
//       }
//     } catch (error) {
//       console.log("errr", error);
//       // Rollback logic
//       // if (orderInquiry) {
//       //   // Delete created order inquiry
//       //   await orderService.getByIdAndDelete(orderInquiry._id);
//       // }

//       // if (orderInquiryFlow) {
//       //   // Delete created order inquiry flow
//       //   await orderInquiryFlowService.getByIdAndDelete(orderInquiryFlow._id);
//       // }

//       // // Handle status rollback for call service
//       // await callService.getOneAndUpdate(
//       //   { _id: idToBeSearch, isDeleted: false },
//       //   { $set: { status: status } }
//       // );

//       // Handle error response
//       return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
//         message: "Something went wrong!",
//         data: null,
//         status: false,
//         code: "ERROR",
//         issue: "API call failed",
//       });
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
    let booleanFields = ["prepaid"];
    let numberFileds = [];
    let objectIdFields = [
      "countryId",
      "stateId",
      "districtId",
      "tehsilId",
      "schemeId",
      "pincodeId",
      "areaId",
      "dispositionLevelTwoId",
      "dispositionLevelThreeId",
      "companyId",
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
      // {
      //   $match: matchQuery,
      // },
      // {
      //   $lookup: {
      //     from: "dispositiontwos",
      //     localField: "dispositionLevelTwoId",
      //     foreignField: "_id",
      //     as: "dispositionLevelTwoData",
      //     pipeline: [
      //       {
      //         $project: {
      //           dispositionName: 1,
      //         },
      //       },
      //     ],
      //   },
      // },
      // {
      //   $lookup: {
      //     from: "dispositionthrees",
      //     localField: "dispositionLevelThreeId",
      //     foreignField: "_id",
      //     as: "dispositionthreesData",
      //     pipeline: [
      //       {
      //         $project: {
      //           dispositionName: 1,
      //         },
      //       },
      //     ],
      //   },
      // },
      // {
      //   $addFields: {
      //     dispositionLevelTwoLabel: {
      //       $arrayElemAt: ["$dispositionLevelTwoData.dispositionName", 0],
      //     },
      //     dispositionLevelThreeLabel: {
      //       $arrayElemAt: ["$dispositionthreesData.dispositionName", 0],
      //     },
      //   },
      // },
      // {
      //   $unset: ["dispositionLevelTwoData", "dispositionthreesData"],
      // },
    ];

    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    finalAggregateQuery.push({
      $match: matchQuery,
    });

    //-----------------------------------
    let dataFound = await callService.aggregateQuery(finalAggregateQuery);
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
      moduleType.callerPage,
      userRoleData,
      actionType.pagination
    );
    let result = await callService.aggregateQuery(finalAggregateQuery);
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

// all filter pagination api
exports.allFilterPaginationUnauth = async (req, res) => {
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
    let booleanFields = ["prepaid"];
    let numberFileds = [];
    let objectIdFields = [
      "countryId",
      "stateId",
      "districtId",
      "tehsilId",
      "schemeId",
      "pincodeId",
      "areaId",
      "dispositionLevelTwoId",
      "dispositionLevelThreeId",
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
        $addFields: {
          dispositionLevelTwoLabel: {
            $arrayElemAt: ["$dispositionLevelTwoData.dispositionName", 0],
          },
          dispositionLevelThreeLabel: {
            $arrayElemAt: ["$dispositionthreesData.dispositionName", 0],
          },
        },
      },
      {
        $unset: ["dispositionLevelTwoData", "dispositionthreesData"],
      },
    ];

    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    finalAggregateQuery.push({
      $match: matchQuery,
    });

    //-----------------------------------
    let dataFound = await callService.aggregateQuery(finalAggregateQuery);
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

    let result = await callService.aggregateQuery(finalAggregateQuery);

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
//get api
exports.get = async (req, res) => {
  try {
    //if no default query then pass {}
    let matchQuery = { isDeleted: false };
    if (req.query && Object.keys(req.query).length) {
      matchQuery = getQuery(matchQuery, req.query);
    }
    let userRoleData = await getUserRoleData(req);
    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.callerPage,
      userRoleData,
      actionType.listAll
    );
    let dataExist = await callService.findAllWithQuery(matchQuery);
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

//get by id
exports.getById = async (req, res) => {
  try {
    let idToBeSearch = req.params.id;
    let userRoleData = await getUserRoleData(req);
    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.callerPage,
      userRoleData,
      actionType.view
    );
    let dataExist = await callService.getOneByMultiField({
      _id: idToBeSearch,
      isDeleted: false,
    });
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

//delete api
exports.deleteDocument = async (req, res) => {
  try {
    let _id = req.params.id;
    if (!(await callService.getOneByMultiField({ _id }))) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let deleted = await callService.getOneAndDelete({ _id });
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
    let dataExist = await callService.getOneByMultiField({ _id });
    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let isActive = dataExist.isActive ? false : true;

    let statusChanged = await callService.getOneAndUpdate(
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
