const moneyBackService = require("../moneyBackRequest/MoneyBackRequestService");
const moneyBackLogsService = require("../moneyBackRequestLog/MoneyBackRequestLogService");
const productReplacementService = require("../productReplacementRequest/ProductReplacementRequestService");
const productReplacementLogService = require("../productReplacementRequestLog/ProductReplacementRequestLogService");
exports.addMoneyBackRequest = async (
  orderDetails,
  complaintNumber,
  userData
) => {
  let moneyBackData = await moneyBackService.createNewData({
    orderNumber: orderDetails?.orderNumber,
    complaintNumber: complaintNumber,
    schemeId: orderDetails?.schemeId,
    dealerId: orderDetails?.assignDealerId,
    wareHouseId: orderDetails?.assignWarehouseId,
    dateOfDelivery: orderDetails?.deliveryTimeAndDate,
    customerName: orderDetails?.customerName,
    address: orderDetails?.autoFillingShippingAddress,
    stateId: orderDetails?.stateId,
    districtId: orderDetails?.districtId,
    tehsilId: orderDetails?.tehsilId,
    pincodeId: orderDetails?.pincodeId,
    areaId: orderDetails?.areaId,
    customerNumber: orderDetails?.mobileNo,
    alternateNumber: orderDetails?.alternateNo,
    companyId: userData.companyId,
    requestCreatedById: userData.Id,
  });
  await moneyBackLogsService.createNewData({
    moneyBackRequestId: moneyBackData?._id,
    complaintNumber: complaintNumber,
    companyId: userData.companyId,
  });
  if (moneyBackData) {
    return moneyBackData;
  } else {
    return false;
  }
};

exports.addProductReplacementRequest = async (
  orderDetails,
  complaintNumber,
  userData
) => {
  let productReplacementData = await productReplacementService.createNewData({
    orderNumber: orderDetails?.orderNumber,
    complaintNumber: complaintNumber,
    schemeId: orderDetails?.schemeId,
    dealerId: orderDetails?.assignDealerId,
    wareHouseId: orderDetails?.assignWarehouseId,
    dateOfDelivery: orderDetails?.deliveryTimeAndDate,
    customerName: orderDetails?.customerName,
    address: orderDetails?.autoFillingShippingAddress,
    stateId: orderDetails?.stateId,
    districtId: orderDetails?.districtId,
    tehsilId: orderDetails?.tehsilId,
    pincodeId: orderDetails?.pincodeId,
    areaId: orderDetails?.areaId,
    customerNumber: orderDetails?.mobileNo,
    alternateNumber: orderDetails?.alternateNo,
    companyId: userData.companyId,
    requestCreatedById: userData.Id,
    productGroupId: orderDetails.productGroupId,
  });
  await productReplacementLogService.createNewData({
    productReplacementRequestId: productReplacementData?._id,
    complaintNumber: complaintNumber,
    companyId: userData.companyId,
  });
  if (productReplacementData) {
    return productReplacementData;
  } else {
    return false;
  }
};
