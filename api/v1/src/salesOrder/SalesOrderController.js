const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const salesOrderService = require("./SalesOrderService");
const productGroupService = require("../productGroup/ProductGroupService");
const wareHouseService = require("../wareHouse/WareHouseService");
const companyService = require("../company/CompanyService");
const stateService = require("../state/StateService");
const ledgerService = require("../ledger/LedgerService");
const {
  checkIdInCollectionsThenDelete,
  collectionArrToMatch,
} = require("../../helper/commonHelper");

const { searchKeys } = require("./SalesOrderSchema");
const { errorRes } = require("../../../utils/resError");
const {
  getQuery,
  getUserRoleData,
  getFieldsToDisplay,
  getAllowedField,
} = require("../../helper/utils");
const {
  ledgerType,
  moduleType,
  actionType,
} = require("../../helper/enumUtils");

const { getBalance } = require("../ledger/LedgerHelper");

const {
  getSearchQuery,
  checkInvalidParams,
  getRangeQuery,
  getFilterQuery,
  getDateFilterQuery,
  getLimitAndTotalCount,
  getOrderByAndItsValue,
} = require("../../helper/paginationFilterHelper");
const mongoose = require("mongoose");

//add start
exports.add = async (req, res) => {
  try {
    let {
      soNumber,
      dealerId,
      dealerWareHouseId,
      companyWareHouseId,
      productSalesOrder,
      dhApproved,
      dhApprovedActionBy,
      dhApprovedAt,
      accApproved,
      accApprovedActionBy,
      accApprovedAt,
      companyId,
      dhApprovedById,
      accApprovedById,
    } = req.body;

    const isCompanyExists = await companyService.findCount({
      _id: companyId,
      isDeleted: false,
    });
    if (!isCompanyExists) {
      throw new ApiError(httpStatus.OK, "Invalid Company");
    }

    /**
     * check duplicate exist
     */
    let dataExist = await salesOrderService.isExists([{ soNumber }]);
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }
    const output = productSalesOrder.map((po) => {
      return {
        soNumber: soNumber,
        dealerId: dealerId,
        dealerWareHouseId: dealerWareHouseId,
        companyWareHouseId: companyWareHouseId,
        productSalesOrder: {
          productGroupId: po.productGroupId,
          rate: po.rate,
          quantity: po.quantity,
        },
        companyId: companyId,
      };
    });
    //------------------create data-------------------
    let dataCreated = await salesOrderService.createMany(output);

    if (dataCreated) {
      return res.status(httpStatus.CREATED).send({
        message: "Added successfully.",
        data: dataCreated,
        status: true,
        code: "CREATED",
        issue: null,
      });
    } else {
      throw new ApiError(httpStatus.NOT_IMPLEMENTED, `Something went wrong.`);
    }
  } catch (err) {
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue });
  }
};

//update start
exports.update = async (req, res) => {
  try {
    const { soData } = req.body;

    const soIds = soData?.map((ele) => ele?.id);
    const allSoOfThisNumber = await salesOrderService?.findAllWithQuery({
      soNumber: soData[0]?.soNumber,
    });
    const allSoOfThisNumberResults = await Promise.all(allSoOfThisNumber);

    // Update and set isDeleted to true for records not in soIds
    let orgIds = [];
    await Promise.all(
      allSoOfThisNumber?.map(async (ele) => {
        orgIds.push(String(ele?._id));
        if (!soIds.includes(String(ele?._id))) {
          console.log("updateing.........");
          await salesOrderService.getOneAndUpdate(
            {
              _id: new mongoose.Types.ObjectId(ele?._id), // Changed from ele?.id to ele?._id
              isDeleted: false,
            },
            {
              $set: {
                isDeleted: true,
              },
            }
          );
        }
      })
    );

    // inserting new
    await Promise.all(
      soData?.map(async (ele) => {
        if (!orgIds.includes(ele.id)) {
          const { id, ...rest } = ele;
          console.log("creating", rest);

          await salesOrderService.createNewData({ ...rest });
        }
      })
    );

    const updatePromises = soData?.map(async (ele) => {
      if (ele?.id !== "") {
        const dataUpdated = await salesOrderService.getOneAndUpdate(
          {
            _id: new mongoose.Types.ObjectId(ele?.id), // Changed from ele?.id to ele?._id
            isDeleted: false,
          },
          {
            $set: {
              ...ele,
            },
          }
        );
        return dataUpdated;
      }
    });

    const updateResults = await Promise.all(updatePromises);

    // Check if any data was successfully updated
    const updatedDataFound = updateResults.some(
      (dataUpdated) => dataUpdated !== null
    );
    console.log(updatedDataFound, "updatedDataFound");

    if (updatedDataFound) {
      return res.status(httpStatus.OK).send({
        message: "Updated successfully.",
        data: updateResults,
        status: true,
        code: "OK",
        issue: null,
      });
    } else {
      throw new ApiError(httpStatus.NOT_IMPLEMENTED, `Something went wrong.`);
    }
  } catch (err) {
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue });
  }
};

