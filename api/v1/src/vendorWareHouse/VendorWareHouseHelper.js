const aggrigateQuery = [
  {
    $lookup: {
      from: "vendors",
      localField: "vendorId",
      foreignField: "_id",
      as: "vendor_name",
      pipeline: [{ $project: { companyName: 1 } }],
    },
  },
  {
    $lookup: {
      from: "countries",
      localField: "country",
      foreignField: "_id",
      as: "warehouse_country_name",
      pipeline: [{ $project: { countryName: 1 } }],
    },
  },
  {
    $lookup: {
      from: "countries",
      localField: "registrationAddress.countryId",
      foreignField: "_id",
      as: "country_name",
      pipeline: [{ $project: { countryName: 1 } }],
    },
  },
  {
    $lookup: {
      from: "states",
      localField: "registrationAddress.stateId",
      foreignField: "_id",
      as: "state_name",
      pipeline: [{ $project: { stateName: 1 } }],
    },
  },
  {
    $lookup: {
      from: "districts",
      localField: "registrationAddress.districtId",
      foreignField: "_id",
      as: "district_name",
      pipeline: [{ $project: { districtName: 1 } }],
    },
  },
  {
    $lookup: {
      from: "pincodes",
      localField: "registrationAddress.pincodeId",
      foreignField: "_id",
      as: "pincode_name",
      pipeline: [{ $project: { pincode: 1 } }],
    },
  },
  // billing section start
  {
    $lookup: {
      from: "countries",
      localField: "billingAddress.countryId",
      foreignField: "_id",
      as: "b_country_name",
      pipeline: [{ $project: { countryName: 1 } }],
    },
  },
  {
    $lookup: {
      from: "states",
      localField: "billingAddress.stateId",
      foreignField: "_id",
      as: "b_state_name",
      pipeline: [{ $project: { stateName: 1 } }],
    },
  },
  {
    $lookup: {
      from: "districts",
      localField: "billingAddress.districtId",
      foreignField: "_id",
      as: "b_district_name",
      pipeline: [{ $project: { districtName: 1 } }],
    },
  },
  {
    $lookup: {
      from: "pincodes",
      localField: "billingAddress.pincodeId",
      foreignField: "_id",
      as: "b_pincode_name",
      pipeline: [{ $project: { pincode: 1 } }],
    },
  },
  {
    $addFields: {
      // VendorName: {
      //   $arrayElemAt: ["$vendor_name.companyName", 0],
      // },
      wareHouseCountryName: {
        $arrayElemAt: ["$warehouse_country_name.countryName", 0],
      },
      registrationCountryName: {
        $arrayElemAt: ["$country_name.countryName", 0],
      },
      registrationStateName: {
        $arrayElemAt: ["$state_name.stateName", 0],
      },
      registrationDistrictName: {
        $arrayElemAt: ["$district_name.districtName", 0],
      },
      registrationPincodeName: {
        $arrayElemAt: ["$pincode_name.pincode", 0],
      },
      //billing start
      billingAddressCountryName: {
        $arrayElemAt: ["$b_country_name.countryName", 0],
      },
      billingAddressStateName: {
        $arrayElemAt: ["$b_state_name.stateName", 0],
      },
      billingAddressDistrictName: {
        $arrayElemAt: ["$b_district_name.districtName", 0],
      },
      billingAddressPincodeName: {
        $arrayElemAt: ["$b_pincode_name.pincode", 0],
      },
    },
  },
  {
    $unset: [
      "warehouse_country_name",
      "country_name",
      "state_name",
      "district_name",
      "pincode_name",
      "b_country_name",
      "b_state_name",
      "b_district_name",
      "b_pincode_name",
      "vendor_name",
    ],
  },
];

module.exports = {
  aggrigateQuery,
};
