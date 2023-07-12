// model schema starts here

const { required } = require("joi");
const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const UserAccessSchema = new mongoose.Schema(
  {
    userId: {
      type: ObjectId,
      required: false,
      default: null,
    },
    departmentId: {
      type: String,
      required: true,
      trim: true,
    },
    departmentName: {
      type: String,
      required: true,
      trim: true,
    },

    userRoleId: {
      type: String,
      required: true,
      trim: true,
    },
    userRoleName: {
      type: String,
      required: true,
      trim: true,
    },

    module: {
      type: [
        {
          moduleId: {
            type: String,
            required: true,
            trim: true,
          },
          moduleName: {
            type: String,
            required: true,
            trim: true,
          },

          moduleAction: {
            type: [
              {
                actionUrl: {
                  type: String,
                  required: true,
                  trim: true,
                },
                actionId: {
                  type: String,
                  required: true,
                  trim: true,
                },
                actionName: {
                  type: String,
                  required: true,
                  trim: true,
                },

                fields: {
                  type: [
                    {
                      fieldId: {
                        type: String,
                        required: true,
                        trim: true,
                      },
                      fieldName: {
                        type: String,
                        required: true,
                        trim: true,
                      },

                      fieldValue: {
                        type: String,
                        required: true,
                        trim: true,
                      },
                    },
                  ],
                  required: false,
                  default: [],
                },
              },
            ],
            required: false,
            default: [],
          },
        },
      ],
      required: false,
      default: [],
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

const searchKeys = [
  "userId",
  "departmentId",
  "departmentName",
  "userRoleId",
  "userName",
  "moduleId",
  "moduleName",
  "moduleAction",
];
module.exports = mongoose.model("UserAccess", UserAccessSchema);
module.exports.searchKeys = [...searchKeys];
