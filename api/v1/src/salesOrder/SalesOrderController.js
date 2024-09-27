const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const salesOrderService = require("./SalesOrderService");
const productGroupService = require("../productGroup/ProductGroupService");
const wareHouseService = require("../wareHouse/WareHouseService");
const dealerService = require("../dealer/DealerService");
const companyService = require("../company/CompanyService");
const branchService = require("../companyBranch/CompanyBranchService");
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
  generateInvoiceString,
} = require("../../helper/utils");
const {
  ledgerType,
  moduleType,
  actionType,
} = require("../../helper/enumUtils");

const { getBalance, getLedgerNo } = require("../ledger/LedgerHelper");

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
const { getInvoiceNumber } = require("../call/CallHelper");
const { addSalesOrderToTally } = require("./SalesOrderHelper");
const {
  checkFreezeQuantity,
  addRemoveFreezeQuantity,
} = require("../productGroupSummary/ProductGroupSummaryHelper");

//add start
exports.add = async (req, res) => {
  try {
    let {
      // soNumber,
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
      expectedDeliveryDate,
    } = req.body;

    const isCompanyExists = await companyService.findCount({
      _id: companyId,
      isDeleted: false,
    });
    if (!isCompanyExists) {
      throw new ApiError(httpStatus.OK, "Invalid Company");
    }

    let lastObject = await salesOrderService.aggregateQuery([
      { $sort: { _id: -1 } },
      { $limit: 1 },
    ]);
    let currentNumber = 0;
    if (!lastObject.length) {
      currentNumber = 1;
    } else {
      currentNumber = parseInt(lastObject[0]?.soNumber) + 1;
    }
    const output = productSalesOrder.map((po) => {
      return {
        soNumber: currentNumber,
        dealerId: dealerId,
        dealerWareHouseId: dealerWareHouseId,
        companyWareHouseId: companyWareHouseId,
        productSalesOrder: {
          productGroupId: po.productGroupId,
          rate: po.rate,
          quantity: po.quantity,
        },
        companyId: companyId,
        createdById: req.userData.Id,
        branchId: req.userData.branchId,
        expectedDeliveryDate: expectedDeliveryDate,
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
    const {
      dhApprovedAt,
      accApprovedAt,
      type,
      dhApprovedById,
      accApprovedById,
      dhApprovedActionBy,
      accApproved,
      accApprovedActionBy,
      dhApproved,
      invoice,
    } = req.body;

    const sonumberToBeSearch = req.params.sonumber;

    // Find the sales order data
    const datafound = await salesOrderService.aggregateQuery([
      { $match: { soNumber: sonumberToBeSearch } },
    ]);

    if (!datafound.length) {
      throw new ApiError(httpStatus.OK, "Sales order not found.");
    }

    // Get branch data
    const branchdata = await branchService.getOneByMultiField({
      isDeleted: false,
      _id: datafound[0].branchId,
    });

    if (!branchdata) {
      throw new ApiError(httpStatus.OK, "Invalid branch!");
    }

    const dataToSend =
      type === "ACC"
        ? {
            accApprovedById,
            accApprovedActionBy,
            accApprovedAt,
            accApproved,
            invoice,
            invoiceDate: new Date(),
            invoiceNumber: await generateInvoiceString(
              branchdata.branchCode,
              await getInvoiceNumber(req.userData.companyId)
            ),
          }
        : {
            dhApprovedById,
            dhApprovedActionBy,
            dhApprovedAt,
            dhApproved,
            invoice,
          };

    // Process data based on type
    if (type === "ACC" && accApproved) {
      const [companyWarehouse, dealerWarehouse] = await Promise.all([
        wareHouseService.getOneByMultiField({
          isDeleted: false,
          _id: datafound[0].companyWareHouseId,
        }),
        wareHouseService.getOneByMultiField({
          isDeleted: false,
          _id: datafound[0].dealerWareHouseId,
        }),
      ]);

      if (!companyWarehouse || !dealerWarehouse) {
        throw new ApiError(httpStatus.OK, "Invalid warehouse");
      }
      const [companyState, dealerState] = await Promise.all([
        stateService.getOneByMultiField({
          isDeleted: false,
          _id: companyWarehouse.registrationAddress.stateId,
        }),
        stateService.getOneByMultiField({
          isDeleted: false,
          _id: dealerWarehouse.registrationAddress.stateId,
        }),
      ]);
      if (!companyState || !dealerState) {
        throw new ApiError(httpStatus.OK, "Invalid state");
      }

      await Promise.all(
        datafound.map(async (item) => {
          const productSummary = await checkFreezeQuantity(
            req.userData.companyId,
            item.companyWareHouseId,
            item.productSalesOrder.productGroupId,
            item.productSalesOrder.quantity
          );

          if (!productSummary.status) {
            throw new ApiError(httpStatus.OK, productSummary.msg);
          }
        })
      );

      await Promise.all(
        datafound.map(async (item) => {
          const createdData = await addRemoveFreezeQuantity(
            req.userData.companyId,
            item.companyWareHouseId,
            item.productSalesOrder.productGroupId,
            item.productSalesOrder.quantity,
            "ADD"
          );

          if (!createdData.status) {
            throw new ApiError(httpStatus.OK, createdData.msg);
          }
        })
      );

      const soData = await salesOrderService.findAllWithQuery({
        soNumber: sonumberToBeSearch,
        isDeleted: false,
      });

      let totalAmount = 0;
      let totalTaxAmount = 0;
      const itemDataForTally = [];

      await Promise.all(
        soData.map(async (ele) => {
          const productGroupData = await productGroupService.findAllWithQuery({
            _id: ele.productSalesOrder.productGroupId,
          });

          const rate = parseInt(ele.productSalesOrder.rate);
          const quantity = parseInt(ele.productSalesOrder.quantity);
          let salesOrderBalance = rate * quantity;
          totalAmount += salesOrderBalance;

          const taxType =
            companyState.stateName === dealerState.stateName
              ? ["CGST", "SGST"]
              : dealerState.isUnion
              ? ["UTGST"]
              : ["IGST"];

          const taxPercent = taxType.map(
            (tax) => productGroupData[0][tax.toLowerCase()]
          );
          const taxAmount = taxPercent.reduce((sum, tax) => sum + tax, 0);

          salesOrderBalance += (salesOrderBalance * taxAmount) / 100;
          totalTaxAmount += salesOrderBalance;

          itemDataForTally.push({
            itemNameForTally: productGroupData[0].groupName,
            rateForTally: rate,
            quantityForTally: quantity,
            taxTypeForTally: taxType,
            taxPercentForTally: taxPercent,
          });
        })
      );

      if (soData[0].accApproved) {
        const balance = await getBalance(
          soData[0].dealerId,
          0,
          parseInt(totalTaxAmount)
        );
        const dealerData = await dealerService.getOneByMultiField({
          _id: dealerWarehouse.dealerId,
          isDeleted: false,
        });

        await addSalesOrderToTally({
          companyState: companyState.stateName,
          partyName: dealerData.firmName,
          soNumber: sonumberToBeSearch,
          itemDataForTally,
          expectedDeliveryDate: datafound[0].expectedDeliveryDate,
        });

        await ledgerService.createNewData({
          noteType: ledgerType.debit,
          taxAmount: parseInt(totalTaxAmount - totalAmount),
          creditAmount: 0,
          debitAmount: parseInt(totalTaxAmount),
          remark: "By Sales Order",
          companyId: soData[0].companyId,
          dealerId: soData[0].dealerId,
          balance,
          ledgerNumber: await getLedgerNo(),
        });
      }
    }

    // Update the sales order data
    const dataUpdated = await salesOrderService.updateMany(
      { soNumber: sonumberToBeSearch, isDeleted: false },
      { $set: dataToSend }
    );

    if (dataUpdated) {
      return res.status(httpStatus.OK).send({
        message: "Updated successfully.",
        data: dataUpdated,
        status: true,
        code: "OK",
        issue: null,
      });
    } else {
      throw new ApiError(httpStatus.NOT_IMPLEMENTED, "Something went wrong.");
    }
  } catch (err) {
    const errData = errorRes(err);
    logger.info(errData.resData);
    const { message, status, data, code, issue } = errData.resData;
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
        $lookup: {
          from: "transports",
          localField: "transportnameId",
          foreignField: "_id",
          as: "transportData",
          pipeline: [{ $project: { transportName: 1 } }],
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
          transportName: {
            $arrayElemAt: ["$transportData.transportName", 0],
          },
        },
      },

      {
        $lookup: {
          from: "warehouses", // Reference your message collection
          localField: "dealerWareHouseId", // Match the ticketId field
          foreignField: "_id", // With the ticketId field in the message collection
          as: "warehouseData",
        },
      },
      {
        $lookup: {
          from: "states", // Reference your message collection
          localField: "warehouseData.registrationAddress.stateId", // Match the ticketId field
          foreignField: "_id", // With the ticketId field in the message collection
          as: "stateData",
        },
      },
      {
        $addFields: {
          warehouseStateLabel: {
            $arrayElemAt: ["$stateData.stateName", 0],
          },
        },
      },
      {
        $unset: [
          "dealer_name",
          "companyWarehouseName",
          "warehouses_name",
          "productSalesOrders",
          "warehouseData",
          "stateData",
          "transportData",
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
    let userRoleData = await getUserRoleData(req);
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
        $lookup: {
          from: "transports",
          localField: "transportnameId",
          foreignField: "_id",
          as: "transportData",
          pipeline: [{ $project: { transportName: 1 } }],
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
          transportName: {
            $arrayElemAt: ["$transportData.transportName", 0],
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
          "transportData",
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
        $lookup: {
          from: "transports",
          localField: "transportnameId",
          foreignField: "_id",
          as: "transportData",
          pipeline: [{ $project: { transportName: 1 } }],
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
          transportName: {
            $arrayElemAt: ["$transportData.transportName", 0],
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
          "transportData",
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
    let userRoleData = await getUserRoleData(req);
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
        $lookup: {
          from: "transports",
          localField: "transportnameId",
          foreignField: "_id",
          as: "transportData",
          pipeline: [{ $project: { transportName: 1 } }],
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
          transportName: {
            $arrayElemAt: ["$transportData.transportName", 0],
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
          "transportData",
        ],
      },
    ];
    let userRoleData = await getUserRoleData(req);
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
        $lookup: {
          from: "transports",
          localField: "transportnameId",
          foreignField: "_id",
          as: "transportData",
          pipeline: [{ $project: { transportName: 1 } }],
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
          transportName: {
            $arrayElemAt: ["$transportData.transportName", 0],
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
          "transportData",
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
          pipeline: [{ $project: { wareHouseName: 1, billingAddress: 1 } }],
        },
      },
      {
        $lookup: {
          from: "warehouses",
          localField: "dealerWareHouseId",
          foreignField: "_id",
          as: "warehouses_name",
          pipeline: [{ $project: { wareHouseName: 1, billingAddress: 1 } }],
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
        $lookup: {
          from: "transports",
          localField: "transportnameId",
          foreignField: "_id",
          as: "transportData",
          pipeline: [{ $project: { transportName: 1 } }],
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
          companyWarehouseBillingAddress: {
            $arrayElemAt: ["$companyWarehouseName.billingAddress", 0],
          },

          warehouseLabel: {
            $arrayElemAt: ["$warehouses_name.wareHouseName", 0],
          },
          transportName: {
            $arrayElemAt: ["$transportData.transportName", 0],
          },
          warehouseBillingAddress: {
            $arrayElemAt: ["$warehouses_name.billingAddress", 0],
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
          "transportData",
        ],
      },
    ];
    let userRoleData = await getUserRoleData(req);
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

// get dealer invoice

exports.getDealerInvoice = async (req, res) => {
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
          from: "companies",
          localField: "companyId",
          foreignField: "_id",
          as: "companyDetail",
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
                "document.panNumber": 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "warehouses",
          localField: "companyWareHouseId",
          foreignField: "_id",
          as: "companyWarehouseName",
          pipeline: [
            {
              $project: {
                wareHouseName: 1,
                billingAddress: 1,
                email: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "countries",
          localField: "companyWarehouseName.billingAddress.countryId",
          foreignField: "_id",
          as: "country_name",
        },
      },
      {
        $lookup: {
          from: "states",
          localField: "companyWarehouseName.billingAddress.stateId",
          foreignField: "_id",
          as: "state_name",
        },
      },
      {
        $lookup: {
          from: "districts",
          localField: "companyWarehouseName.billingAddress.districtId",
          foreignField: "_id",
          as: "district_name",
        },
      },
      {
        $lookup: {
          from: "pincodes",
          localField: "companyWarehouseName.billingAddress.pincodeId",
          foreignField: "_id",
          as: "pincode_name",
        },
      },
      {
        $lookup: {
          from: "warehouses",
          localField: "dealerWareHouseId",
          foreignField: "_id",
          as: "dealer_warehouse",
          pipeline: [
            {
              $project: {
                wareHouseName: 1,
                billingAddress: 1,
                email: 1,
                wareHouseCode: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "warehouses",
          localField: "companyWareHouseId",
          foreignField: "_id",
          as: "company_warehouse",
          pipeline: [
            {
              $project: {
                wareHouseName: 1,
                billingAddress: 1,
                email: 1,
                wareHouseCode: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "countries",
          localField: "dealer_warehouse.billingAddress.countryId",
          foreignField: "_id",
          as: "dealer_country_name",
        },
      },
      {
        $lookup: {
          from: "states",
          localField: "dealer_warehouse.billingAddress.stateId",
          foreignField: "_id",
          as: "dealer_state_name",
        },
      },
      {
        $lookup: {
          from: "districts",
          localField: "dealer_warehouse.billingAddress.districtId",
          foreignField: "_id",
          as: "dealer_district_name",
        },
      },
      {
        $lookup: {
          from: "pincodes",
          localField: "dealer_warehouse.billingAddress.pincodeId",
          foreignField: "_id",
          as: "dealer_pincode_name",
        },
      },
      {
        $unwind: "$productSalesOrder",
      },
      {
        $lookup: {
          from: "productgroups",
          localField: "productSalesOrder.productGroupId",
          foreignField: "_id",
          as: "productGroup",
        },
      },
      {
        $lookup: {
          from: "productsubcategories",
          localField: "productGroup.productSubCategoryId",
          foreignField: "_id",
          as: "productSubCategoryInfo",
        },
      },
      {
        $unwind: {
          path: "$productSubCategoryInfo",
          preserveNullAndEmptyArrays: true, // Keep orders even if no productInfo
        },
      },
      {
        $unwind: {
          path: "$productGroup",
          preserveNullAndEmptyArrays: true, // Keep orders even if no productInfo
        },
      },
      {
        $addFields: {
          "productSalesOrder.dealerSalePrice": "$productGroup.dealerSalePrice",
          "productSalesOrder.gst": "$productGroup.gst",
          "productSalesOrder.cgst": "$productGroup.cgst",
          "productSalesOrder.sgst": "$productGroup.sgst",
          "productSalesOrder.igst": "$productGroup.igst",
          "productSalesOrder.utgst": "$productGroup.utgst",
          "productSalesOrder.productGroupLabel": "$productGroup.groupName",
          "productSalesOrder.productSubCategory":
            "$productSubCategoryInfo.subCategoryName",
          "productSalesOrder.hsnCode": "$productSubCategoryInfo.hsnCode",
          "dealer_warehouse.billingAddress.dealerCountryName": {
            $arrayElemAt: ["$dealer_country_name.countryName", 0],
          },
          "dealer_warehouse.billingAddress.dealerStateName": {
            $arrayElemAt: ["$dealer_state_name.stateName", 0],
          },
          "dealer_warehouse.billingAddress.dealerDistrictName": {
            $arrayElemAt: ["$dealer_district_name.districtName", 0],
          },
          "dealer_warehouse.billingAddress.dealerPincodeName": {
            $arrayElemAt: ["$dealer_pincode_name.pincode", 0],
          },
          "dealer_warehouse.billingAddress.panNumber": {
            $arrayElemAt: ["$dealer_name.document.panNumber", 0],
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          productSalesOrder: { $push: "$productSalesOrder" },
          dealer_name: { $first: "$dealer_name" },
          companyWarehouseName: { $first: "$companyWarehouseName" },
          dealer_warehouse: { $first: "$dealer_warehouse" },
          company_warehouse: { $first: "$company_warehouse" },
          country_name: { $first: "$country_name" },
          state_name: { $first: "$state_name" },
          district_name: { $first: "$district_name" },
          pincode_name: { $first: "$pincode_name" },
          // dealer_country_name: { $first: "$country_name" },
          // dealer_state_name: { $first: "$state_name" },
          // dealer_district_name: { $first: "$district_name" },
          // dealer_pincode_name: { $first: "$pincode_name" },
          companyDetail: { $first: "$companyDetail" },
          invoiceDate: { $first: "$invoiceDate" },
          invoiceNumber: { $first: "$invoiceNumber" },
          soNumber: { $first: "$soNumber" },
        },
      },
      {
        $addFields: {
          dealerLabel: { $arrayElemAt: ["$dealer_name.dealerName", 0] },
          companyWarehouseLabel: {
            $arrayElemAt: ["$companyWarehouseName.wareHouseName", 0],
          },
          dealerWarehouse: {
            $arrayElemAt: ["$dealer_warehouse", 0],
          },
          companyWarehouse: {
            $arrayElemAt: ["$company_warehouse", 0],
          },
          // companyWarehouseBillingAddress: {
          //   $arrayElemAt: ["$companyWarehouseName.billingAddress", 0],
          // },
          warehouseLabel: {
            $arrayElemAt: ["$warehouses_name.wareHouseName", 0],
          },
          warehouseBillingAddress: {
            $arrayElemAt: ["$warehouses_name.billingAddress", 0],
          },
          wareHouseCountryName: {
            $arrayElemAt: ["$country_name.countryName", 0],
          },
          companyCountryName: {
            $arrayElemAt: ["$country_name.countryName", 0],
          },
          companyStateName: { $arrayElemAt: ["$state_name.stateName", 0] },
          companyDistrictName: {
            $arrayElemAt: ["$district_name.districtName", 0],
          },
          companyPincodeName: { $arrayElemAt: ["$pincode_name.pincode", 0] },
          dealerCountryName: {
            $arrayElemAt: ["$dealer_country_name.countryName", 0],
          },
          dealerStateName: {
            $arrayElemAt: ["$dealer_state_name.stateName", 0],
          },
          dealerDistrictName: {
            $arrayElemAt: ["$dealer_district_name.districtName", 0],
          },
          dealerPincodeName: {
            $arrayElemAt: ["$dealer_pincode_name.pincode", 0],
          },
          companyEmail: {
            $arrayElemAt: ["$companyWarehouseName.email", 0],
          },
          warehouseEmail: {
            $arrayElemAt: ["$warehouses_name.email", 0],
          },
          companyDetails: {
            $arrayElemAt: ["$companyDetail", 0],
          },
        },
      },
      {
        $unset: [
          "dealer_name",
          "companyWarehouseName",
          "company_warehouse",
          "dealer_warehouse",
          "country_name",
          "state_name",
          "district_name",
          "pincode_name",
          "dealer_country_name",
          "dealer_state_name",
          "dealer_district_name",
          "dealer_pincode_name",
          "productGroup",
          "companyDetail",
        ],
      },
    ];

    // let userRoleData = await getUserRoleData(req);
    // let fieldsToDisplay = getFieldsToDisplay(
    //   moduleType.saleOrder,
    //   userRoleData,
    //   actionType.view
    // );
    let dataExist = await salesOrderService.aggregateQuery(additionalQuery);
    let newData = {};
    let newProductSalesOrder = [];
    dataExist?.map((ele) => {
      const { productSalesOrder, ...rest } = ele;
      newData = { ...rest };
      newProductSalesOrder.push(...productSalesOrder);
    });
    newData.productSalesOrder = newProductSalesOrder;
    // let allowedFields = getAllowedField(fieldsToDisplay, newData);

    if (!newData) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successfull.",
        status: true,
        data: newData,
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