//update start
exports.updateLevel = async (req, res) => {
  try {
    let {
      dhApprovedAt,
      accApprovedAt,
      type,
      dhApprovedById,
      accApprovedById,
      dhApprovedActionBy,
      accApproved,
      accApprovedActionBy,
      dhApproved,
    } = req.body;

    let sonumberToBeSearch = req.params.sonumber;

    let dataToSend = {};
    if (type === "ACC") {
      (dataToSend.accApprovedById = accApprovedById),
        (dataToSend.accApprovedActionBy = accApprovedActionBy),
        (dataToSend.accApprovedAt = accApprovedAt);
      dataToSend.accApproved = accApproved;
    } else {
      (dataToSend.dhApprovedById = dhApprovedById),
        (dataToSend.dhApprovedActionBy = dhApprovedActionBy),
        (dataToSend.dhApprovedAt = dhApprovedAt);
      dataToSend.dhApproved = dhApproved;
    }

    //------------------Find data-------------------
    let datafound = await salesOrderService.getOneByMultiField({
      soNumber: sonumberToBeSearch,
    });
    if (!datafound) {
      throw new ApiError(httpStatus.OK, `Sales order not found.`);
    }

    const dataUpdated = await salesOrderService.updateMany(
      {
        soNumber: sonumberToBeSearch,
        isDeleted: false,
      },
      {
        $set: dataToSend,
      }
    );
    if (type === "ACC") {
      let companyWarehouseId = datafound.companyWareHouseId;
      let dealerWarehouseId = datafound.dealerWareHouseId;

      let companyWarehouse = await wareHouseService.getOneByMultiField({
        isDeleted: false,
        _id: companyWarehouseId,
      });
      let dealerWarehouse = await wareHouseService.getOneByMultiField({
        isDeleted: false,
        _id: dealerWarehouseId,
      });
      if (!companyWarehouse || !dealerWarehouse) {
        throw new ApiError(httpStatus.OK, `warehouse is invalid`);
      }
      let companyWarehouseStateId =
        companyWarehouse.registrationAddress.stateId;
      let dealerWarehouseStateId = dealerWarehouse.registrationAddress.stateId;
      let companyState = await stateService.getOneByMultiField({
        isDeleted: false,
        _id: companyWarehouseStateId,
      });
      let dealerState = await stateService.getOneByMultiField({
        isDeleted: false,
        _id: dealerWarehouseStateId,
      });
      if (!companyState || !dealerState) {
        throw new ApiError(httpStatus.OK, `state is invalid`);
      }
      const soData = await salesOrderService.findAllWithQuery({
        soNumber: sonumberToBeSearch,
        isDeleted: false,
      });
      let productGroupId = soData?.map((ele) => {
        return {
          Id: ele?.productSalesOrder?.productGroupId,
          quantity: ele?.productSalesOrder?.quantity,
          rate: ele?.productSalesOrder?.rate,
        };
      });
      let salesOrderBalance = 0;
      let totalAmount = 0;
      let totalTaxAmount = 0;

      if (Array.isArray(productGroupId) && productGroupId.length > 0) {
        (async () => {
          for (const ele of productGroupId) {
            let productGroupData = await productGroupService.findAllWithQuery({
              _id: ele?.Id,
            });
            if (companyState.stateName === dealerState.stateName) {
              salesOrderBalance = parseInt(ele.rate) * parseInt(ele.quantity);
              totalAmount += parseInt(ele.rate) * parseInt(ele.quantity);
              salesOrderBalance +=
                (salesOrderBalance *
                  (productGroupData[0].cgst + productGroupData[0].sgst)) /
                100;
              totalTaxAmount += salesOrderBalance;
            } else if (companyState.stateName !== dealerState.stateName) {
              if (dealerState.isUnion) {
                console.log("union");
                salesOrderBalance = parseInt(ele.rate) * parseInt(ele.quantity);
                console.log(salesOrderBalance, "salesOrderBalance");
                totalAmount += parseInt(ele.rate) * parseInt(ele.quantity);
                console.log(totalAmount, "totalAmount");
                console.log(productGroupData[0].utgst, "data");
                salesOrderBalance +=
                  (salesOrderBalance * productGroupData[0].utgst) / 100;
                totalTaxAmount += salesOrderBalance;
                console.log(totalTaxAmount, totalAmount, "total");
              } else {
                salesOrderBalance = parseInt(ele.rate) * parseInt(ele.quantity);
                totalAmount += parseInt(ele.rate) * parseInt(ele.quantity);
                salesOrderBalance +=
                  (salesOrderBalance * productGroupData[0].igst) / 100;
                totalTaxAmount += salesOrderBalance;
              }
            }
          }

          // This code will execute after the loop is completed

          if (soData[0].accApproved === true) {
            const balance = await getBalance(
              soData[0].dealerId,
              0,
              parseInt(totalTaxAmount)
            );
            //------------------create data-------------------
            let dataCreated = await ledgerService.createNewData({
              noteType: ledgerType.debit,
              taxAmount: parseInt(totalTaxAmount - totalAmount),
              creditAmount: 0,
              debitAmount: parseInt(salesOrderBalance),
              remark: "By Sales Order",
              companyId: soData[0].companyId,
              dealerId: soData[0].dealerId,
              balance: balance,
            });
          }
        })();
      } else {
        console.log("productGroupId is empty or not an array");
      }
    }

    //------------------create data-------------------

    if (dataUpdated) {
      return res.status(httpStatus.OK).send({
        message: "Updated successfully.",
        data: dataUpdated,
        status: true,
        code: "OK",
        issue: null,
      });
    } else {
      throw new ApiError(httpStatus.NOT_IMPLEMENTED, `Something went wrong.`);
    }
  } catch (err) {
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue });
  }
};

