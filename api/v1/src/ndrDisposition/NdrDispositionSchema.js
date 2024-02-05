const mongoose = require("mongoose");
const NdrDispositionSchema = new mongoose.Schema(
  {
    ndrDisposition: {
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

const searchKeys = ["ndrDisposition"];
module.exports = mongoose.model("NdrDisposition", NdrDispositionSchema);
module.exports.searchKeys = [...searchKeys];

// model schema ends here
