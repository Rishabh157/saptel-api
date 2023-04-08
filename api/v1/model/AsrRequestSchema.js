const mongoose = require('mongoose')
const AsrRequestSchema = new mongoose.Schema(
  {
    arsDetails: {
      type: [
        {
          productName: {
            type: String,
            trim: true,
            lowercase: true,
            required: true
          },
          quantity: {
            type: Number,
            required: true
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

const searchKeys = ['productName', 'quantity']
module.exports = mongoose.model('AsrRequest', AsrRequestSchema)
module.exports.searchKeys = [...searchKeys]
