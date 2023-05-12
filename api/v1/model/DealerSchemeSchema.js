const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const DealerSchemeSchema = new mongoose.Schema(
  {
    dealerId: { type: ObjectId, required: true, trim: true },
    schemeId: { type: ObjectId, required: true, trim: true },
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

const searchKeys = ["dealerId", "schemeId", "schemeName", "price"];
module.exports = mongoose.model("DealerScheme", DealerSchemeSchema);
module.exports.searchKeys = [...searchKeys];
