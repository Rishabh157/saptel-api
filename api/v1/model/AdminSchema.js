const mongoose = require('mongoose')

const AdminSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: 'First name is required.',
      lowercase: true,
      trim: true
    },
    lastName: {
      type: String,
      required: 'Last name is required.',
      lowercase: true,
      trim: true
    },
    email: {
      type: String,
      required: 'Email is required.',
      lowercase: true,
      trim: true
    },
    userName: {
      type: String,
      required: 'User name is required.',
      lowercase: true,
      trim: true
    },
    mobile: {
      type: String,
      required: 'Mobile Number is required.',
      trim: true
    },
    password: {
      type: String,
      required: 'Password is required.',
      trim: true
    },
    userType: {
      type: String,
      default: 'SUPER_ADMIN',
      uppercase: true,
      trim: true
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
module.exports.searchKeys = [...searchKeys]

module.exports = mongoose.model('Admin', AdminSchema)
