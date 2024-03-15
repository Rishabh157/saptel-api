const config = require("../../../../config/config");
const { customerReputationColor } = require("../../helper/enumUtils");

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
