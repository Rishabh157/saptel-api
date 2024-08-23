const axios = require("axios");
const httpStatus = require("http-status");
const ApiError = require("../../utils/apiErrorUtils");
const config = require("../../../config/config");

class ClickPostServices {
  constructor() {
    if (!ClickPostServices.instance) {
      this.url = config.maerksApiBaseUrl;
      this.apiKey = config.maerksApiKey;
      this.headers = this.createHeaders();
      ClickPostServices.instance = this;
    }

    return ClickPostServices.instance;
  }

  createHeaders() {
    return {
      "Api-key": this.apiKey,
      Accept: "application/json",
      "Content-Type": "application/json",
    };
  }

  handleError(error) {
    console.error("Error:", error);
    if (error.response) {
      throw new ApiError(
        error.response.status,
        error.response.data.message ||
          error.response.data.error ||
          "Failed to process the request"
      );
    } else {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        error.message ||
          "An unexpected error occurred while processing the request"
      );
    }
  }

  async makeRequest(method, endpoint, data, params) {
    const config = {
      method,
      url: this.url + endpoint,
      headers: this.headers,
      data,
      params,
    };
    console.log("here2-----------------------------");

    try {
      const response = await axios(config);
      console.log("here3-----------------------------");

      return response.data;
    } catch (error) {
      console.log("here4-----------------------------");

      this.handleError(error);
    }
  }

  async createOrder(data) {
    console.log("here1-----------------------------");

    try {
      const headers = {
        "Content-Type": "application/json",
      };
      const params = {
        username: config.maerksApiUserName,
        key: config.maerksApiKey,
      };
      const response = await axios.post(
        config.maerksApiBaseUrl + "create-order",
        data,
        {
          params,
          headers,
        }
      );
      console.log("here3-----------------------------", response.data);

      return response.data;
    } catch (error) {
      console.log("here4-----------------------------", error);
      return error;
    }
  }

  async getOrderStatus(req, res) {
    const query = { ...req.query };
    const result = await this.makeRequest(
      "get",
      "/api/v3/get-order-status/",
      null,
      query
    );
    return result;
  }

  async cancelOrder(req, res) {
    const data = req.body;
    const result = await this.makeRequest(
      "post",
      "/api/v3/cancel-order/",
      data
    );
    return result;
  }

  async trackOrder(req, res) {
    const query = { ...req.query };
    const result = await this.makeRequest(
      "get",
      "/api/v3/track-order/",
      null,
      query
    );
    return result;
  }
}

module.exports = new ClickPostServices();
