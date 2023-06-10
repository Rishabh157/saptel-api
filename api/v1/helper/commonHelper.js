const Admin = require('../model/AdminSchema')
const allocation = require('../model/AllocationSchema')
const Area = require('../model/AreaSchema')
const Artist = require("../model/ArtistSchema");
const AsrRequest = require("../model/AsrRequestSchema");
const AssetCategory = require("../model/AssetCategorySchema");
const assetLocation = require('../model/AssetLocationSchema')
const AssetSchema = require("../model/AssetSchema");
const AttributesGroup = require('../model/AttributesGroupSchema')
const Attributes = require('../model/AttributesSchema')
const BarCode = require('../model/BarCodeSchema')
const BatchSchema = require("../model/BatchSchema");
const CallSchema = require("../model/CallSchema");
const CartonBoxBarcode = require("../model/CartonBoxBarcodeSchema");
const CartonBox = require('../model/CartonBoxSchema')
const ChannelCategory = require("../model/ChannelCategorySchema");
const ChannelGroup = require("../model/ChannelGroupSchema");
const ChannelManagement = require("../model/ChannelManagementSchema");
const ChannelMaster = require("../model/ChannelMasterSchema");
const ChannelUpdation = require("../model/ChannelUpdationSchema");
const Competitor = require("../model/CompetitorSchema");
const ComplaintDisposition = require("../model/ComplaintDispositionSchema");
const Country = require('../model/CountrySchema')
const DealerPincode = require("../model/DealerPincodeSchema");
const DealersCategory = require('../model/DealersCategorySchema')
const DealerScheme = require("../model/DealerSchemeSchema");
const Dealer = require('../model/DealerSchema')
const DeliveryBoy = require("../model/DeliveryBoySchema");
const DidManagement = require("../model/DidManagementSchema");
const DispositionOne = require("../model/DispositionOneSchema");
const DispositionThree = require("../model/DispositionThreeSchema");
const DispositionTwo = require("../model/DispositionTwoSchema");
const District = require('../model/DistrictSchema')
const Feature = require("../model/FeatureSchema");
const FileManager = require('../model/FileManagerSchema')
const GoodReceivedNote = require("../model/GRNSchema");
const InitialCallOne = require("../model/InitialCallOneSchema");
const InitialCallThree = require("../model/InitialCallThreeSchema");
const IntialCallTwo = require("../model/InitialCallTwoSchema");
const InquirySchema = require("../model/InquiruSchema");
const Inventories = require("../model/InventoriesSchema");
const Item = require('../model/ItemSchema')
const Language = require('../model/LanguageSchema')
const Ledger = require("../model/LedgerSchema");
const OrderSchema = require("../model/OrderSchema");
const OTP = require('../model/OtpSchema')
const Pincode = require('../model/PincodeSchema')
const ProductCategory = require('../model/ProductCategorySchema')
const ProductGroup = require('../model/ProductGroupSchema')
const Product = require('../model/ProductSchema')
const ProductSubCategory = require("../model/ProductSubCategorySchema");
const PurchaseOrder = require("../model/PurchaseOrderSchema");
const Scheme = require('../model/SchemeSchema')
const SalesOrder = require("../model/SalesOrderSchema");
const SlotMaster = require("../model/SlotMasterSchema");
const State = require('../model/StateSchema')
const TapeMaster = require("../model/TapeMasterSchema");
const Taxes = require('../model/TaxesSchema')
const Tehsil = require('../model/TehsilSchema')
const userRole = require('../model/UserRoleSchema')
const User = require('../model/UserSchema')
const Vendor = require('../model/VendorSchema')
const WareHouse = require('../model/WareHouseSchema')
const WebsiteBlog = require("../model/WebsiteBlogSchema");
const WebsiteMaster = require("../model/WebsiteMasterSchema");
const WebsiteMetaTag = require("../model/WebsiteMetaTagSchema");
const WebsitePage = require("../model/WebsitePageSchema");
const ZonalManagerSchema = require("../model/ZonalManagerSchema");

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
    BatchSchema,
    CallSchema,
    CartonBoxBarcode,
    CartonBox,
    ChannelCategory,
    ChannelGroup,
    ChannelManagement,
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
    ZonalManagerSchema
]

const checkIdInCollectionsThenDelete = async (collectionArrToMatch, IdToMatch, IdToDelete) => {
    // Check for references in each collection
    let hasReferences = false;

    for (const collectionSchema of collectionArrToMatch) {
        const reference = await collectionSchema.findOne({ [IdToMatch]: IdToDelete, isDeleted: false });
        if (reference) {
            hasReferences = true;
            return {
                message: `This item cannot be deleted right now, because it is currently used in ${collectionSchema.modelName} collection`,
                status: false
            };
        }
    }
    if (!hasReferences) {
        return {
            message: "Successfull.",
            status: true
        };
    }
    return {
        message: "All OK",
        status: false
    };
}

const checkIdExistOrNot = async (moduleName, IdsToCheck) => {
    const promises = await Promise.all(IdsToCheck.map(async (id) => {
        const isExists =
            IdsToCheck !== null || !IdsToCheck
                ? await moduleName.findCount({ _id: id, isDeleted: false })
                : null;
        if (isExists === 0 || isExists === null || !isExists) {
            throw new Error(`Invalid ${id}`);
        }
    }));
    return {
        message: "All ok",
        status: true
    };
}

module.exports = {
    checkIdInCollectionsThenDelete,
    checkIdExistOrNot,
    collectionArrToMatch
}
