const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const allocationSchema = new mongoose.Schema(
    {
        allocationName: { type: String, required: true, trim: true, lowercase: true },
        allocationDate: { type: String, required: true, trim: true, lowercase: true },
        assetLocationId: { type: ObjectId, required: true, trim: true },
        quantity: { type: Number, required: true, trim: true },
        returnDate: { type: String, default: "", trim: true, lowercase: true },
        remark: { type: String, default: "", trim: true, lowercase: true },
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
    "allocationName",
    "allocationDate",
    "assetLocationId",
    "quantity",
    "companyId",
];
module.exports = mongoose.model("allocation", allocationSchema);
module.exports.searchKeys = [...searchKeys];
