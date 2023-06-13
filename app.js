const express = require("express");
const app = express();
const helmet = require("helmet");
var cors = require("cors");
require("express-async-errors");
const httpStatus = require("http-status");
const morgan = require("./config/morgan");
const config = require("./config/config");
const logger = require("./config/logger");
const routes = require("./api/v1/Routes");
const path = require("path");
const { errorConverter, errorHandler } = require("./middleware/error");

// app.get("/", (req, res) => {
/**TODO: get request ip
 * req.socket.remoteAddress
 */
//     res.send()
// })

// /**
//  * swagger ui code
//  */
// const options = {
//     definition: {
//         openapi: "3.0.3",
//         info: {
//             title: config.project,
//             version: "1.0.0",
//             description: `API Library for ${config.project} project`
//         },
//         servers: [
//             {
//                 url: `localhost:${config.port}`
//             }
//         ]
//     },
//     apis: ["./api/v1/route/version_one/*.js"],
// }

// const specs = swaggerJsDoc(options);
// //swagger
// app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(specs));

//----------------------

/**
 * database connection estabilished
 */
require("./database/mongo");
require("./database/redis");

//----------------------

//---------
/**
 * to avoid cors error
 */
app.use(cors());
//----------------------

/**
 *
 *for security
 *
 */
app.use(helmet());
//----------------------

// app.use(morgan("dev"));
if (config.mode !== "development") {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/**
 * routes constant
 */
// const WebUserRouter = require('./api/v1/route/version_one/WebUserRoute');

/**
 * routes constant use
 */

//user start
// app.use('/webUser', WebUserRouter)
//user end
app.use("/public", express.static(__dirname + "/public"));

app.use(`/v1`, routes);

// send back a 404 error for any unknown api request
app.use((req, res) => {
  logger.info(
    "Invalid url requested. It may be because of versioning. Please check."
  );
  return res.status(httpStatus.NOT_FOUND).send({
    message: "Page Not found",
    status: false,
    code: "PAGE_NOT_FOUND",
    issue: "INVALID_REQUEST_ROUTE",
    data: null,
  });
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;
