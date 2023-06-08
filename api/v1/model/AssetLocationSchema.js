const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const assetLocationSchema = new mongoose.Schema(
    {
        locationName: { type: String, required: true, trim: true, lowercase: true },
        companyId: { type: ObjectId, required: true, trim: true },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const searchKeys = [
    "locationName",
    "companyId",
];
module.exports = mongoose.model("assetLocation", assetLocationSchema);
module.exports.searchKeys = [...searchKeys];
