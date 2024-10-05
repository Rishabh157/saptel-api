const http = require("http");
const app = require("./app");
const config = require("./config/config");
const logger = require("./config/logger");
const fs = require("fs");
const port = config.port || 3004;
const server = http.createServer(app);
const cron = require("node-cron");
const cluster = require("cluster");
const os = require("os");
const totalCPU = os.cpus().length;
const {
  addSlotEveryDayFun,
  UpdateExpiredBarcode,
} = require("./api/v1/cron-functions");
const {
  getShipyaariToken,
} = require("./api/v1/third-party-services/ShipyaariService");

// cron for slot add
cron.schedule("0 12 * * *", async () => {
  await getShipyaariToken();
  await addSlotEveryDayFun();
  await UpdateExpiredBarcode();
});
//-------------------------------
//start server
// TODO: check server connection, do not remove console logs in this file

if (cluster.isPrimary) {
  for (let i = 0; i < totalCPU; i++) {
    cluster.fork();
  }
} else {
  const serverConnected = server.listen(port, async () => {
    logger.info(`Server is running on port ${port}`);
  });
}

//--------------------------------------------------------------------
