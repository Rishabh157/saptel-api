const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const CompetitorSchema = mongoose.Schema(
  {
    competitorName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    companyId: {
      type: ObjectId,
      required: true,
      trim: true,
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

const searchKeys = ["competitorName", "companyId"];
module.exports = mongoose.model("Competitor", CompetitorSchema);
module.exports.searchKeys = [...searchKeys];
