const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const userRoleSchema = new mongoose.Schema(
    {
        roleName: {
            type: String,
            required: true,
            trim: true
        },
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

const searchKeys = ["roleName", "companyId"];
module.exports = mongoose.model("userRole", userRoleSchema);
module.exports.searchKeys = [...searchKeys];
