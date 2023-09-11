const express = require("express");
const router = express.Router();
const docsRoute = require("./DocRoute");
const accessRoute = require("./src/accessModule/AccessModuleRoute");
const countryRoute = require("./src/country/CountryRoute");
const companyRoute = require("./src/company/CompanyRouter");
const stateRoute = require("./src/state/StateRoute");
const districtRoute = require("./src/district/DistrictRoute");
const tehsilRoute = require("./src/tehsil/TehsilRoute");
const pincodeRoute = require("./src/pincode/PincodeRoute");
const areaRoute = require("./src/area/AreaRoute");
const productRoute = require("./src/product/ProductRoute");
const languageRoute = require("./src/language/LanguageRoute");
const cartonBoxRoute = require("./src/cartonBox/CartonBoxRoute");
const barCodeRoute = require("./src/barCode/BarCodeRoute");
const asrRequestRoute = require("./src/asrRequest/AsrRequestRoute");
const grnRoute = require("./src/GRN/GRNRoute");
const schemeRoute = require("./src/scheme/SchemeRoute");
const dealerRoute = require("./src/dealer/DealerRoute");
const purchaseOrderRoute = require("./src/purchaseOrder/PurchaseOrderRoute");
const salesOrderRoute = require("./src/salesOrder/SalesOrderRoute");
const featureRoute = require("./src/feature/FeatureRoute");
const inventoriesRoute = require("./src/inventories/InventoriesRouter");
const wareHouseRoute = require("./src/wareHouse/WareHouseRoute");
const dealersCategoryRoute = require("./src/dealersCategory/DealersCategoryRoute");
const productSubCategoryRoute = require("./src/productSubCategory/ProductSubCategoryRoute");
const productGroupRoute = require("./src/productGroup/ProductGroupRoute");
const productCategoryRoute = require("./src/productCategory/ProductCategoryRoute");
const taxesRoute = require("./src/taxes/TaxesRoute");
const vendorRoute = require("./src/vendor/VendorRoute");
const itemRoute = require("./src/item/ItemRoute");
const attributesGroupRoute = require("./src/attributesGroup/AttributesGroupRoute");
const attributesRoute = require("./src/attributes/AttributesRoute");
const dealerSchemeRoute = require("./src/dealerScheme/DealerSchemeRoute");
const dealerPincodeRoute = require("./src/dealerPincode/DealerPincodeRoute");
const deliveryBoyRoute = require("./src/deliveryBoy/DeliveryBoyRoute");
const didRoute = require("./src/didManagement/DidManagementRoute");
const channelGroupRoute = require("./src/channelGroup/ChannelGroupRoute");
const dispositionOneRoute = require("./src/dispositionOne/DispositionOneRoute");
const channelCategoryRoute = require("./src/channelCategory/ChannelCategoryRoute");
const channelMasterRoute = require("./src/channelMaster/ChannelMasterRoute");
const tapeMasterRoute = require("./src/tapeMaster/TapeMasterRoute");
const slotMasterRoute = require("./src/slotMaster/SlotMasterRoute");
const cartonBoxBarcodeRoute = require("./src/cartonBoxBarcode/CartonBoxBarcodeRoute");
const adminRoute = require("./src/admin/AdminRoute");
const fileManagerRoute = require("./src/fileManager/FileManagerRoute");
const artistRoute = require("./src/artist/ArtistRoute");
const userRoute = require("./src/user/UserRoute");
const config = require("../../config/config");
const dispositionTwo = require("./src/dispositionTwo/DispositionTwoRoute");
const channelUpdationRoute = require("./src/channelUpdation/ChannelUpdationRoute");
const competitorRoute = require("./src/competitor/CompetitorRoute");
const dispositionThreeRoute = require("./src/dispositionThree/DispositionThreeRoute");
const initialCallOneRoute = require("./src/initialCallOne/InitialCallOneRoute");
const initialCallThreeRoute = require("./src/initialCallThree/InitialCallThreeRoute");
const initailCallTwoRoute = require("./src/initialCallTwo/InitialCallTwoRoute");
const websiteMasterRoute = require("./src/websiteMaster/WebsiteMasterRoute");
const websitePageRoute = require("./src/websitePage/WebsitePageRoute");
const websiteBlogRoute = require("./src/websiteBlog/WebsiteBlogRoute");
const complaintDispositionRoute = require("./src/complaintDisposition/ComplaintDispositionRoute");
const callRoute = require("./src/call/CallRoute");
const orderInquiryRoute = require("./src/orderInquiry/OrderInquiryRoute");
const orderInquiryFlowRoute = require("./src/orderInquiryFlow/OrderInquiryFlowRoute");
const assetCategoryRoute = require("./src/assetCategory/AssetCategoryRoute");
const assetRoute = require("./src/asset/AssetRoute");
const websiteMetaTagRoute = require("./src/websiteMetaTag/WebsiteMetaTagRoute");
const inquiryRoute = require("./src/inquiry/InquiryRoute");
const ZonalManagerRoute = require("./src/zonalManager/ZonalManagerRoute");
const ledgerRoute = require("./src/ledger/LedgerRoute");
const orderLedgerRoute = require("./src/orderLedger/OrderLedgerRoute");
const userRoleRoute = require("./src/user/UserRoute");
const allocationRoute = require("./src/allocation/AllocationRoute");
const assetLocationRoute = require("./src/assetLocation/AssetLocationRoute");
const dealerWarehouseRoute = require("./src/dealerWareHouse/DealerWareHouseRoute");
const vendorWarehouseRoute = require("./src/vendorWareHouse/VendorWareHouseRoute");
const DealerInventories = require("./src/dealerInventory/DealerInventoriesRouter");
const DealerUser = require("./src/dealerUser/DealerUserRoute");
const VendorLedger = require("./src/vendorLedger/VendorLedgerRoute");
const userAccess = require("./src/userAccess/UserAccessRoute");
const slotDefinition = require("./src/slotDefination/SlotDefinitionRoute");
const companyBranchRoute = require("./src/companyBranch/CompanyBranchRoute");

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
    path: "/channel-group",
    route: channelGroupRoute,
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
    path: "/disposition-three",
    route: dispositionThreeRoute,
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
    path: "/channel-updation",
    route: channelUpdationRoute,
  },
  {
    path: "/tape-master",
    route: tapeMasterRoute,
  },
  {
    path: "/slot-master",
    route: slotMasterRoute,
  },
  {
    path: "/competitor",
    route: competitorRoute,
  },
  {
    path: "/initialcall-one",
    route: initialCallOneRoute,
  },
  {
    path: "/initialcall-three",
    route: initialCallThreeRoute,
  },
  {
    path: "/initialcall-two",
    route: initailCallTwoRoute,
  },
  {
    path: "/website-master",
    route: websiteMasterRoute,
  },
  {
    path: "/website-page",
    route: websitePageRoute,
  },
  {
    path: "/website-blog",
    route: websiteBlogRoute,
  },
  {
    path: "/complaint-disposition",
    route: complaintDispositionRoute,
  },
  {
    path: "/call",
    route: callRoute,
  },
  {
    path: "/order-inquiry",
    route: orderInquiryRoute,
  },
  {
    path: "/order-inquiry-flow",
    route: orderInquiryFlowRoute,
  },

  {
    path: "/asset-category",
    route: assetCategoryRoute,
  },
  {
    path: "/asset",
    route: assetRoute,
  },
  {
    path: "/website-metatag",
    route: websiteMetaTagRoute,
  },
  {
    path: "/inquiry",
    route: inquiryRoute,
  },
  {
    path: "/zonal-manager",
    route: ZonalManagerRoute,
  },
  {
    path: "/ledger",
    route: ledgerRoute,
  },
  {
    path: "/user-role",
    route: userRoleRoute,
  },
  {
    path: "/allocation",
    route: allocationRoute,
  },
  {
    path: "/asset-location",
    route: assetLocationRoute,
  },
  {
    path: "/order-ledger",
    route: orderLedgerRoute,
  },
  {
    path: "/dealer-warehouse",
    route: dealerWarehouseRoute,
  },
  {
    path: "/vendor-warehouse",
    route: vendorWarehouseRoute,
  },
  {
    path: "/dealer-inventories",
    route: DealerInventories,
  },
  {
    path: "/dealer-user",
    route: DealerUser,
  },

  {
    path: "/vendor-ledger",
    route: VendorLedger,
  },
  {
    path: "/user-access",
    route: userAccess,
  },
  {
    path: "/slot-definition",
    route: slotDefinition,
  },
  {
    path: "/company-branch",
    route: companyBranchRoute,
  },
];
// orderRoute;

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