exports.allFilterGroupPagination = async (req, res) => {
  try {
    var dateFilter = req.body.dateFilter;
    let searchValue = req.body.searchValue;
    let searchIn = req.body.params;
    let filterBy = req.body.filterBy;
    let rangeFilterBy = req.body.rangeFilterBy;
    let isPaginationRequired = req.body.isPaginationRequired
      ? req.body.isPaginationRequired
      : true;
    let finalAggregateQuery = [];
    let matchQuery = {
      $and: [{ isDeleted: false }],
    };
    /**
     * to send only active data on web
     */
    console.log("here");
    if (req.path.includes("/app/") || req.path.includes("/app")) {
      matchQuery.$and.push({ isActive: true });
    }
    console.log("here 2");
    let { orderBy, orderByValue } = getOrderByAndItsValue(
      req.body.orderBy,
      req.body.orderByValue
    );

    //----------------------------

    /**
     * check search keys valid
     **/

    let searchQueryCheck = checkInvalidParams(searchIn, searchKeys);

    if (searchQueryCheck && !searchQueryCheck.status) {
      return res.status(httpStatus.OK).send({
        ...searchQueryCheck,
      });
    }
    /**
     * get searchQuery
     */
    const searchQuery = getSearchQuery(searchIn, searchKeys, searchValue);
    if (searchQuery && searchQuery.length) {
      matchQuery.$and.push({ $or: searchQuery });
    }
    //----------------------------
    /**
     * get range filter query
     */
    const rangeQuery = getRangeQuery(rangeFilterBy);
    if (rangeQuery && rangeQuery.length) {
      matchQuery.$and.push(...rangeQuery);
    }

    //----------------------------
    /**
     * get filter query
     */
    let booleanFields = [];
    let numberFileds = [];
    let objectIdFields = [
      "dealerWareHouseId",
      "dealerId",
      "companyWareHouseId",
      "companyId",
    ];

    const filterQuery = getFilterQuery(
      filterBy,
      booleanFields,
      numberFileds,
      objectIdFields
    );
    if (filterQuery && filterQuery.length) {
      matchQuery.$and.push(...filterQuery);
    }
    //----------------------------
    //calander filter
    /**
     * ToDo : for date filter
     */

    let allowedDateFiletrKeys = ["createdAt", "updatedAt"];

    const datefilterQuery = await getDateFilterQuery(
      dateFilter,
      allowedDateFiletrKeys
    );
    if (datefilterQuery && datefilterQuery.length) {
      matchQuery.$and.push(...datefilterQuery);
    }

    //calander filter
    //----------------------------

    /**
     * for lookups , project , addfields or group in aggregate pipeline form dynamic quer in additionalQuery array
     */
    let additionalQuery = [
      {
        $lookup: {
          from: "dealers",
          localField: "dealerId",
          foreignField: "_id",
          as: "dealer_name",
          pipeline: [
            {
              $project: {
                dealerName: { $concat: ["$firstName", " ", "$lastName"] },
              },
            },
            // { $project: { lastName: "$lastName" } },
          ],
        },
      },
      {
        $lookup: {
          from: "warehouses",
          localField: "companyWareHouseId",
          foreignField: "_id",
          as: "companyWarehouseName",
          pipeline: [{ $project: { wareHouseName: 1 } }],
        },
      },

      {
        $lookup: {
          from: "warehouses",
          localField: "dealerWareHouseId",
          foreignField: "_id",
          as: "warehouses_name",
          pipeline: [{ $project: { wareHouseName: 1 } }],
        },
      },
      {
        // "tax.taxId": "$tax.taxName",
        $addFields: {
          productSalesOrder: {
            groupName: "",
            productGroupId: "$productSalesOrder.productGroupId",
            quantity: "$productSalesOrder.quantity",
            rate: "$productSalesOrder.rate",
          },
        },
      },
      {
        $lookup: {
          from: "productgroups",
          localField: "productSalesOrder.productGroupId",
          foreignField: "_id",
          as: "productSalesOrders",
          pipeline: [{ $project: { groupName: 1 } }],
        },
      },
      {
        $addFields: {
          dealerLabel: {
            $arrayElemAt: ["$dealer_name.dealerName", 0],
          },
          companyWarehouseLabel: {
            $arrayElemAt: ["$companyWarehouseName.wareHouseName", 0],
          },
          warehouseLabel: {
            $arrayElemAt: ["$warehouses_name.wareHouseName", 0],
          },
          "productSalesOrder.groupName": {
            $arrayElemAt: ["$productSalesOrders.groupName", 0],
          },
        },
      },

      {
        $unset: [
          "dealer_name",
          "companyWarehouseName",
          "warehouses_name",
          "productSalesOrders",
        ],
      },
    ];
    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }
    let groupBySoNumber = {
      $group: {
        _id: "$soNumber", // Group by the unique soNumber field
        dealerName: { $first: "$dealerLabel" },
        dhApproved: { $first: "$dhApproved" },
        dhApprovedActionBy: { $first: "$dhApprovedActionBy" },
        dhApprovedAt: { $first: "$dhApprovedAt" },
        accApprovedActionBy: { $first: "$accApprovedActionBy" },
        accApprovedAt: { $first: "$accApprovedAt" },
        accApproved: { $first: "$accApproved" },
        createdAt: { $first: "$createdAt" },
        updatedAt: { $first: "$updatedAt" },
        // count: { $sum: 1 }, // Count the documents in each group
        documents: { $push: "$$ROOT" }, // Store the documents in an array
      },
    };

    finalAggregateQuery.push({
      $match: matchQuery,
    });
    finalAggregateQuery.push(groupBySoNumber);

    //-----------------------------------
    let dataFound = await salesOrderService.aggregateQuery(finalAggregateQuery);

    if (dataFound.length === 0) {
      throw new ApiError(httpStatus.OK, `No data Found`);
    }

    let { limit, page, totalData, skip, totalpages } =
      await getLimitAndTotalCount(
        req.body.limit,
        req.body.page,
        dataFound.length,
        req.body.isPaginationRequired
      );

    finalAggregateQuery.push({ $sort: { [orderBy]: parseInt(orderByValue) } });
    if (isPaginationRequired) {
      finalAggregateQuery.push({ $skip: skip });
      finalAggregateQuery.push({ $limit: limit });
    }
    let userRoleData = await getUserRoleData(req, salesOrderService);
    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.saleOrder,
      userRoleData,
      actionType.pagination
    );
    let result = await salesOrderService.aggregateQuery(finalAggregateQuery);
    let allowedFields = getAllowedField(fieldsToDisplay, result);

    if (allowedFields?.length) {
      return res.status(200).send({
        data: allowedFields,
        totalPage: totalpages,
        status: true,
        currentPage: page,
        totalItem: totalData,
        pageSize: limit,
        message: "Data Found",
        code: "OK",
        issue: null,
      });
    } else {
      throw new ApiError(httpStatus.OK, `No data Found`);
    }
  } catch (err) {
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue });
  }
};

