const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const DealerSupervisorSchema = new mongoose.Schema(
    {
        dealerId: {
            type: ObjectId,
            required: true,
            trim: true,
        },
        supervisorName: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
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
    "dealerId",
    "supervisorName",
];
module.exports = mongoose.model("DealerSupervisor", DealerSupervisorSchema);
module.exports.searchKeys = [...searchKeys];
