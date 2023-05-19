const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const ArtistSchema = new mongoose.Schema(
  {
    artistName: {
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

const searchKeys = ["artistName", "companyId"];
module.exports = mongoose.model("Artist", ArtistSchema);
module.exports.searchKeys = [...searchKeys];