//group by for dealer

exports.allFilterGroupPaginationForDealer = async (req, res) => {
  try {
    var dateFilter = req.body.dateFilter;
    let searchValue = req.body.searchValue;
    let searchIn = req.body.params;
    let filterBy = req.body.filterBy;
    let rangeFilterBy = req.body.rangeFilterBy;
    let isPaginationRequired = req.body.isPaginationRequired
      ? req.body.isPaginationRequired
      : true;
    let finalAggregateQuery = [];
    let matchQuery = {
      $and: [{ isDeleted: false }],
    };
    /**
     * to send only active data on web
     */
    console.log("here");
    if (req.path.includes("/app/") || req.path.includes("/app")) {
      matchQuery.$and.push({ isActive: true });
    }
    console.log("here 2");
    let { orderBy, orderByValue } = getOrderByAndItsValue(
      req.body.orderBy,
      req.body.orderByValue
    );

    //----------------------------

    /**
     * check search keys valid
     **/

    let searchQueryCheck = checkInvalidParams(searchIn, searchKeys);

    if (searchQueryCheck && !searchQueryCheck.status) {
      return res.status(httpStatus.OK).send({
        ...searchQueryCheck,
      });
    }
    /**
     * get searchQuery
     */
    const searchQuery = getSearchQuery(searchIn, searchKeys, searchValue);
    if (searchQuery && searchQuery.length) {
      matchQuery.$and.push({ $or: searchQuery });
    }
    //----------------------------
    /**
     * get range filter query
     */
    const rangeQuery = getRangeQuery(rangeFilterBy);
    if (rangeQuery && rangeQuery.length) {
      matchQuery.$and.push(...rangeQuery);
    }

    //----------------------------
    /**
     * get filter query
     */
    let booleanFields = ["dhApproved", "accApproved"];
    let numberFileds = [];
    let objectIdFields = [
      "dealerWareHouseId",
      "dealerId",
      "companyWareHouseId",
      "companyId",
    ];

    const filterQuery = getFilterQuery(
      filterBy,
      booleanFields,
      numberFileds,
      objectIdFields
    );
    if (filterQuery && filterQuery.length) {
      matchQuery.$and.push(...filterQuery);
    }
    //----------------------------
    //calander filter
    /**
     * ToDo : for date filter
     */

    let allowedDateFiletrKeys = ["createdAt", "updatedAt"];

    const datefilterQuery = await getDateFilterQuery(
      dateFilter,
      allowedDateFiletrKeys
    );
    if (datefilterQuery && datefilterQuery.length) {
      matchQuery.$and.push(...datefilterQuery);
    }

    //calander filter
    //----------------------------

    /**
     * for lookups , project , addfields or group in aggregate pipeline form dynamic quer in additionalQuery array
     */
    let additionalQuery = [
      {
        $lookup: {
          from: "dealers",
          localField: "dealerId",
          foreignField: "_id",
          as: "dealer_name",
          pipeline: [
            {
              $project: {
                dealerName: { $concat: ["$firstName", " ", "$lastName"] },
              },
            },
            // { $project: { lastName: "$lastName" } },
          ],
        },
      },
      {
        $lookup: {
          from: "warehouses",
          localField: "companyWareHouseId",
          foreignField: "_id",
          as: "companyWarehouseName",
          pipeline: [{ $project: { wareHouseName: 1 } }],
        },
      },

      {
        $lookup: {
          from: "warehouses",
          localField: "dealerWareHouseId",
          foreignField: "_id",
          as: "warehouses_name",
          pipeline: [{ $project: { wareHouseName: 1 } }],
        },
      },
      {
        // "tax.taxId": "$tax.taxName",
        $addFields: {
          productSalesOrder: {
            groupName: "",
            productGroupId: "$productSalesOrder.productGroupId",
            quantity: "$productSalesOrder.quantity",
            rate: "$productSalesOrder.rate",
          },
        },
      },
      {
        $lookup: {
          from: "productgroups",
          localField: "productSalesOrder.productGroupId",
          foreignField: "_id",
          as: "productSalesOrders",
          pipeline: [{ $project: { groupName: 1 } }],
        },
      },
      {
        $addFields: {
          dealerLabel: {
            $arrayElemAt: ["$dealer_name.dealerName", 0],
          },
          companyWarehouseLabel: {
            $arrayElemAt: ["$companyWarehouseName.wareHouseName", 0],
          },
          warehouseLabel: {
            $arrayElemAt: ["$warehouses_name.wareHouseName", 0],
          },
          "productSalesOrder.groupName": {
            $arrayElemAt: ["$productSalesOrders.groupName", 0],
          },
        },
      },

      {
        $unset: [
          "dealer_name",
          "companyWarehouseName",
          "warehouses_name",
          "productSalesOrders",
        ],
      },
    ];
    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }
    let groupBySoNumber = {
      $group: {
        _id: "$soNumber", // Group by the unique soNumber field
        dealerName: { $first: "$dealerLabel" },
        // count: { $sum: 1 }, // Count the documents in each group
        documents: { $push: "$$ROOT" }, // Store the documents in an array
      },
    };

    finalAggregateQuery.push({
      $match: matchQuery,
    });
    finalAggregateQuery.push(groupBySoNumber);

    //-----------------------------------
    let dataFound = await salesOrderService.aggregateQuery(finalAggregateQuery);

    if (dataFound.length === 0) {
      throw new ApiError(httpStatus.OK, `No data Found`);
    }

    let { limit, page, totalData, skip, totalpages } =
      await getLimitAndTotalCount(
        req.body.limit,
        req.body.page,
        dataFound.length,
        req.body.isPaginationRequired
      );

    finalAggregateQuery.push({ $sort: { [orderBy]: parseInt(orderByValue) } });
    if (isPaginationRequired) {
      finalAggregateQuery.push({ $skip: skip });
      finalAggregateQuery.push({ $limit: limit });
    }

    let result = await salesOrderService.aggregateQuery(finalAggregateQuery);

    if (result?.length) {
      return res.status(200).send({
        data: result,
        totalPage: totalpages,
        status: true,
        currentPage: page,
        totalItem: totalData,
        pageSize: limit,
        message: "Data Found",
        code: "OK",
        issue: null,
      });
    } else {
      throw new ApiError(httpStatus.OK, `No data Found`);
    }
  } catch (err) {
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue });
  }
};
// all filter pagination api
exports.allFilterPagination = async (req, res) => {
  try {
    var dateFilter = req.body.dateFilter;
    let searchValue = req.body.searchValue;
    let searchIn = req.body.params;
    let filterBy = req.body.filterBy;
    let rangeFilterBy = req.body.rangeFilterBy;
    let isPaginationRequired = req.body.isPaginationRequired
      ? req.body.isPaginationRequired
      : true;
    let finalAggregateQuery = [];
    let matchQuery = {
      $and: [{ isDeleted: false }],
    };
    /**
     * to send only active data on web
     */
    if (req.path.includes("/app/") || req.path.includes("/app")) {
      matchQuery.$and.push({ isActive: true });
    }

    let { orderBy, orderByValue } = getOrderByAndItsValue(
      req.body.orderBy,
      req.body.orderByValue
    );

    //----------------------------

    /**
     * check search keys valid
     **/

    let searchQueryCheck = checkInvalidParams(searchIn, searchKeys);

    if (searchQueryCheck && !searchQueryCheck.status) {
      return res.status(httpStatus.OK).send({
        ...searchQueryCheck,
      });
    }
    /**
     * get searchQuery
     */
    const searchQuery = getSearchQuery(searchIn, searchKeys, searchValue);
    if (searchQuery && searchQuery.length) {
      matchQuery.$and.push({ $or: searchQuery });
    }
    //----------------------------
    /**
     * get range filter query
     */
    const rangeQuery = getRangeQuery(rangeFilterBy);
    if (rangeQuery && rangeQuery.length) {
      matchQuery.$and.push(...rangeQuery);
    }

    //----------------------------
    /**
     * get filter query
     */
    let booleanFields = [];
    let numberFileds = [];
    let objectIdFields = [
      "dealerWareHouseId",
      "dealerId",
      "companyWareHouseId",
      "companyId",
    ];

    const filterQuery = getFilterQuery(
      filterBy,
      booleanFields,
      numberFileds,
      objectIdFields
    );
    if (filterQuery && filterQuery.length) {
      matchQuery.$and.push(...filterQuery);
    }
    //----------------------------
    //calander filter
    /**
     * ToDo : for date filter
     */

    let allowedDateFiletrKeys = ["createdAt", "updatedAt"];

    const datefilterQuery = await getDateFilterQuery(
      dateFilter,
      allowedDateFiletrKeys
    );
    if (datefilterQuery && datefilterQuery.length) {
      matchQuery.$and.push(...datefilterQuery);
    }

    //calander filter
    //----------------------------

    /**
     * for lookups , project , addfields or group in aggregate pipeline form dynamic quer in additionalQuery array
     */
    let additionalQuery = [
      {
        $lookup: {
          from: "dealers",
          localField: "dealerId",
          foreignField: "_id",
          as: "dealer_name",
          pipeline: [
            {
              $project: {
                dealerName: { $concat: ["$firstName", " ", "$lastName"] },
              },
            },
            // { $project: { lastName: "$lastName" } },
          ],
        },
      },
      {
        $lookup: {
          from: "warehouses",
          localField: "companyWareHouseId",
          foreignField: "_id",
          as: "companyWarehouseName",
          pipeline: [{ $project: { wareHouseName: 1 } }],
        },
      },

      {
        $lookup: {
          from: "warehouses",
          localField: "dealerWareHouseId",
          foreignField: "_id",
          as: "warehouses_name",
          pipeline: [{ $project: { wareHouseName: 1 } }],
        },
      },
      {
        // "tax.taxId": "$tax.taxName",
        $addFields: {
          productSalesOrder: {
            groupName: "",
            productGroupId: "$productSalesOrder.productGroupId",
            quantity: "$productSalesOrder.quantity",
            rate: "$productSalesOrder.rate",
          },
        },
      },
      {
        $lookup: {
          from: "productgroups",
          localField: "productSalesOrder.productGroupId",
          foreignField: "_id",
          as: "productSalesOrders",
          pipeline: [{ $project: { groupName: 1 } }],
        },
      },
      {
        $addFields: {
          dealerLabel: {
            $arrayElemAt: ["$dealer_name.dealerName", 0],
          },
          companyWarehouseLabel: {
            $arrayElemAt: ["$companyWarehouseName.wareHouseName", 0],
          },
          warehouseLabel: {
            $arrayElemAt: ["$warehouses_name.wareHouseName", 0],
          },
          "productSalesOrder.groupName": {
            $arrayElemAt: ["$productSalesOrders.groupName", 0],
          },
        },
      },

      {
        $unset: [
          "dealer_name",
          "companyWarehouseName",
          "warehouses_name",
          "productSalesOrders",
        ],
      },
    ];
    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery);
    }

    finalAggregateQuery.push({
      $match: matchQuery,
    });

    //-----------------------------------
    let dataFound = await salesOrderService.aggregateQuery(finalAggregateQuery);

    if (dataFound.length === 0) {
      throw new ApiError(httpStatus.OK, `No data Found`);
    }

    let { limit, page, totalData, skip, totalpages } =
      await getLimitAndTotalCount(
        req.body.limit,
        req.body.page,
        dataFound.length,
        req.body.isPaginationRequired
      );

    finalAggregateQuery.push({ $sort: { [orderBy]: parseInt(orderByValue) } });
    if (isPaginationRequired) {
      finalAggregateQuery.push({ $skip: skip });
      finalAggregateQuery.push({ $limit: limit });
    }
    let userRoleData = await getUserRoleData(req, salesOrderService);
    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.saleOrder,
      userRoleData,
      actionType.pagination
    );
    let result = await salesOrderService.aggregateQuery(finalAggregateQuery);
    let allowedFields = getAllowedField(fieldsToDisplay, result);

    if (allowedFields?.length) {
      return res.status(200).send({
        data: allowedFields,
        totalPage: totalpages,
        status: true,
        currentPage: page,
        totalItem: totalData,
        pageSize: limit,
        message: "Data Found",
        code: "OK",
        issue: null,
      });
    } else {
      throw new ApiError(httpStatus.OK, `No data Found`);
    }
  } catch (err) {
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue });
  }
};

