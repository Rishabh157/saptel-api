const SlotDefinition = require("../src/slotDefination/SlotDefinitionService");
const SlotMaster = require("../src/slotMaster/SlotMasterService");
const moment = require("moment"); // You may need to install the moment library using 'npm install moment'

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

    return (
      moment(slotStartDate, "DD/MM/YYYY").isBefore(
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
