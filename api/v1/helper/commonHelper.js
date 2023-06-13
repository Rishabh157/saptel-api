const Admin = require('./AdminSchema')
const allocation = require('../src/allocation/AllocationSchema')
const Area = require('../src/area/AreaSchema')
const Artist = require("./ArtistSchema");
const AsrRequest = require("./AsrRequestSchema");
const AssetCategory = require("./AssetCategorySchema");
const assetLocation = require('./AssetLocationSchema')
const AssetSchema = require("./AssetSchema");
const AttributesGroup = require('./AttributesGroupSchema')
const Attributes = require('./AttributesSchema')
const BarCode = require('./BarCodeSchema')
const BatchSchema = require("./BatchSchema");
const CallSchema = require("./CallSchema");
const CartonBoxBarcode = require("./CartonBoxBarcodeSchema");
const CartonBox = require('./CartonBoxSchema')
const ChannelCategory = require("./ChannelCategorySchema");
const ChannelGroup = require("./ChannelGroupSchema");
const ChannelManagement = require("./ChannelManagementSchema");
const ChannelMaster = require("./ChannelMasterSchema");
const ChannelUpdation = require("./ChannelUpdationSchema");
const Competitor = require("./CompetitorSchema");
const ComplaintDisposition = require("./ComplaintDispositionSchema");
const Country = require('./CountrySchema')
const DealerPincode = require("./DealerPincodeSchema");
const DealersCategory = require('./DealersCategorySchema')
const DealerScheme = require("./DealerSchemeSchema");
const Dealer = require('./DealerSchema')
const DeliveryBoy = require("./DeliveryBoySchema");
const DidManagement = require("./DidManagementSchema");
const DispositionOne = require("./DispositionOneSchema");
const DispositionThree = require("./DispositionThreeSchema");
const DispositionTwo = require("./DispositionTwoSchema");
const District = require('./DistrictSchema')
const Feature = require("./FeatureSchema");
const FileManager = require('./FileManagerSchema')
const GoodReceivedNote = require("./GRNSchema");
const InitialCallOne = require("./InitialCallOneSchema");
const InitialCallThree = require("./InitialCallThreeSchema");
const IntialCallTwo = require("./InitialCallTwoSchema");
const InquirySchema = require("./InquiruSchema");
const Inventories = require("./InventoriesSchema");
const Item = require('./ItemSchema')
const Language = require('./LanguageSchema')
const Ledger = require("./LedgerSchema");
const OrderSchema = require("./OrderSchema");
const OTP = require('./OtpSchema')
const Pincode = require('./PincodeSchema')
const ProductCategory = require('./ProductCategorySchema')
const ProductGroup = require('./ProductGroupSchema')
const Product = require('./ProductSchema')
const ProductSubCategory = require("./ProductSubCategorySchema");
const PurchaseOrder = require("./PurchaseOrderSchema");
const Scheme = require('./SchemeSchema')
const SalesOrder = require("./SalesOrderSchema");
const SlotMaster = require("./SlotMasterSchema");
const State = require('./StateSchema')
const TapeMaster = require("./TapeMasterSchema");
const Taxes = require('./TaxesSchema')
const Tehsil = require('./TehsilSchema')
const userRole = require('./UserRoleSchema')
const User = require('./UserSchema')
const Vendor = require('./VendorSchema')
const WareHouse = require('./WareHouseSchema')
const WebsiteBlog = require("./WebsiteBlogSchema");
const WebsiteMaster = require("./WebsiteMasterSchema");
const WebsiteMetaTag = require("./WebsiteMetaTagSchema");
const WebsitePage = require("./WebsitePageSchema");
const ZonalManagerSchema = require("./ZonalManagerSchema");

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
