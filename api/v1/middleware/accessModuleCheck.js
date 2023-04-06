const config = require("../../../config/config");
const logger = require("../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../utils/ApiError");
const accessmoduleService = require("../../v1/services/AccessModuleService");

exports.accessModuleCheck = async (req, res, next) => {
  try {
    /**
     * check token exist in req body
     */
    let method = req.method;
    let baseUrl = req.baseUrl +req.route.path

    const pathString = baseUrl.toLowerCase();
   
    if (
      !(await accessmoduleService.getOneByMultiField({
        route: pathString,
        method: method.toUpperCase(),
      }))
    ) {
      throw new ApiError(
        httpStatus.OK,
        `Please add ${pathString} route and method ${method} to the access module `
      );
    }

    next();
  } catch (err) {
    let msg = [];
    let i = 1;
    let error_msg = "";
    let statusCode =
      err.statusCode !== undefined && err.statusCode !== null
        ? err.statusCode
        : 500;
    if (!err.message) {
      for (let key in err.errors) {
        if (err.errors[key].message) {
          error_msg += i + "." + err.errors[key].message;
          i++;
        }
      }
    } else {
      error_msg = err.message;
    }
    logger.info(error_msg);

    return res.status(statusCode).send({
      message: error_msg,
      code: "ACCESS_MODULE_MISSING",
      issue: error_msg.toUpperCase().replace(/ /gi, "_"),
      data: null,
      status: false,
    });
  }
};