//get api
exports.get = async (req, res) => {
  try {
    let companyId = req.params.companyid;

    //if no default query then pass {}
    let matchQuery = {
      companyId: new mongoose.Types.ObjectId(companyId),
      isDeleted: false,
    };
    if (req.query && Object.keys(req.query).length) {
      matchQuery = getQuery(matchQuery, req.query);
    }
    let additionalQuery = [
      { $match: matchQuery },
      {
        $lookup: {
          from: "dealers",
          localField: "dealerId",
          foreignField: "_id",
          as: "dealer_name",
          pipeline: [
            {
              $project: {
                dealerName: { $concat: ["$firstName", " ", "$lastName"] },
              },
            },
            // { $project: { lastName: "$lastName" } },
          ],
        },
      },
      {
        $lookup: {
          from: "warehouses",
          localField: "companyWareHouseId",
          foreignField: "_id",
          as: "companyWarehouseName",
          pipeline: [{ $project: { wareHouseName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "warehouses",
          localField: "dealerWareHouseId",
          foreignField: "_id",
          as: "warehouses_name",
          pipeline: [{ $project: { wareHouseName: 1 } }],
        },
      },
      {
        // "tax.taxId": "$tax.taxName",
        $addFields: {
          productSalesOrder: {
            groupName: "",
            productGroupId: "$productSalesOrder.productGroupId",
            quantity: "$productSalesOrder.quantity",
            rate: "$productSalesOrder.rate",
          },
        },
      },
      {
        $lookup: {
          from: "productgroups",
          localField: "productSalesOrder.productGroupId",
          foreignField: "_id",
          as: "productSalesOrders",
          pipeline: [{ $project: { groupName: 1 } }],
        },
      },
      {
        $addFields: {
          dealerLabel: {
            $arrayElemAt: ["$dealer_name.dealerName", 0],
          },
          companyWarehouseLabel: {
            $arrayElemAt: ["$companyWarehouseName.wareHouseName", 0],
          },
          warehouseLabel: {
            $arrayElemAt: ["$warehouses_name.wareHouseName", 0],
          },
          "productSalesOrder.groupName": {
            $arrayElemAt: ["$productSalesOrders.groupName", 0],
          },
        },
      },

      {
        $unset: [
          "dealer_name",
          "companyWarehouseName",
          "warehouses_name",
          "productSalesOrders",
        ],
      },
    ];
    let userRoleData = await getUserRoleData(req, salesOrderService);
    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.saleOrder,
      userRoleData,
      actionType.listAll
    );
    let dataExist = await salesOrderService.aggregateQuery(additionalQuery);
    let allowedFields = getAllowedField(fieldsToDisplay, dataExist);

    if (!allowedFields || !allowedFields?.length) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successfull.",
        status: true,
        data: allowedFields,
        code: "OK",
        issue: null,
      });
    }
  } catch (err) {
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue });
  }
};

