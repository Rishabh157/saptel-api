const { Worker } = require("bullmq");
const config = require("./config/config");
require("./database/mongo");
// ----service---------
const callService = require("./api/v1/src/call/CallService");
const orderService = require("./api/v1/src/orderInquiry/OrderInquiryService");

const dealerService = require("./api/v1/src/dealer/DealerService");

const dispositionThreeService = require("./api/v1/src/dispositionThree/DispositionThreeService");

const webLeadService = require("./api/v1/src/webLeads/WebLeadsService");

const {
  getInquiryNumber,
  getOrderNumber,
  isOrder,
  dealerSurvingPincode,
  getAssignWarehouse,
  isPrepaid,
  checkDealerHaveInventory,
} = require("./api/v1/src/call/CallHelper");

const mongoose = require("mongoose");

const {
  applicableCriteria,

  orderStatusEnum,
  paymentModeType,
  fakeOrderDisposition,
  webLeadStatusEnum,
} = require("./api/v1/helper/enumUtils");
const { default: axios } = require("axios");

const { createOrderInQueue } = require("./api/v1/src/call/CreateOrderHelper");
// Configure the Redis connection
const orderWorker = new Worker(
  "add-order",
  async (job) => {
    await createOrderInQueue(job.data);
  },
  {
    connection: {
      host: "localhost", // Redis server host
      port: 6379, // Redis server port
      // password: 'your-redis-password' // Uncomment if Redis is password-protected
    },
  }
);
