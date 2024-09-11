const ApiError = require("../../../utils/apiErrorUtils");
const { courierRTOType } = require("../../helper/enumUtils");
const productGroupSummaryService = require("./ProductGroupSummaryService");
const httpStatus = require("http-status");

const addRemoveAvailableQuantity = async (
  companyId,
  warehouseId,
  productGroupId,
  quantity,
  status
) => {
  try {
    let foundProductCategorySummary =
      await productGroupSummaryService?.getOneByMultiField({
        companyId,
        warehouseId,
        productGroupId,
      });

    if (!foundProductCategorySummary) {
      if (status === "REMOVE") {
        return { status: false, msg: "Warehouse doesn't have this product" };
      } else if (status === "ADD") {
        const createdSummary = await productGroupSummaryService.createNewData({
          companyId,
          warehouseId,
          productGroupId,
          freezeQuantity: 0,
          avaliableQuantity: quantity,
          avaliableUsedQuantity: 0, // Initialize this field
        });
        return {
          status: !!createdSummary,
          msg: createdSummary ? "" : "Failed to create summary",
        };
      }
    } else {
      if (status === "REMOVE") {
        // Check availableQuantity first
        if (foundProductCategorySummary.avaliableQuantity >= quantity) {
          const updatedSummary =
            await productGroupSummaryService.getOneAndUpdate(
              { companyId, warehouseId, productGroupId },
              { $inc: { avaliableQuantity: -quantity } }
            );
          return {
            status: !!updatedSummary,
            msg: updatedSummary ? "" : "Failed to update available quantity",
          };
        }
        // If availableQuantity is insufficient, check availableUsedQuantity
        else if (
          foundProductCategorySummary.avaliableUsedQuantity >= quantity
        ) {
          const updatedSummary =
            await productGroupSummaryService.getOneAndUpdate(
              { companyId, warehouseId, productGroupId },
              { $inc: { avaliableUsedQuantity: -quantity } }
            );
          return {
            status: !!updatedSummary,
            msg: updatedSummary
              ? ""
              : "Failed to update available used quantity",
          };
        }
        // If both availableQuantity and availableUsedQuantity are insufficient
        else {
          return { status: false, msg: "No products available in inventory" };
        }
      } else if (status === "ADD") {
        const updatedSummary = await productGroupSummaryService.getOneAndUpdate(
          { companyId, warehouseId, productGroupId },
          { $inc: { avaliableQuantity: quantity } }
        );
        return {
          status: !!updatedSummary,
          msg: updatedSummary ? "" : "Failed to update available quantity",
        };
      }
    }
  } catch (err) {
    console.log(err, "Error in addRemoveAvailableQuantity");
    return { status: false, msg: "Something went wrong" };
  }
};

// add available quantity for new company for WTC transfer
const addAvailableQuantity = async (
  companyId,
  warehouseId,
  productGroupId,
  quantity
) => {
  try {
    let foundProductCategorySummary =
      await productGroupSummaryService?.getOneByMultiField({
        companyId,
        warehouseId,
        productGroupId,
      });

    if (!foundProductCategorySummary) {
      console.log(
        "......................",
        companyId,
        warehouseId,
        productGroupId,
        quantity
      );
      const createdSummary = await productGroupSummaryService.createNewData({
        companyId,
        warehouseId,
        productGroupId,
        freezeQuantity: 0,
        avaliableQuantity: quantity,
      });
      console.log(createdSummary, "createdSummary");
      if (!createdSummary) {
        return {
          status: false,
          msg: "Something went wrong while creating inventory",
        };
      }
      return {
        status: true,
        msg: "",
      };
    } else {
      const updatedSummary = await productGroupSummaryService.getOneAndUpdate(
        { companyId, warehouseId, productGroupId },
        { $inc: { avaliableQuantity: quantity } }
      );
      if (!updatedSummary) {
        return {
          status: false,
          msg: "Something went wrong while updating inventory",
        };
      }
      return {
        status: true,
        msg: "",
      };
    }
  } catch (err) {
    console.log(err, ",,,,,,,,,,,,,,,,,,,,,,,,");
    return { status: false, msg: "Something went wrong" };
  }
};

