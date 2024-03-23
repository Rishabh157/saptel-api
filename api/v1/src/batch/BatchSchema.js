const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const BatchSchema = new mongoose.Schema(
  {
    batchNumber: { type: Number, required: true },
    batchCreatedBy: { type: ObjectId, required: true },
    batchAssignedTo: { type: ObjectId, required: true },
    orders: { type: [ObjectId], required: true },
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

const searchKeys = ["batchNumber", "createdByLabel"];
module.exports = mongoose.model("Batch", BatchSchema);
module.exports.searchKeys = [...searchKeys];

// model schema ends here
