const mongoose = require('mongoose')

const otpSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: 'userId is required.',
      trim: true
    },
    userType: {
      type: String,
      required: 'userId is required.',
      uppercase: true,
      trim: true
    },
    otp: {
      type: String,
      required: 'OTP is required.',
      trim: true
    },
    expiryDateTime: {
      type: Date,
      required: 'expiryDateTime is required.',
      trim: true
    },
    isUsed: {
      type: Boolean,
      default: false
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('OTP', otpSchema)
