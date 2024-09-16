const { Queue } = require("bullmq");
const orderAddQueue = new Queue("add-order", {
  connection: {
    host: "localhost", // Change to your Redis host if necessary
    port: 6379, // Change to your Redis port if necessary
  },
});
const addOrder = async (body) => {
  console.log(body, "body");
  const res = await orderAddQueue.add("adding order", body);
  console.log("Job added to queue", res.id);
};

module.exports = {
  addOrder,
};
