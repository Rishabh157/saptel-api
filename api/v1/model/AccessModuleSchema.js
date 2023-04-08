// model schema starts here

const mongoose = require('mongoose')
const AccessmoduleSchema = new mongoose.Schema(
  {
    route: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    method: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },
    actionName: {
      type: String,
      required: true,
      trim: true
    },
    actionDisplayName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    actionDisplayRank: {
      type: Number,
      required: true,
      default: 1
    },
    ModelName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    ModelDisplayName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    ModelDisplayRank: {
      type: Number,
      required: true,
      default: 1
    },
    fields: {
      type: [
        {
          displayName: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
          },
          fieldName: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
          }
        }
      ],
      default: []
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
)
const allFields = Object.keys(AccessmoduleSchema.obj)
const searchKeys = [
  'actionName',
  'actionDisplayName',
  'actionDisplayRank',
  'ModelName',
  'ModelDisplayName',
  'ModelDisplayRank'
]
module.exports = mongoose.model('Accessmodule', AccessmoduleSchema)
module.exports.searchKeys = [...searchKeys]
module.exports.allFields = [...allFields]
