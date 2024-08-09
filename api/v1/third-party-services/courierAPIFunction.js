const {
  preferredCourierPartner,
  paymentModeType,
  courierType,
} = require("../helper/enumUtils");
const {
  getEstTimeFromShipYaari,
  confirmOrderShipYaari,
} = require("./ShipyaariService");
const courierMasterService = require("../../v1/src/courierPreference/CourierPreferenceService");

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

// const assignOrderToCourier = async (
//   toPincodeData,
//   fromPincodeData,
//   schemeData,
//   orderData,
//   preferredCourier,
//   wareHouseData,
//   categorydata
// ) => {
//   try {
//     let orderAssigned;
//     switch (preferredCourier) {
//       case preferredCourierPartner.shipyaari:
//         let shipYaariOrderData = {
//           pickupDetails: {
//             fullAddress: wareHouseData?.billingAddress?.address,
//             pincode: fromPincodeData?.pincode,
//             contact: {
//               name: wareHouseData?.wareHouseName,
//               mobileNo: wareHouseData?.billingAddress?.phone,
//             },
//           },
//           deliveryDetails: {
//             fullAddress: orderData?.autoFillingShippingAddress,
//             pincode: toPincodeData?.pincode,
//             contact: {
//               name: orderData?.customerName,
//               mobileNo: orderData?.mobileNo,
//             },
//             gstNumber: "", // warehuse gst number
//           },
//           boxInfo: [
//             {
//               name: "box_1", // to be discuss
//               weightUnit: "Kg",
//               deadWeight: parseFloat(
//                 (schemeData?.weight * orderData?.shcemeQuantity) / 1000
//               ), // multiply by quantity
//               length: parseFloat(
//                 schemeData?.dimension?.depth * orderData?.shcemeQuantity
//               ), // multiply by quantity
//               breadth: parseFloat(
//                 schemeData?.dimension?.width * orderData?.shcemeQuantity
//               ), // multiply by quantity
//               height: schemeData?.dimension?.height,
//               measureUnit: "cm",
//               products: [
//                 {
//                   name: schemeData?.schemeName,
//                   category: categorydata?.categoryName,
//                   sku: schemeData?.schemeCode, // schem code
//                   qty: orderData?.shcemeQuantity,
//                   unitPrice: orderData?.price,
//                   unitTax: 0, // to be discuss
//                   weightUnit: "kg",
//                   deadWeight: schemeData?.weight / 1000, // convert to kg
//                   length: schemeData?.dimension?.depth,
//                   breadth: schemeData?.dimension?.width,
//                   height: schemeData?.dimension?.height,
//                   measureUnit: "cm",
//                 },
//               ],
//               codInfo: {
//                 isCod: orderData?.paymentmode === paymentModeType.COD,
//                 collectableAmount: orderData?.price * orderData?.shcemeQuantity, // multiply be quantity
//                 invoiceValue: orderData?.price * orderData?.shcemeQuantity, //multiply be quantity
//               },
//               podInfo: {
//                 isPod: false, // to be discuss
//               },
//               insurance: false, // to be discuss
//             },
//           ],

//           orderType: "B2C",
//           transit: "FORWARD",
//           courierPartner: "",
//           pickupDate: convertEpochTime(new Date()), // today date
//           gstNumber: "",
//           orderId: orderData?.orderNumber.toString(),
//           eWayBillNo: 0,
//           brandName: "Telemart",
//           brandLogo: "", // telemart image
//         };

//         let orderAssignedToShipYaari = await confirmOrderShipYaari(
//           shipYaariOrderData
//         );

//         orderAssigned = orderAssignedToShipYaari;

//         break;
//       default:
//         break;
//     }
//     return orderAssigned;
//   } catch (err) {
//     return err;
//   }
// };

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
    console.log(preferredCourier, "preferredCourier");
    let orderAssigned = {
      isApi: false,
      data: null,
      courierName: "",
      apiStatus: false,
    };

    if (!preferredCourier || preferredCourier.length === 0) {
      return {
        isApi: false,
        data: null,
        courierName: "DefaultCourier", // Use a default courier or a predefined value
        apiStatus: false,
      };
    }

    for (let ele of preferredCourier) {
      let foundCourier = await courierMasterService?.getOneByMultiField({
        isActive: true,
        isDeleted: false,
        _id: ele?.courierId,
      });

      console.log(foundCourier, "foundCourier");

      if (foundCourier?.courierType === courierType.api) {
        switch (foundCourier?.courierName) {
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
                gstNumber: "", // warehouse GST number
              },
              boxInfo: [
                {
                  name: "box_1",
                  weightUnit: "Kg",
                  deadWeight: parseFloat(
                    (schemeData?.weight * orderData?.shcemeQuantity) / 1000
                  ),
                  length: parseFloat(
                    schemeData?.dimension?.depth * orderData?.shcemeQuantity
                  ),
                  breadth: parseFloat(
                    schemeData?.dimension?.width * orderData?.shcemeQuantity
                  ),
                  height: schemeData?.dimension?.height,
                  measureUnit: "cm",
                  products: [
                    {
                      name: schemeData?.schemeName,
                      category: categorydata?.categoryName,
                      sku: schemeData?.schemeCode,
                      qty: orderData?.shcemeQuantity,
                      unitPrice: orderData?.price,
                      unitTax: 0,
                      weightUnit: "kg",
                      deadWeight: schemeData?.weight / 1000,
                      length: schemeData?.dimension?.depth,
                      breadth: schemeData?.dimension?.width,
                      height: schemeData?.dimension?.height,
                      measureUnit: "cm",
                    },
                  ],
                  codInfo: {
                    isCod: orderData?.paymentmode === paymentModeType.COD,
                    collectableAmount:
                      orderData?.price * orderData?.shcemeQuantity,
                    invoiceValue: orderData?.price * orderData?.shcemeQuantity,
                  },
                  podInfo: {
                    isPod: false,
                  },
                  insurance: false,
                },
              ],
              orderType: "B2C",
              transit: "FORWARD",
              courierPartner: "",
              pickupDate: convertEpochTime(new Date()),
              gstNumber: "",
              orderId: orderData?.orderNumber.toString(),
              eWayBillNo: 0,
              brandName: "Telemart",
              brandLogo: "",
            };

            let orderAssignedToShipYaari = await confirmOrderShipYaari(
              shipYaariOrderData
            );

            if (orderAssignedToShipYaari?.status) {
              return {
                isApi: true,
                data: orderAssignedToShipYaari?.data,
                courierName: foundCourier?.courierType,
                apiStatus: true,
              };
            }

            break;
          default:
            break;
        }
      } else {
        return {
          isApi: false,
          data: null,
          courierName: ele?.courierName,
          apiStatus: false,
        };
      }
    }

    return orderAssigned;
  } catch (err) {
    console.error("Error in assignOrderToCourier:", err);
    throw err;
  }
};

module.exports = {
  getEstTime,
  assignOrderToCourier,
};
