const Admin = require("../src/admin/AdminSchema");
const allocation = require("../src/allocation/AllocationSchema");
const Area = require("../src/area/AreaSchema");
const Artist = require("../src/artist/ArtistSchema");
const AsrRequest = require("../src/asrRequest/AsrRequestSchema");
const AssetCategory = require("../src/assetCategory/AssetCategorySchema");
const assetLocation = require("../src/assetLocation/AssetLocationSchema");
const AssetSchema = require("../src/asset/AssetSchema");
const AttributesGroup = require("../src/attributesGroup/AttributesGroupSchema");
const Attributes = require("../src/attributes/AttributesSchema");
const BarCode = require("../src/barCode/BarCodeSchema");

const CallSchema = require("../src/call/CallSchema");
const CartonBoxBarcode = require("../src/cartonBoxBarcode/CartonBoxBarcodeSchema");
const CartonBox = require("../src/cartonBox/CartonBoxSchema");
const ChannelCategory = require("../src/channelCategory/ChannelCategorySchema");
const ChannelGroup = require("../src/channelGroup/ChannelGroupSchema");
const ChannelMaster = require("../src/channelMaster/ChannelMasterSchema");
const ChannelUpdation = require("../src/channelUpdation/ChannelUpdationSchema");
const Competitor = require("../src/competitor/CompetitorSchema");
const ComplaintDisposition = require("../src/complaintDisposition/ComplaintDispositionSchema");
const Country = require("../src/country/CountrySchema");
const DealerPincode = require("../src/dealerPincode/DealerPincodeSchema");
const DealersCategory = require("../src/dealersCategory/DealersCategorySchema");
const DealerScheme = require("../src/dealerScheme/DealerSchemeSchema");
const Dealer = require("../src/dealer/DealerSchema");
const DeliveryBoy = require("../src/deliveryBoy/DeliveryBoySchema");
const DidManagement = require("../src/didManagement/DidManagementSchema");
const DispositionOne = require("../src/dispositionOne/DispositionOneSchema");
const DispositionThree = require("../src/dispositionThree/DispositionThreeSchema");
const DispositionTwo = require("../src/dispositionTwo/DispositionTwoSchema");
const District = require("../src/district/DistrictSchema");
const Feature = require("../src/feature/FeatureSchema");
const FileManager = require("../src/fileManager/FileManagerSchema");
const GoodReceivedNote = require("../src/GRN/GRNSchema");
const InitialCallOne = require("../src/initialCallOne/InitialCallOneSchema");
const InitialCallThree = require("../src/initialCallThree/InitialCallThreeSchema");
const IntialCallTwo = require("../src/initialCallTwo/InitialCallTwoSchema");
const InquirySchema = require("../src/inquiry/InquirySchema");
const Inventories = require("../src/inventories/InventoriesSchema");
const Item = require("../src/item/ItemSchema");
const Language = require("../src/language/LanguageSchema");
const Ledger = require("../src/ledger/LedgerSchema");
const OrderSchema = require("../src/orderInquiry/OrderInquirySchema");
const OTP = require("../src/otp/OtpSchema");
const Pincode = require("../src/pincode/PincodeSchema");
const ProductCategory = require("../src/productCategory/ProductCategorySchema");
const ProductGroup = require("../src/productGroup/ProductGroupSchema");
const Product = require("../src/product/ProductSchema");
const ProductSubCategory = require("../src/productSubCategory/ProductSubCategorySchema");
const PurchaseOrder = require("../src/purchaseOrder/PurchaseOrderSchema");
const Scheme = require("../src/scheme/SchemeSchema");
const SalesOrder = require("../src/salesOrder/SalesOrderSchema");
const SlotMaster = require("../src/slotMaster/SlotMasterSchema");
const State = require("../src/state/StateSchema");
const TapeMaster = require("../src/tapeMaster/TapeMasterSchema");
const Taxes = require("../src/taxes/TaxesSchema");
const Tehsil = require("../src/tehsil/TehsilSchema");
const userRole = require("../src/userRole/UserRoleSchema");
const User = require("../src/user/UserSchema");
const Vendor = require("../src/vendor/VendorSchema");
const WareHouse = require("../src/wareHouse/WareHouseSchema");
const WebsiteBlog = require("../src/websiteBlog/WebsiteBlogSchema");
const WebsiteMaster = require("../src/websiteMaster/WebsiteMasterSchema");
const WebsiteMetaTag = require("../src/websiteMetaTag/WebsiteMetaTagSchema");
const WebsitePage = require("../src/websitePage/WebsitePageSchema");
const ZonalManagerSchema = require("../src/zonalManager/ZonalManagerSchema");

const collectionArrToMatch = [
  Admin,
  allocation,
  Area,
  Artist,
  AsrRequest,
  AssetCategory,
  assetLocation,
  AssetSchema,
  AttributesGroup,
  Attributes,
  BarCode,
  CallSchema,
  CartonBoxBarcode,
  CartonBox,
  ChannelCategory,
  ChannelGroup,
  ChannelMaster,
  ChannelUpdation,
  Competitor,
  ComplaintDisposition,
  Country,
  DealerPincode,
  DealersCategory,
  DealerScheme,
  Dealer,
  DeliveryBoy,
  DidManagement,
  DispositionOne,
  DispositionThree,
  DispositionTwo,
  District,
  Feature,
  FileManager,
  GoodReceivedNote,
  InitialCallOne,
  InitialCallThree,
  IntialCallTwo,
  InquirySchema,
  Inventories,
  Item,
  Language,
  Ledger,
  OrderSchema,
  OTP,
  Pincode,
  ProductCategory,
  ProductGroup,
  Product,
  ProductSubCategory,
  PurchaseOrder,
  Scheme,
  SalesOrder,
  SlotMaster,
  State,
  TapeMaster,
  Taxes,
  Tehsil,
  userRole,
  User,
  Vendor,
  WareHouse,
  WebsiteBlog,
  WebsiteMaster,
  WebsiteMetaTag,
  WebsitePage,
  ZonalManagerSchema,
];

const checkIdInCollectionsThenDelete = async (
  collectionArrToMatch,
  IdToMatch,
  IdToDelete
) => {
  // Check for references in each collection
  let hasReferences = false;

  for (const collectionSchema of collectionArrToMatch) {
    const reference = await collectionSchema.findOne({
      [IdToMatch]: IdToDelete,
      isDeleted: false,
    });
    if (reference) {
      hasReferences = true;
      return {
        message: `This item cannot be deleted right now, because it is currently used in ${collectionSchema.modelName} collection`,
        status: false,
      };
    }
  }
  if (!hasReferences) {
    return {
      message: "Successfull.",
      status: true,
    };
  }
  return {
    message: "All OK",
    status: false,
  };
};

const checkIdExistOrNot = async (moduleName, IdsToCheck) => {
  const promises = await Promise.all(
    IdsToCheck.map(async (id) => {
      const isExists =
        IdsToCheck !== null || !IdsToCheck
          ? await moduleName.findCount({ _id: id, isDeleted: false })
          : null;
      if (isExists === 0 || isExists === null || !isExists) {
        throw new Error(`Invalid ${id}`);
      }
    })
  );
  return {
    message: "All ok",
    status: true,
  };
};

module.exports = {
  checkIdInCollectionsThenDelete,
  checkIdExistOrNot,
  collectionArrToMatch,
};
