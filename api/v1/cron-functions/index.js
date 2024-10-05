const SlotDefinition = require("../src/slotDefination/SlotDefinitionService");
const SlotMaster = require("../src/slotMaster/SlotMasterService");
const barcodeService = require("../src/barCode/BarCodeService");
const moment = require("moment"); // You may need to install the moment library using 'npm install moment'
const { barcodeStatusType } = require("../helper/enumUtils");

exports.addSlotEveryDayFun = async () => {
  const slotDefinition = await SlotDefinition.findAllWithQuery({
    isDeleted: false,
    slotContinueStatus: true,
  });
  const todayDate = moment().format("DD/MM/YYYY");
  const todayDay = moment().format("dddd").toUpperCase();

  const filteredSlots = slotDefinition?.filter((slot) => {
    const slotStartDate = slot?.slotStartDate;
    const slotDay = slot?.slotDay?.map((day) => day.toUpperCase());

    const formattedSlotStartDate = moment(slotStartDate).format("DD/MM/YYYY");

    return (
      moment(formattedSlotStartDate, "DD/MM/YYYY").isBefore(
        moment(todayDate, "DD/MM/YYYY")
      ) && slotDay?.includes(todayDay)
    );
  });
  filteredSlots?.forEach(async (ele) => {
    await SlotMaster.createNewData({
      slotName: ele.slotName,
      channelGroupId: ele.channelGroupId,
      type: ele.type,
      tapeNameId: ele.tapeNameId,
      channelNameId: ele.channelNameId,
      channelTrp: ele.channelTrp,
      remarks: ele.remarks,
      slotPrice: ele.slotPrice,
      slotDay: ele.slotDay,
      slotRenewal: ele.slotRenewal,
      slotStartTime: ele.slotStartTime,
      slotEndTime: ele.slotEndTime,
      slotContinueStatus: ele.slotContinueStatus,
      runYoutubeLink: "",
      run: false,
      showOk: false,
      slotRunImage: "",
      slotRunVideo: "",
      reasonNotShow: null,
      runStartTime: "",
      runEndTime: "",
      runRemark: "",
      companyId: ele.companyId || "",
    });
  });
};

exports.UpdateExpiredBarcode = async () => {
  let todaysDate = JSON.stringify(
    new Date(`${moment().format("YYYY-MM-DD")}`)
  ).replace('"', "");

  let updated = await barcodeService?.updateMany(
    {
      isUsed: true,
      expiryDate: {
        $lte: todaysDate.split("T")[0],
        $ne: null, // Ensure expiryDate is not null
      },
    },
    {
      $set: {
        status: barcodeStatusType.expired,
      },
    }
  );
};
