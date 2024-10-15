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
const stateService = require("../../v1/src/state/StateService");
const districtService = require("../../v1/src/district/DistrictService");
const pincodeService = require("../../v1/src/pincode/PincodeService");
const categoryService = require("../../v1/src/productCategory/ProductCategoryService");
const { createOrder } = require("./MaerksService");
const { v4: uuidv4 } = require("uuid"); // For UUID version 4 (randomly generated)

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
    let orderAssigned = {
      isApi: false,
      data: null,
      courierName: "",
      apiStatus: false,
      invoiceNumber: null,
    };

    if (!preferredCourier || preferredCourier.length === 0) {
      return {
        isApi: false,
        data: null,
        courierName: "GPO", // Use a default courier or a predefined value
        apiStatus: false,
      };
    }

    for (let ele of preferredCourier) {
      let foundCourier = await courierMasterService?.getOneByMultiField({
        isActive: true,
        isDeleted: false,
        _id: ele?.courierId,
      });

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
                courierName: foundCourier?.courierName,
                apiStatus: true,
              };
            } else {
              return {
                isApi: true,
                data: JSON.stringify(orderAssignedToShipYaari?.data),
                courierName: null,
                apiStatus: false,
              };
            }

          case preferredCourierPartner.maersk:
            let pickUpState = await stateService?.getOneByMultiField({
              isDeleted: false,
              _id: wareHouseData?.billingAddress?.stateId,
            });
            let pickUpDistrict = await districtService?.getOneByMultiField({
              isDeleted: false,
              _id: wareHouseData?.billingAddress?.districtId,
            });
            let pickUpPincode = await pincodeService?.getOneByMultiField({
              isDeleted: false,
              _id: wareHouseData?.billingAddress?.pincodeId,
            });
            let productCategory = await categoryService?.getOneByMultiField({
              isDeleted: false,
              _id: wareHouseData?.category,
            });

            // create invoice number
            const invoiceNumber = uuidv4();
            const today = new Date();

            // Get the year, month, and day
            const year = today.getFullYear();
            const month = today.getMonth() + 1; // Months are zero-based, so add 1
            const day = today.getDate();

            // Format the date as YYYY-MM-D
            const invoiceDate = `${year}-${month}-${day}`;

            let maerskOrderData = {
              drop_info: {
                drop_lat: 0,
                drop_city: orderData?.tehsilLabel, // what to add here
                drop_long: 0,
                drop_name: orderData?.customerName,
                drop_email: orderData?.emailId,
                drop_phone: orderData?.mobileNo,
                drop_state: orderData?.stateLabel,
                drop_address: orderData?.autoFillingShippingAddress,
                drop_district: orderData?.districtLabel,
                drop_landmark: orderData?.landmark || null,
                drop_pincode: orderData?.pincodeLabel,
                drop_country: "IN",
                drop_address_type: "RESIDENTIAL", // look for the key option office/ home
              },
              pickup_info: {
                pickup_lat: 0,
                pickup_city: "Indore", // we have to see what to do for city
                pickup_long: 0,
                pickup_name: wareHouseData?.wareHouseName,
                pickup_time: "2024-08-23T11:52:36+04:00", // same day
                pickup_email: wareHouseData?.email,
                pickup_phone: wareHouseData?.billingAddress?.phone,
                pickup_state: pickUpState?.stateName,
                pickup_address: wareHouseData?.billingAddress?.address,
                pickup_district: pickUpDistrict?.districtName,
                pickup_landmark: null,
                pickup_phone_code: "+91",
                pickup_pincode: pickUpPincode?.pincode,
                pickup_country: "IN",
                pickup_address_type: "OFFICE",
              },
              shipment_details: {
                items: [
                  {
                    sku: schemeData?.schemeCode,
                    price: orderData?.price,
                    weight: parseFloat(
                      (schemeData?.weight * orderData?.shcemeQuantity) / 1000
                    ),
                    hs_code: "", // what should be here
                    quantity: orderData?.shcemeQuantity,
                    description: schemeData?.schemeName,
                    manufacture_country: "India",
                    manufacture_country_code: "IND",
                    cat: productCategory?.categoryName || "",
                    color: "",
                    brand: "Telemart",
                    size: "",
                    final_amount_paid:
                      orderData?.price * orderData?.shcemeQuantity,
                    store_credits_used: "0", // ???
                  },
                ],
                height: schemeData?.dimension?.height,
                length: parseFloat(
                  schemeData?.dimension?.depth * orderData?.shcemeQuantity
                ),
                weight: schemeData?.weight,
                breadth: schemeData?.dimension?.width,
                order_id: orderData?.orderNumber.toString(),
                cod_value: orderData?.price * orderData?.shcemeQuantity, //??
                order_type:
                  orderData?.paymentmode === paymentModeType.COD
                    ? "COD"
                    : orderData?.paymentmode === paymentModeType.UPI_ONLINE
                    ? "PREPAID"
                    : "COD",
                invoice_date: invoiceDate, // what should be here
                delivery_type: "FORWARD", // ??
                invoice_value: orderData?.price * orderData?.shcemeQuantity, //??
                invoice_number: invoiceNumber, //???
                courier_partner: "4", //??
                reference_number: orderData?.orderNumber.toString(), //??
                account_code: "Delhivery_Surface", //??
              },
              additional: {
                return_info: {
                  lat: 0,
                  city: "Indore",
                  long: 0,
                  name: wareHouseData?.wareHouseName,
                  email: wareHouseData?.email,
                  phone: wareHouseData?.billingAddress?.phone,
                  state: pickUpState?.stateName,
                  address: wareHouseData?.billingAddress?.address,
                  district: pickUpDistrict?.districtName,
                  landmark: null,
                  pincode: pickUpPincode?.pincode,
                  country: "IN",
                },
                estimated_delivery_date: "2024-08-30",
                async: false,
                label: true,
                user_defined_field_array: [
                  {
                    name: "udf_1",
                    type: "String",
                    value: "",
                  },
                ],
              },
              gst_info: {
                seller_gstin: "1234",
                taxable_value: 100,
                ewaybill_serial_number: "2345677",
                is_seller_registered_under_gst: false,
                sgst_tax_rate: 100,
                place_of_supply: "DELHI",
                gst_discount: 0,
                hsn_code: "1234",
                sgst_amount: 100,
                enterprise_gstin: "13",
                gst_total_tax: 100,
                igst_amount: 100,
                cgst_amount: 200,
                gst_tax_base: 200,
                consignee_gstin: "1233",
                igst_tax_rate: 100,
                invoice_reference: "1234",
                cgst_tax_rate: 100,
              },
            };

            let orderAssignedTomaersk = await createOrder(maerskOrderData);

            if (orderAssignedTomaersk?.meta?.success) {
              return {
                isApi: true,
                data: orderAssignedTomaersk,
                courierName: foundCourier?.courierName,
                apiStatus: true,
                invoiceNumber,
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
