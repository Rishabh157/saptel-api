const { Queue } = require("bullmq");
const orderAddQueue = new Queue("add-order", {
  connection: {
    host: "localhost", // Change to your Redis host if necessary
    port: 6379, // Change to your Redis port if necessary
  },
});
const addOrder = async (body) => {
  const res = await orderAddQueue.add("adding order", body);
};

module.exports = {
  addOrder,
};
