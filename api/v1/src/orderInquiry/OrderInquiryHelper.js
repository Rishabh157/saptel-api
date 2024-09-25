const httpStatus = require("http-status");
const config = require("../../../../config/config");
const ApiError = require("../../../utils/apiErrorUtils");
const { customerReputationColor } = require("../../helper/enumUtils");
const moment = require("moment");

exports.getCustomerReputation = (data) => {
  let redFlags = config.redFlags;
  let otherRedFlagIc2 = config.otherRedFlagIc2;
  let otherRedFlagIc3 = config.otherRedFlagIc3;
  let orangeFlags = config.orangeFlags;
  let otherOrangeFlags = config.otherOrangeFlags;
  let color = customerReputationColor.green; // Initialize color with a default value
  data?.forEach((ele) => {
    if (redFlags.includes(ele?.icTwoLabel)) {
      color = customerReputationColor.red;
    }
    if (
      otherRedFlagIc2.includes(ele?.icTwoLabel) &&
      otherRedFlagIc3.includes(ele?.icThreeLabel)
    ) {
      color = customerReputationColor.red;
    }
    if (orangeFlags.includes(ele?.icTwoLabel)) {
      color = customerReputationColor.orange;
    }
    if (otherOrangeFlags.includes(ele?.icOneLabel)) {
      color = customerReputationColor.orange;
    }
  });
  return color;
};

exports.getDateFilterQueryCallBackAndPreferedDate = (
  dateFilter,
  allowedDateFiletrKeys
) => {
  let queryArray = [];
  if (
    dateFilter !== undefined &&
    dateFilter !== null &&
    Object.keys(dateFilter).length
  ) {
    if (dateFilter.dateFilterKey && dateFilter.dateFilterKey !== "") {
      if (!allowedDateFiletrKeys.includes(dateFilter.dateFilterKey)) {
        throw new ApiError(
          httpStatus.NOT_IMPLEMENTED,
          `Date filter key is invalid.`
        );
      }
    } else {
      dateFilter["dateFilterKey"] = "createdAt";
    }

    if (
      dateFilter.startDate !== undefined &&
      dateFilter.startDate !== "" &&
      (dateFilter.endDate === undefined || dateFilter.endDate === "")
    ) {
      dateFilter.endDate = dateFilter.startDate;
    } else if (
      dateFilter.endDate !== undefined &&
      dateFilter.endDate !== "" &&
      (dateFilter.startDate === undefined || dateFilter.startDate === "")
    ) {
      dateFilter.startDate = dateFilter.endDate;
    }
    if (dateFilter.startDate !== "" && dateFilter.endDate !== "") {
      queryArray.push({
        [dateFilter.dateFilterKey]: {
          $gte: moment(dateFilter.startDate)
            .startOf("day")
            .format("YYYY-MM-DD"),
          $lte: moment(dateFilter.endDate).endOf("day").format("YYYY-MM-DD"),
        },
      });
    }
  }

  return queryArray.length ? queryArray : null;
};

exports.generateOrderInvoice = (orderNumber) => {
  const year = new Date().getFullYear().toString().slice(-2); // Get last two digits of the current year
  const paddedOrderNumber =
    orderNumber < 100000
      ? String(orderNumber).padStart(6, "0") // Pad with zeros to ensure 6 digits
      : orderNumber.toString();

  return `RI-Y${year}-${paddedOrderNumber}`;
};
