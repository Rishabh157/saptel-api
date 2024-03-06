exports.getCustomerReputation = (data) => {
  let redFlags = [
    "659e2b70ef5489213ce36e80",
    "659e2b79ef5489213ce36e89",
    "659e2b88ef5489213ce36e92",
    "65e8367edf4427723d65e9a4",
  ];
  let otherRedFlagIc2 = [
    "659e2bb8ef5489213ce36eb6",
    "659e2df5ef5489213ce36f76",
  ];
  let otherRedFlagIc3 = [
    "659f714cef5489213ce37123",
    "65b0a433aae70b83add8a91d",
  ];
  let orangeFlags = ["659e2ba0ef5489213ce36ea4"];
  let otherOrangeFlags = [
    "659e2a37ef5489213ce36e1a",
    "659e2a3fef5489213ce36e22",
  ];
  let color = "GREEN"; // Initialize color with a default value
  data?.forEach((ele) => {
    if (redFlags.includes(ele?.icTwo.toString())) {
      color = "RED";
    }
    if (
      otherRedFlagIc2.includes(ele?.icTwo.toString()) &&
      otherRedFlagIc3.includes(ele?.icThree.toString())
    ) {
      color = "RED";
    }
    if (orangeFlags.includes(ele?.icTwo.toString())) {
      color = "ORANGE";
    }
    if (otherOrangeFlags.includes(ele?.icOne.toString())) {
      color = "ORANGE";
    }
  });
  return color;
};
