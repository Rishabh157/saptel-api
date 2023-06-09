const mongoose = require("mongoose")
const AdminSchema = require("../model/AdminSchema")
const AllocationSchema = require("../model/AllocationSchema")
const AreaSchema = require("../model/AreaSchema")
const ArtistSchema = require("../model/ArtistSchema")
const AsrSchema = require("../model/AsrRequestSchema")
const AssetCategorySchema = require("../model/AssetCategorySchema")
const AssetLocationSchema = require("../model/AssetLocationSchema")
const AssetSchema = require("../model/AssetSchema")


const deleteUser = async (collectionArrToMatch, IdToDelete) => {
    // Check for references in each collection
    let hasReferences = false;

    for (const collectionSchema of collectionArrToMatch) {
        const reference = await collectionSchema.findOne({ companyId: IdToDelete });
        if (reference) {
            hasReferences = true;
            return {
                message: `Cannot delete. Found reference in ${collectionSchema.modelName} collection.`,
                status: false
            };
        }
    }
    if (!hasReferences) {
        return {
            message: "Successfull.",
            status: true
        };
    }
    return {
        message: "All OK",
        status: false
    };
}

module.exports = {
    deleteUser,
    AdminSchema
}
