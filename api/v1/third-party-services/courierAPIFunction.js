const {
  preferredCourierPartner,
  paymentModeType,
} = require("../helper/enumUtils");
const {
  getEstTimeFromShipYaari,
  confirmOrderShipYaari,
} = require("./ShipyaariService");

const getEstTime = async (data, courierName) => {
  try {
    let partnerCourierAvailable = false;
    switch (courierName) {
      case preferredCourierPartner.shipyaari:
        let courierPartners = await getEstTimeFromShipYaari(data);
        if (courierPartners) {
          partnerCourierAvailable = true;
        }
        break;
      default:
        break;
    }
    return partnerCourierAvailable;
  } catch (err) {
    return err;
  }
};

const convertEpochTime = (mongoDateString) => {
  // Check if mongoDateString is provided, if not, use the current date
  let mongoDate;
  if (!mongoDateString) {
    mongoDate = new Date();
  } else {
    mongoDate = new Date(mongoDateString);
  }

  // Convert Date object to epoch time (milliseconds since the Unix epoch)
  let epochTime = mongoDate.getTime();

  let epochTimeInSeconds = Math.floor(epochTime / 1000);
  return epochTimeInSeconds;
};

const assignOrderToCourier = async (
  toPincodeData,
  fromPincodeData,
  schemeData,
  orderData,
  preferredCourier,
  wareHouseData,
  categorydata
) => {
  try {
    let orderAssigned = false;
    switch (preferredCourier) {
      case preferredCourierPartner.shipyaari:
        let shipYaariOrderData = {
          pickupDetails: {
            fullAddress: wareHouseData?.billingAddress?.address,
            pincode: fromPincodeData?.pincode,
            contact: {
              name: wareHouseData?.wareHouseName,
              mobileNo: wareHouseData?.billingAddress?.phone,
            },
          },
          deliveryDetails: {
            fullAddress: orderData?.autoFillingShippingAddress,
            pincode: toPincodeData?.pincode,
            contact: {
              name: orderData?.customerName,
              mobileNo: orderData?.mobileNo,
            },
            gstNumber: "", // warehuse gst number
          },
          boxInfo: [
            {
              name: "box_1", // to be discuss
              weightUnit: "Kg",
              deadWeight: schemeData?.weight, // multiply by quantity
              length: schemeData?.dimension?.depth, // multiply by quantity
              breadth: schemeData?.dimension?.width, // multiply by quantity
              height: schemeData?.dimension?.height,
              measureUnit: "cm",
              products: [
                {
                  name: schemeData?.schemeName,
                  category: categorydata?.categoryName,
                  sku: "abc", // schem code
                  qty: orderData?.shcemeQuantity,
                  unitPrice: orderData?.price,
                  unitTax: 0, // to be discuss
                  weightUnit: "kg",
                  deadWeight: schemeData?.weight, // convert to kg
                  length: schemeData?.dimension?.depth,
                  breadth: schemeData?.dimension?.width,
                  height: schemeData?.dimension?.height,
                  measureUnit: "cm",
                },
              ],
              codInfo: {
                isCod: orderData?.paymentmode === paymentModeType.COD,
                collectableAmount: orderData?.price, // multiply be quantity
                invoiceValue: orderData?.price, //multiply be quantity
              },
              podInfo: {
                isPod: false, // to be discuss
              },
              insurance: false, // to be discuss
            },
          ],

          orderType: "B2C",
          transit: "FORWARD",
          courierPartner: "",
          pickupDate: convertEpochTime(orderData?.preffered_delivery_date), // today date
          gstNumber: "",
          orderId: "", // order number
          eWayBillNo: 0,
          brandName: "Telemart",
          brandLogo: "", // telemart image
        };

        let orderAssignedToShipYaari = await confirmOrderShipYaari(
          shipYaariOrderData
        );

        orderAssigned = orderAssignedToShipYaari;

        break;
      default:
        break;
    }
    return orderAssigned;
  } catch (err) {
    return err;
  }
};

module.exports = {
  getEstTime,
  assignOrderToCourier,
};