//single view api
exports.getByDealerId = async (req, res) => {
  try {
    //if no default query then pass {}
    let idToBeSearch = req.params.id;

    let additionalQuery = [
      {
        $match: {
          dealerId: new mongoose.Types.ObjectId(idToBeSearch),
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: "dealers",
          localField: "dealerId",
          foreignField: "_id",
          as: "dealer_name",
          pipeline: [
            {
              $project: {
                dealerName: { $concat: ["$firstName", " ", "$lastName"] },
              },
            },
            // { $project: { lastName: "$lastName" } },
          ],
        },
      },
      {
        $lookup: {
          from: "warehouses",
          localField: "companyWareHouseId",
          foreignField: "_id",
          as: "companyWarehouseName",
          pipeline: [{ $project: { wareHouseName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "warehouses",
          localField: "dealerWareHouseId",
          foreignField: "_id",
          as: "warehouses_name",
          pipeline: [{ $project: { wareHouseName: 1 } }],
        },
      },
      {
        // "tax.taxId": "$tax.taxName",
        $addFields: {
          productSalesOrder: {
            groupName: "",
            productGroupId: "$productSalesOrder.productGroupId",
            quantity: "$productSalesOrder.quantity",
            rate: "$productSalesOrder.rate",
          },
        },
      },
      {
        $lookup: {
          from: "productgroups",
          localField: "productSalesOrder.productGroupId",
          foreignField: "_id",
          as: "productSalesOrders",
          pipeline: [{ $project: { groupName: 1 } }],
        },
      },
      {
        $addFields: {
          dealerLabel: {
            $arrayElemAt: ["$dealer_name.dealerName", 0],
          },
          companyWarehouseLabel: {
            $arrayElemAt: ["$companyWarehouseName.wareHouseName", 0],
          },
          warehouseLabel: {
            $arrayElemAt: ["$warehouses_name.wareHouseName", 0],
          },
          "productSalesOrder.groupName": {
            $arrayElemAt: ["$productSalesOrders.groupName", 0],
          },
        },
      },

      {
        $unset: [
          "dealer_name",
          "companyWarehouseName",
          "warehouses_name",
          "productSalesOrders",
        ],
      },
    ];
    let dataExist = await salesOrderService.aggregateQuery(additionalQuery);

    if (!dataExist.length) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successfull.",
        status: true,
        data: dataExist,
        code: "OK",
        issue: null,
      });
    }
  } catch (err) {
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue });
  }
};
//single view api
exports.getById = async (req, res) => {
  try {
    //if no default query then pass {}
    let sonumberToBeSearch = req.params.sonumber;

    let additionalQuery = [
      {
        $match: {
          soNumber: sonumberToBeSearch,
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: "dealers",
          localField: "dealerId",
          foreignField: "_id",
          as: "dealer_name",
          pipeline: [
            {
              $project: {
                dealerName: { $concat: ["$firstName", " ", "$lastName"] },
              },
            },
            // { $project: { lastName: "$lastName" } },
          ],
        },
      },
      {
        $lookup: {
          from: "warehouses",
          localField: "companyWareHouseId",
          foreignField: "_id",
          as: "companyWarehouseName",
          pipeline: [{ $project: { wareHouseName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "warehouses",
          localField: "dealerWareHouseId",
          foreignField: "_id",
          as: "warehouses_name",
          pipeline: [{ $project: { wareHouseName: 1 } }],
        },
      },
      {
        // "tax.taxId": "$tax.taxName",
        $addFields: {
          productSalesOrder: {
            groupName: "",
            productGroupId: "$productSalesOrder.productGroupId",
            quantity: "$productSalesOrder.quantity",
            rate: "$productSalesOrder.rate",
          },
        },
      },
      {
        $lookup: {
          from: "productgroups",
          localField: "productSalesOrder.productGroupId",
          foreignField: "_id",
          as: "productSalesOrders",
          pipeline: [{ $project: { groupName: 1 } }],
        },
      },
      {
        $addFields: {
          dealerLabel: {
            $arrayElemAt: ["$dealer_name.dealerName", 0],
          },
          companyWarehouseLabel: {
            $arrayElemAt: ["$companyWarehouseName.wareHouseName", 0],
          },
          warehouseLabel: {
            $arrayElemAt: ["$warehouses_name.wareHouseName", 0],
          },
          "productSalesOrder.groupName": {
            $arrayElemAt: ["$productSalesOrders.groupName", 0],
          },
        },
      },

      {
        $unset: [
          "dealer_name",
          "companyWarehouseName",
          "warehouses_name",
          "productSalesOrders",
        ],
      },
    ];
    let userRoleData = await getUserRoleData(req, salesOrderService);
    let fieldsToDisplay = getFieldsToDisplay(
      moduleType.saleOrder,
      userRoleData,
      actionType.view
    );
    let dataExist = await salesOrderService.aggregateQuery(additionalQuery);
    let allowedFields = getAllowedField(fieldsToDisplay, dataExist);

    if (!allowedFields?.length) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successfull.",
        status: true,
        data: allowedFields,
        code: "OK",
        issue: null,
      });
    }
  } catch (err) {
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue });
  }
};

