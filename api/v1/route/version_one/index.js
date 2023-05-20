const express = require("express");
const router = express.Router();
const docsRoute = require("./DocRoute");
const accessRoute = require("./AccessModuleRoute");
const countryRoute = require("./CountryRoute");
const companyRoute = require("./CompanyRouter");
const stateRoute = require("./StateRoute");
const districtRoute = require("./DistrictRoute");
const tehsilRoute = require("./TehsilRoute");
const pincodeRoute = require("./PincodeRoute");
const areaRoute = require("./AreaRoute");
const productRoute = require("./ProductRoute");
const languageRoute = require("./LanguageRoute");
const cartonBoxRoute = require("./CartonBoxRoute");
const barCodeRoute = require("./BarCodeRoute");
const asrRequestRoute = require("./AsrRequestRoute");
const grnRoute = require("./GRNRoute");
const schemeRoute = require("./SchemeRoute");
const dealerRoute = require("./DealerRoute");
const purchaseOrderRoute = require("./PurchaseOrderRoute");
const salesOrderRoute = require("./SalesOrderRoute");
const featureRoute = require("./FeatureRoute");
const inventoriesRoute = require("./InventoriesRouter");
const wareHouseRoute = require("./WareHouseRoute");
const dealersCategoryRoute = require("./DealersCategoryRoute");
const productSubCategoryRoute = require("./ProductSubCategoryRoute");
const productGroupRoute = require("./ProductGroupRoute");
const productCategoryRoute = require("./ProductCategoryRoute");
const taxesRoute = require("./TaxesRoute");
const vendorRoute = require("./VendorRoute");
const itemRoute = require("./ItemRoute");
const attributesGroupRoute = require("./AttributesGroupRoute");
const attributesRoute = require("./AttributesRoute");
const dealerSchemeRoute = require("./DealerSchemeRoute");
const dealerPincodeRoute = require("./DealerPincodeRoute");
const deliveryBoyRoute = require("./DeliveryBoyRoute");
const didRoute = require("./DidManagementRoute");
const tabRoute = require("./TabManagementRoute");
const channelGroupRoute = require("./ChannelGroupRoute");
const channelManagementRoute = require("./ChannelManagementRoute");
const dispositionOneRoute = require("./DispositionOneRoute");
const channelCategoryRoute = require("./ChannelCategoryRoute");
const channelMasterRoute = require("./ChannelMasterRoute");
const tapeMasterRoute = require("./TapeMasterRoute");
const slotMasterRoute = require("./SlotMasterRoute");
const cartonBoxBarcodeRoute = require("./CartonBoxBarcodeRoute");
const adminRoute = require("./AdminRoute");
const fileManagerRoute = require("./FileManagerRoute");
const artistRoute = require("./ArtistRoute");
const userRoute = require("./UserRoute");
const config = require("../../../../config/config");
const dispositionTwo = require("./DispositionTwoRoute");

const devRoutes = [
  // routes available only in development mode
  {
    path: "/api-docs",
    route: docsRoute,
  },
];

const defaultRoutes = [
  {
    path: "/admin",
    route: adminRoute,
  },

  {
    path: "/file-manager",
    route: fileManagerRoute,
  },
  {
    path: "/user",
    route: userRoute,
  },
  {
    path: "/access-module",
    route: accessRoute,
  },
  {
    path: "/company",
    route: companyRoute,
  },
  {
    path: "/country",
    route: countryRoute,
  },
  {
    path: "/state",
    route: stateRoute,
  },
  {
    path: "/district",
    route: districtRoute,
  },
  {
    path: "/tehsil",
    route: tehsilRoute,
  },
  {
    path: "/pincode",
    route: pincodeRoute,
  },
  {
    path: "/area",
    route: areaRoute,
  },
  {
    path: "/product-category",
    route: productCategoryRoute,
  },
  {
    path: "/taxes",
    route: taxesRoute,
  },
  {
    path: "/product-sub-category",
    route: productSubCategoryRoute,
  },
  {
    path: "/product-group",
    route: productGroupRoute,
  },
  {
    path: "/item",
    route: itemRoute,
  },
  {
    path: "/asr",
    route: asrRequestRoute,
  },
  {
    path: "/grn",
    route: grnRoute,
  },
  {
    path: "/carton-box",
    route: cartonBoxRoute,
  },
  {
    path: "/attributes-group",
    route: attributesGroupRoute,
  },
  {
    path: "/language",
    route: languageRoute,
  },
  {
    path: "/product",
    route: productRoute,
  },
  {
    path: "/bar-code",
    route: barCodeRoute,
  },
  {
    path: "/dealers-category",
    route: dealersCategoryRoute,
  },
  {
    path: "/scheme",
    route: schemeRoute,
  },
  {
    path: "/dealer",
    route: dealerRoute,
  },
  {
    path: "/wareHouse",
    route: wareHouseRoute,
  },
  {
    path: "/inventories",
    route: inventoriesRoute,
  },
  {
    path: "/sales-order",
    route: salesOrderRoute,
  },
  {
    path: "/purchase-order",
    route: purchaseOrderRoute,
  },
  {
    path: "/dealer/purchase-order",
    route: salesOrderRoute,
  },
  {
    path: "/cartonbox-barcode",
    route: cartonBoxBarcodeRoute,
  },

  {
    path: "/feature",
    route: featureRoute,
  },

  {
    path: "/vendor",
    route: vendorRoute,
  },
  {
    path: "/attribute",
    route: attributesRoute,
  },
  {
    path: "/dealer-scheme",
    route: dealerSchemeRoute,
  },
  {
    path: "/dealer-pincode",
    route: dealerPincodeRoute,
  },
  {
    path: "/delivery-boy",
    route: deliveryBoyRoute,
  },
  {
    path: "/did-management",
    route: didRoute,
  },
  {
    path: "/tab-management",
    route: tabRoute,
  },
  {
    path: "/channel-group",
    route: channelGroupRoute,
  },
  {
    path: "/channel-management",
    route: channelManagementRoute,
  },
  {
    path: "/disposition-one",
    route: dispositionOneRoute,
  },
  {
    path: "/artist",
    route: artistRoute,
  },
  {
    path: "/disposition-two",
    route: dispositionTwo,
  },
  {
    path: "/channel-category",
    route: channelCategoryRoute,
  },
  {
    path: "/channel-master",
    route: channelMasterRoute,
  },
  {
    path: "/tape-master",
    route: tapeMasterRoute,
  },
  {
    path: "/slot-master",
    route: slotMasterRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* ignore next */
if (config.env === "development") {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
