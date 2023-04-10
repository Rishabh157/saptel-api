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
      lowercase: true
    },
    actionName: {
      type: String,
      required: true,
      lowercase: true,
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
    modelName: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    modelDisplayName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    modelDisplayRank: {
      type: Number,
      required: true,
      default: 1
    },
    fields: {
      type: [
        {
          fieldDisplayName: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
          },
          fieldName: {
            type: String,
            required: true,
            trim: true
          },
          fieldRank: {
            type: Number,
            // required: true,
            default: 1
          }
        }
      ],
      required: true
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
const searchKeys = [
  'actionName',
  'actionDisplayName',
  'actionDisplayRank',
  'modelName',
  'modelDisplayName',
  'modelDisplayRank',
  'fields.fieldDisplayName',
  'fields.fieldName'
]
module.exports = mongoose.model('Accessmodule', AccessmoduleSchema)
module.exports.searchKeys = [...searchKeys]