//delete api
exports.deleteDocument = async (req, res) => {
  try {
    let sonumber = req.params.sonumber;
    const soExists = await salesOrderService.getOneByMultiField({
      soNumber: sonumber,
    });
    if (!soExists) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    const deleteRefCheck = await checkIdInCollectionsThenDelete(
      collectionArrToMatch,
      "salesOrderId",
      soExists._id
    );

    if (deleteRefCheck.status === true) {
      let deleted = await salesOrderService.updateMany(
        {
          soNumber: sonumber,
          isDeleted: false,
        },
        {
          $set: {
            isDeleted: true,
          },
        }
      );
      if (!deleted) {
        throw new ApiError(httpStatus.OK, "Some thing went wrong.");
      }
    }
    return res.status(httpStatus.OK).send({
      message: deleteRefCheck.message,
      status: deleteRefCheck.status,
      data: null,
      code: "OK",
      issue: null,
    });
  } catch (err) {
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue });
  }
};
//statusChange
exports.statusChange = async (req, res) => {
  try {
    let _id = req.params.id;
    let dataExist = await salesOrderService.getOneByMultiField({ _id });
    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let isActive = dataExist.isActive ? false : true;

    let statusChanged = await salesOrderService.getOneAndUpdate(
      { _id },
      { isActive }
    );
    if (!statusChanged) {
      throw new ApiError(httpStatus.OK, "Some thing went wrong.");
    }
    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      status: true,
      data: statusChanged,
      code: "OK",
      issue: null,
    });
  } catch (err) {
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue });
  }
};

// update so status

exports.updateSoStatus = async (req, res) => {
  try {
    let _id = req.params.id;
    let status = req.params.status;
    let dataExist = await salesOrderService.getOneByMultiField({ _id });
    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }

    let statusChanged = await salesOrderService.getOneAndUpdate(
      { _id },
      { status }
    );
    if (!statusChanged) {
      throw new ApiError(httpStatus.OK, "Some thing went wrong.");
    }
    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      status: true,
      data: statusChanged,
      code: "OK",
      issue: null,
    });
  } catch (err) {
    let errData = errorRes(err);
    logger.info(errData.resData);
    let { message, status, data, code, issue } = errData.resData;
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue });
  }
};
