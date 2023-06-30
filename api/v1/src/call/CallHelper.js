const { applicableCriteria } = require("../../helper/enumUtils");
const { getQuery } = require("../../helper/utils");
const dealerPincodeService = require("../dealerPincode/DealerPincodeService");
const dealerService = require("../dealer/DealerService");
const ledgerService = require("../ledger/LedgerService");
const wareHouseService = require("../wareHouse/WareHouseService");
const InquiryService = require("../inquiry/InquiryService");
const orderService = require("../order/OrderService");
const { default: mongoose } = require("mongoose");

exports.getDealer = async (applicableCriterias) => {
  if (applicableCriterias.includes(applicableCriteria.isPrepaid)) {
    return null;
  } else {
  }
};

exports.getInquiryNumber = async () => {
  let inquiryNumber = 0;
  let lastObject = await InquiryService.aggregateQuery([
    { $sort: { _id: -1 } },
    { $limit: 1 },
  ]);
  if (lastObject.length) {
    inquiryNumber = parseInt(lastObject[0].inquiryNumber) + 1;
  } else {
    inquiryNumber = 1;
  }
  return inquiryNumber;
};

exports.getOrderNumber = async () => {
  let orderNumber = 0;

  let lastObject = await orderService.aggregateQuery([
    { $sort: { _id: -1 } },
    { $limit: 1 },
  ]);

  if (lastObject.length) {
    orderNumber = parseInt(lastObject[0].orderNumber) + 1;
  } else {
    orderNumber = 1;
  }
  return orderNumber;
};

exports.isOrder = async (applicableCriteria) => {
  let applicableCriteriaArray = [applicableCriteria.isOrder];
  let flag = false;
  applicableCriteria?.map((e) => {
    if (applicableCriteriaArray.includes(e)) {
      flag = true;
    }
  });
  return flag;
};

exports.dealerSurvingPincode = async (pincodeName, companyId) => {
  let matchQuery = {
    pincode: pincodeName,
    companyId: companyId,
    isDeleted: false,
    isActive: true,
  };
  matchQuery = getQuery(matchQuery);

  let dealerServingInPincode = await dealerPincodeService.findAllWithQuery(
    matchQuery
  );
  return dealerServingInPincode;
};

exports.getAssignWarehouse = async (pincodeId, companyId) => {
  let matchQuery = {
    isDeleted: false,
    companyId: companyId,
    isActive: true,
  };
  matchQuery["registrationAddress.pincodeId"] = new mongoose.Types.ObjectId(
    pincodeId
  );
  matchQuery = getQuery(matchQuery);

  let warehouseServingInPincode = await wareHouseService.findAllWithQuery(
    matchQuery
  );
  return warehouseServingInPincode ? warehouseServingInPincode[0]?._id : null;
};

exports.getDealer = async (survingDealer) => {
  const allDealers = await Promise.all(
    survingDealer?.map(async (ele) => {
      return await dealerService.getOneByMultiField({
        isDeleted: false,
        isActive: true,
        _id: ele?.dealerId,
      });
    })
  );

  const dealerWithBalance = await Promise.all(
    allDealers?.map(async (ele) => {
      const updatedEle = JSON.parse(JSON.stringify(ele)); // Create a new object with the properties of ele
      // const updatedEle = JSON.parse(JSON.stringify(ele)); // Create a new object with the properties of ele

      updatedEle["balance"] = 0; // Initialize the balance key

      const dealerBalance = await ledgerService.aggregateQuery([
        {
          $match: {
            dealerId: ele?._id,
          },
        },
        { $sort: { _id: -1 } },
        { $limit: 1 },
      ]);

      updatedEle.balance = dealerBalance[0]?.balance || 0; // Assign the balance value

      return updatedEle; // Return the updated object
    })
  );

  const filteredDealers = dealerWithBalance?.map((dealer) => {
    if (dealer.isAutoMapping) {
      if (dealer.isCheckCreditLimit) {
        if (-dealer.creditLimit <= dealer.balance) {
          return dealer;
        }
      } else {
        return dealer;
      }
    } else {
      return dealer;
    }
  });

  return filteredDealers ? filteredDealers[0]?._id : null;
};
