// model schema starts here

const mongoose = require('mongoose')
const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    mobile: {
      type: String,
      required: false,
      trim: true,
      lowercase: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    userType: {
      type: String,
      required: true,
      default: 'USER'
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

const searchKeys = ['firstName', 'lastName', 'mobile', 'email']
module.exports = mongoose.model('User', UserSchema)
module.exports.searchKeys = [...searchKeys]

// model schema ends here
