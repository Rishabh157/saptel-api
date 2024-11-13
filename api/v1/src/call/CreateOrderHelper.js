const config = require("../../../../config/config");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const mongoose = require("mongoose");
const axios = require("axios");

// ----services---------
const callService = require("./CallService");
const orderService = require("../orderInquiry/OrderInquiryService");
const schemeService = require("../scheme/SchemeService");
const pincodeService = require("../pincode/PincodeService");
const dealerService = require("../dealer/DealerService");
const dispositionThreeService = require("../dispositionThree/DispositionThreeService");
const userService = require("../user/UserService");
const subcategoryService = require("../productSubCategory/ProductSubCategoryService");
const companyService = require("../company/CompanyService");
const webLeadService = require("../webLeads/WebLeadsService");

const {
  getDealer,
  getInquiryNumber,
  getOrderNumber,
  isOrder,
  dealerSurvingPincode,
  getAssignWarehouse,
  isPrepaid,
  checkDealerHaveInventory,
} = require("./CallHelper");

const {
  applicableCriteria,
  orderStatusEnum,
  paymentModeType,
  fakeOrderDisposition,
  webLeadStatusEnum,
  orderFlowStatusEnum,
} = require("../../helper/enumUtils");

const {
  addToOrderFlow,
} = require("../orderInquiryFlow/OrderInquiryFlowHelper");

// --- Optimized createOrderInQueue function ---
const createOrderInQueue = async (data) => {
  try {
    let {
      stateId,
      districtId,
      tehsilId,
      schemeId,
      pincodeId,
      areaId,
      schemeName,
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
      customerName,
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
      idToBeSearch: _id,
      applicableCriteriaData,
      pincode,
      callCenterId,
      branchId,
      address,
      schemeCode,
      schemeProductsForOrder,
      hsnCode,
    } = data;

    const flag = await isOrder([applicableCriteriaData]);
    const prepaidOrderFlag = await isPrepaid([applicableCriteriaData]);

    // Dealer logic
    let dealerServingPincode = [];
    let assidnedDealerData = null;

    if (!prepaidOrderFlag || !flag) {
      dealerServingPincode = await dealerSurvingPincode(
        pincode,
        companyId,
        schemeId
      );
      if (dealerServingPincode.length === 1) {
        var isInventoryExists = await checkDealerHaveInventory(
          schemeId,
          dealerServingPincode[0]?.dealerId
        );
        // assidnedDealerData = isInventoryExists
        //   ?
        assidnedDealerData = await dealerService.getOneByMultiField({
          _id: dealerServingPincode[0]?.dealerId,
        });
        //   : null;
        // if (!isInventoryExists) dealerServingPincode = [];
      }
    }

    // Warehouse logic
    const servingWarehouse = await getAssignWarehouse(companyId);
    const orderNumber = await getOrderNumber();
    const inquiryNumber = await getInquiryNumber();
    console.log(
      flag,
      prepaidOrderFlag,
      dealerServingPincode,
      "-----------------"
    );
    // Update lead status
    if (flag || prepaidOrderFlag) {
      await webLeadService.getOneAndUpdate(
        { phone: mobileNo },
        { $set: { leadStatus: webLeadStatusEnum.complete } }
      );
    } else if (
      dispositionLevelThreeLabel.toLowerCase() ===
      fakeOrderDisposition.toLowerCase()
    ) {
      await webLeadService.getOneAndUpdate(
        { phone: mobileNo },
        { $set: { leadStatus: webLeadStatusEnum.fake } }
      );
    } else {
      await webLeadService.getOneAndUpdate(
        { phone: mobileNo },
        { $set: { leadStatus: webLeadStatusEnum.inquiry } }
      );
    }

    const orderInquiry = await orderService.createNewData({
      ...data,
      status: flag
        ? status
        : prepaidOrderFlag
        ? orderStatusEnum.prepaid
        : orderStatusEnum.inquiry,
      orderNumber: flag || prepaidOrderFlag ? orderNumber : null,
      inquiryNumber: inquiryNumber,
      isOrderAssigned:
        (dealerServingPincode.length === 1 && !isInventoryExists) ||
        dealerServingPincode.length > 1 ||
        !servingWarehouse
          ? false
          : true,
      assignDealerId:
        dealerServingPincode.length === 1 && isInventoryExists
          ? dealerServingPincode[0]?.dealerId
          : null,
      assignDealerLabel:
        dealerServingPincode.length === 1 && isInventoryExists
          ? `${assidnedDealerData?.firstName} ${assidnedDealerData?.lastName}`
          : "",
      assignDealerCode:
        dealerServingPincode.length === 1 && isInventoryExists
          ? assidnedDealerData?.dealerCode
          : "",
      assignDealerStatus:
        dealerServingPincode.length === 1 && isInventoryExists
          ? assidnedDealerData?.isActive
          : "",
      assignWarehouseId:
        dealerServingPincode.length === 0 && (flag || prepaidOrderFlag)
          ? servingWarehouse?._id
          : null,
      assignWarehouseLabel:
        dealerServingPincode.length === 0 && (flag || prepaidOrderFlag)
          ? servingWarehouse?.wareHouseName
          : "",
      approved: flag ? true : prepaidOrderFlag ? false : true,

      callCenterId: callCenterId,
      branchId: branchId,
      paymentMode: prepaidOrderFlag
        ? paymentModeType.UPI_ONLINE
        : paymentModeType.COD,
      isUrgentOrder: applicableCriteriaData === applicableCriteria.isUrgent,

      hsnCode: hsnCode,
      companyAddress: address,
      schemeProducts: schemeProductsForOrder,
      schemeCode: schemeCode,
      isFreezed: false,
      shipyaariStatus: "",
    });

    // Add order to the order flow
    let orderFlow = await addToOrderFlow(
      orderInquiry?._id,
      orderInquiry?.orderNumber,
      orderInquiry?.assignDealerId
        ? "Order automapped to dealer"
        : orderInquiry?.assignWarehouseId
        ? "Order automapped to warehouse"
        : "Order added in batch for further mapping!",
      orderInquiry.status,
      agentName
    );
    // Send confirmation message if needed
    // if (flag || prepaidOrderFlag) {
    //   await axios.post(
    //     `https://pgapi.vispl.in/fe/api/v1/send?username=${config.messageApiUserName}&password=${config.messageApiPassword}&unicode=false&from=${config.messageApiFrom}&to=${mobileNo}&text=Thank you ${customerName} ji for booking ${schemeName}, your order no. is ${orderNumber}. For delivery, dealer details will be updated shortly. TELEMART&dltContentId=${config.messageApiContentId}`
    //   );
    // }

    // Update the original call entry
    await callService.getOneAndUpdate(
      { _id: _id, isDeleted: false },
      {
        $set: {
          status: inquiryNumber ? orderStatusEnum.inquiry : status,
          ...data,
        },
      }
    );
  } catch (err) {
    console.error("Error creating order in queue:", err);
  }
};

module.exports = {
  createOrderInQueue,
};
