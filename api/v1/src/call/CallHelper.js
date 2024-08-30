const {
  applicableCriteria,
  barcodeStatusType,
} = require("../../helper/enumUtils");
const { getQuery } = require("../../helper/utils");
const dealerPincodeService = require("../dealerPincode/DealerPincodeService");
const dealerService = require("../dealer/DealerService");
const ledgerService = require("../ledger/LedgerService");
const wareHouseService = require("../wareHouse/WareHouseService");
const InquiryService = require("../inquiry/InquiryService");
const orderService = require("../orderInquiry/OrderInquiryService");
const complaintService = require("../complain/ComplainService");
const houseArrestService = require("../houseArrestRequest/HouseArrestRequestService");
const dealerSchemeService = require("../dealerScheme/DealerSchemeService");
const salesOrderService = require("../salesOrder/SalesOrderService");
const schemeService = require("../scheme/SchemeService");
const barcodeService = require("../barCode/BarCodeService");

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
    { $match: { orderNumber: { $ne: null } } }, // Modify the $match stage
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

exports.getInquiryNumber = async () => {
  let inquiryNumber = 0;

  let lastObject = await orderService.aggregateQuery([
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

exports.getInvoiceNumber = async (companyId) => {
  let invoiceNumber = 0;
  console.log(companyId, "companyId");
  let lastObject = await salesOrderService.aggregateQuery([
    {
      $match: {
        invoiceNumber: { $ne: null },
        companyId: new mongoose.Types.ObjectId(companyId),
      },
    },
    { $sort: { _id: -1 } },
    { $limit: 1 },
  ]);
  console.log(lastObject, "lastObject");
  if (lastObject.length) {
    invoiceNumber =
      parseInt(
        lastObject[0]?.invoiceNumber
          ? lastObject[0]?.invoiceNumber.split("-").pop()
          : 0
      ) + 1;
  } else {
    invoiceNumber = 1;
  }
  console.log(invoiceNumber.toString().padStart(4, "0"), "-------------");
  // Formatting the invoice number with leading zeros
  return invoiceNumber.toString().padStart(4, "0");
};

exports.getComplaintNumber = async () => {
  let complaintNumber = 0;

  let lastObject = await complaintService.aggregateQuery([
    { $sort: { _id: -1 } },
    { $limit: 1 },
  ]);

  if (lastObject.length) {
    complaintNumber = parseInt(lastObject[0].complaintNumber) + 1;
  } else {
    complaintNumber = 1;
  }
  return complaintNumber;
};

exports.getMBKNumber = async () => {
  let mbkNumber = 0;

  let lastObject = await houseArrestService.aggregateQuery([
    { $sort: { _id: -1 } },
    { $limit: 1 },
  ]);

  if (lastObject.length) {
    mbkNumber = parseInt(lastObject[0].mbkNumber) + 1;
  } else {
    mbkNumber = 1;
  }
  return mbkNumber;
};

exports.isOrder = async (applicableCriteriaList) => {
  let applicableCriteriaArray = [
    applicableCriteria.isOrder,
    applicableCriteria.isUrgent,
  ];
  let flag = false;
  applicableCriteriaList?.map((e) => {
    if (applicableCriteriaArray.includes(e)) {
      flag = true;
    }
  });
  return flag;
};

exports.isPrepaid = async (applicableCriteriaList) => {
  let applicableCriteriaArray = [applicableCriteria.isPrepaid];
  let flag = false;
  applicableCriteriaList?.map((e) => {
    if (applicableCriteriaArray.includes(e)) {
      flag = true;
    }
  });
  return flag;
};

exports.checkDealerHaveInventory = async (schemeId, dealerId) => {
  console.log(schemeId, dealerId, "data---------------------");
  let schemeData = await schemeService?.getOneByMultiField({ _id: schemeId });
  let productInfo = schemeData?.productInformation?.map((ele) => {
    return {
      productGroupId: ele?.productGroup,
      quantity: ele?.productQuantity,
    };
  });
  console.log(productInfo, "==============================");

  let validQuantity = true;

  await Promise.all(
    productInfo?.map(async (ele) => {
      let foundBarcode = await barcodeService?.aggregateQuery([
        {
          $match: {
            productGroupId: ele?.productGroupId,
            wareHouseId: null,
            dealerId: new mongoose.Types.ObjectId(dealerId),
            status: barcodeStatusType.atDealerWarehouse,
          },
        },
      ]);
      console.log(
        foundBarcode.length,
        ele?.quantity,
        "length ................................"
      );
      if (foundBarcode.length < ele?.quantity) {
        console.log("match //////////////////////////////////");
        validQuantity = false;
      }
    })
  );

  return validQuantity;
};

exports.dealerSurvingPincode = async (pincodeName, companyId, schemeId) => {
  let matchQuery = {
    pincodes: { $in: pincodeName },
    schemeId: schemeId,
    companyId: companyId,
    isDeleted: false,
    isActive: true,
  };
  matchQuery = getQuery(matchQuery);

  let dealerServingInPincode = await dealerSchemeService.findAllWithQuery(
    matchQuery
  );

  let valiDdealerServingInPincode = await Promise.all(
    dealerServingInPincode?.map(async (ele) => {
      let dealerData = await dealerService?.findCount({
        _id: ele?.dealerId,
        isActive: true,
        isDeleted: false,
      });
      if (dealerData) {
        return ele;
      }
    })
  );

  // Filter out undefined values
  valiDdealerServingInPincode = valiDdealerServingInPincode.filter(
    (ele) => ele !== undefined
  );

  return valiDdealerServingInPincode;
};

exports.getAssignWarehouse = async (companyId) => {
  let matchQuery = {
    isDeleted: false,
    companyId: companyId,
    isActive: true,
    dealerId: null,
    isDefault: true,
  };
  // matchQuery["registrationAddress.pincodeId"] = new mongoose.Types.ObjectId(
  //   pincodeId
  // );
  matchQuery = getQuery(matchQuery);

  let warehouseServingInPincode = await wareHouseService.findAllWithQuery(
    matchQuery
  );
  return warehouseServingInPincode ? warehouseServingInPincode[0] : null;
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
  const filteredArray = allDealers.filter((value) => value !== null);

  const dealerWithBalance = await Promise.all(
    filteredArray?.map(async (ele) => {
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
