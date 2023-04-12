const { apiAppEnum } = require('../helper/enumUtils')
const mongoose = require('mongoose')
const validateAccessType = value => {
  const allowedValues = [
    apiAppEnum.app,
    apiAppEnum.dashboard,
    apiAppEnum.web,
    apiAppEnum.all
  ]
  if (!Array.isArray(value) || !value.length) {
    return false
  }
  console.log(value, allowedValues)
  return value.every(v => allowedValues.includes(v))
}

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
    acccessType: {
      type: [String],
      validate: [
        {
          validator: validateAccessType,
          message: 'Invalid accessType value.'
        }
      ],
      default: [apiAppEnum.dashboard]
    },
    featureName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    featureRank: {
      type: Number,
      required: true,
      default: 1
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
