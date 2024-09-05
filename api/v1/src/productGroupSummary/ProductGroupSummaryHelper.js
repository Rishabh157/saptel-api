const ApiError = require("../../../utils/apiErrorUtils");
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
        console.log("......................");
        const createdSummary = await productGroupSummaryService.createNewData({
          companyId,
          warehouseId,
          productGroupId,
          freezeQuantity: 0,
          avaliableQuantity: quantity,
        });
        console.log(createdSummary, "createdSummary");
        return {
          status: !!createdSummary,
          msg: createdSummary ? "" : "Failed to create summary",
        };
      }
    } else {
      const update = status === "ADD" ? quantity : -quantity;
      const updatedSummary = await productGroupSummaryService.getOneAndUpdate(
        { companyId, warehouseId, productGroupId },
        { $inc: { avaliableQuantity: update } }
      );
      return {
        status: !!updatedSummary,
        msg: updatedSummary ? "" : "Failed to update summary",
      };
    }
  } catch (err) {
    console.log(err, ",,,,,,,,,,,,,,,,,,,,,,,,");
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
};