// add fresh used quantity
const addReturnQuantity = async (
  companyId,
  warehouseId,
  productGroupId,
  quantity,
  type,
  curStatus
) => {
  try {
    console.log(
      companyId,
      warehouseId,
      productGroupId,
      quantity,
      type,
      curStatus,
      "-------"
    );

    let queryObj = {};
    let removequeryObj = {};

    // Handling the current status to remove quantities
    if (curStatus) {
      switch (curStatus) {
        case courierRTOType.fresh:
          removequeryObj = { avaliableUsedQuantity: -quantity };
          break;
        case courierRTOType.damage:
          removequeryObj = { damageQuantity: -quantity };
          break;
        case courierRTOType.fake:
          removequeryObj = { fakeQuantity: -quantity };
          break;
        case courierRTOType.lost:
          removequeryObj = { lostQuantity: -quantity };
          break;
        case courierRTOType.destroyed:
          removequeryObj = { destroyedQuantity: -quantity };
          break;
        default:
          throw new Error("Invalid current status type");
      }
    }

    // Handling the new status to add quantities
    switch (type) {
      case courierRTOType.fresh:
        queryObj = { avaliableUsedQuantity: quantity };
        break;
      case courierRTOType.damage:
        queryObj = { damageQuantity: quantity };
        break;
      case courierRTOType.fake:
        queryObj = { fakeQuantity: quantity };
        break;
      case courierRTOType.lost:
        queryObj = { lostQuantity: quantity };
        break;
      case courierRTOType.destroyed:
        removequeryObj = { destroyedQuantity: quantity };
        break;
      default:
        throw new Error("Invalid return type");
    }

    // Logging the remove query
    console.log(removequeryObj, "Remove Query -------------");

    // Combining the queries and updating inventory
    const updatedSummary = await productGroupSummaryService.getOneAndUpdate(
      { companyId, warehouseId, productGroupId },
      { $inc: { ...queryObj, ...removequeryObj } }
    );

    if (!updatedSummary) {
      return {
        status: false,
        msg: "Something went wrong while updating inventory",
      };
    }

    return {
      status: true,
      msg: "Inventory updated successfully",
    };
  } catch (err) {
    console.error(err, "Error in addReturnQuantity");
    return { status: false, msg: "Something went wrong" };
  }
};

const addRemoveFreezeQuantity = async (
  companyId,
  warehouseId,
  productGroupId,
  quantity,
  status
) => {
  try {
    const foundProductCategorySummary =
      await productGroupSummaryService?.getOneByMultiField({
        companyId,
        warehouseId,
        productGroupId,
      });

    if (!foundProductCategorySummary) {
      return { status: false, msg: "Warehouse doesn't have this product" };
    }

    if (status === "ADD") {
      if (foundProductCategorySummary.avaliableQuantity >= quantity) {
        const updatedSummary = await productGroupSummaryService.getOneAndUpdate(
          { companyId, warehouseId, productGroupId },
          {
            $inc: {
              freezeQuantity: quantity,
              avaliableQuantity: -quantity,
            },
          }
        );
        return {
          status: !!updatedSummary,
          msg: updatedSummary ? "" : "Failed to update summary",
        };
      } else {
        return {
          status: false,
          msg: "Available quantity is less than freeze quantity",
        };
      }
    }

    if (status === "REMOVE") {
      const updatedSummary = await productGroupSummaryService.getOneAndUpdate(
        { companyId, warehouseId, productGroupId },
        {
          $inc: {
            freezeQuantity: -quantity,
          },
        }
      );
      return {
        status: !!updatedSummary,
        msg: updatedSummary ? "" : "Failed to update summary",
      };
    }
  } catch (err) {
    return { status: false, msg: "Something went wrong" };
  }
};

const checkFreezeQuantity = async (
  companyId,
  warehouseId,
  productGroupId,
  quantity
) => {
  try {
    const foundProductCategorySummary =
      await productGroupSummaryService?.getOneByMultiField({
        companyId,
        warehouseId,
        productGroupId,
      });

    if (!foundProductCategorySummary) {
      return { status: false, msg: "Product not available at warehouse" };
    }

    if (
      // foundProductCategorySummary.freezeQuantity >=
      foundProductCategorySummary.avaliableQuantity < quantity
    ) {
      return {
        status: false,
        msg: "Product may not be available or is fully frozen",
      };
    }

    return { status: true, msg: "" };
  } catch (err) {
    return { status: false, msg: "Something went wrong" };
  }
};

const checkDispatchFreezeQuantity = async (
  companyId,
  warehouseId,
  productGroupId,
  quantity
) => {
  try {
    const foundProductCategorySummary =
      await productGroupSummaryService?.getOneByMultiField({
        companyId,
        warehouseId,
        productGroupId,
      });

    if (!foundProductCategorySummary) {
      return { status: false, msg: "Product not available at warehouse" };
    }

    if (
      // foundProductCategorySummary.freezeQuantity >=
      foundProductCategorySummary.freezeQuantity < quantity
    ) {
      return {
        status: false,
        msg: "Insuficient products",
      };
    }

    return { status: true, msg: "" };
  } catch (err) {
    return { status: false, msg: "Something went wrong" };
  }
};

module.exports = {
  addRemoveAvailableQuantity,
  addRemoveFreezeQuantity,
  checkFreezeQuantity,
  checkDispatchFreezeQuantity,
  addAvailableQuantity,
  addReturnQuantity,
};
