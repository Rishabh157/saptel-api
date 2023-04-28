const config = require("../../../../config/config");
const logger = require("../../../../config/logger");
const httpStatus = require("http-status");
const ApiError = require("../../../utils/apiErrorUtils");
const productService = require("../../services/ProductService");
const { searchKeys } = require("../../model/ProductSchema");
const { errorRes } = require("../../../utils/resError");
const { getQuery } = require("../../helper/utils");

const {
  getSearchQuery,
  checkInvalidParams,
  getRangeQuery,
  getFilterQuery,
  getDateFilterQuery,
  getLimitAndTotalCount,
  getOrderByAndItsValue,
} = require("../../helper/paginationFilterHelper");
const { default: mongoose } = require("mongoose");

//add start
exports.add = async (req, res) => {
  try {
    let {
      productCode,
      productName,
      productCategory,
      productSubCategory,
      productGroup,
      productWeight,
      dimension,
      productImage,
      description,
      item,
      tax,
      faq,
      video,
      callScript,
    } = req.body;
    /**
     * check duplicate exist
     */
    let dataExist = await productService.isExists([
      { productCode },
      { productName },
    ]);
    if (dataExist.exists && dataExist.existsSummary) {
      throw new ApiError(httpStatus.OK, dataExist.existsSummary);
    }
    //------------------create data-------------------
    let dataCreated = await productService.createNewData({ ...req.body });

    if (dataCreated) {
      return res.status(httpStatus.CREATED).send({
        message: "Added successfully.",
        data: dataCreated,
        status: true,
        code: null,
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
    let {
      productCode,
      productName,
      productCategory,
      productSubCategory,
      productGroup,
      productWeight,
      dimension,
      description,
      item,
      tax,
      faq,
      video,
      callScript,
    } = req.body;

    let idToBeSearch = req.params.id;

    //------------------Find data-------------------
    let datafound = await productService.getOneByMultiField({
      _id: idToBeSearch,
    });
    if (!datafound) {
      throw new ApiError(httpStatus.OK, `Product not found.`);
    }

    let dataUpdated = await productService.getOneAndUpdate(
      {
        _id: idToBeSearch,
        isDeleted: false,
      },
      {
        $set: {
          ...req.body,
        },
      }
    );

    if (dataUpdated) {
      return res.status(httpStatus.CREATED).send({
        message: "Updated successfully.",
        data: dataUpdated,
        status: true,
        code: null,
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
    let numberFileds = [
      "productCode",
      "productName",
      "productCategory",
      "productSubCategory",
      "productGroup",
      "description",
    ];

    const filterQuery = getFilterQuery(filterBy, booleanFields, numberFileds);
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
          from: "productcategories",
          localField: "productCategory",
          foreignField: "_id",
          as: "productCategory_name",
          pipeline: [{ $project: { categoryName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "productsubcategories",
          localField: "productSubCategory",
          foreignField: "_id",
          as: "productSubCategory_name",
          pipeline: [{ $project: { subCategoryName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "productgroups",
          localField: "productGroup",
          foreignField: "_id",
          as: "productGroup_name",
          pipeline: [{ $project: { groupName: 1 } }],
        },
      },
      {
        // "tax.taxId": "$tax.taxName",
        $addFields: {
          item: {
            $map: {
              input: "$item",
              as: "itemone",
              in: {
                itemName: "",
                itemId: "$$itemone.itemName",
                itemQuantity: "$$itemone.itemQuantity",
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: "items",
          localField: "item.itemId",
          foreignField: "_id",
          as: "items",
          pipeline: [{ $project: { itemName: 1 } }],
        },
      },
      {
        // "tax.taxId": "$tax.taxName",
        $addFields: {
          tax: {
            $map: {
              input: "$tax",
              as: "taxone",
              in: {
                taxName: "",
                taxId: "$$taxone.taxName",
                taxPercent: "$$taxone.taxPercent",
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: "taxes",
          localField: "tax.taxId",
          foreignField: "_id",
          as: "taxes",
          pipeline: [{ $project: { taxName: 1 } }],
        },
      },

      {
        $addFields: {
          productCategoryLabel: {
            $arrayElemAt: ["$productCategory_name.categoryName", 0],
          },
          productSubCategoryLabel: {
            $arrayElemAt: ["$productSubCategory_name.subCategoryName", 0],
          },
          productGroupLabel: {
            $arrayElemAt: ["$productGroup_name.groupName", 0],
          },

          tax: {
            $map: {
              input: "$tax",
              as: "taxone",
              in: {
                $mergeObjects: [
                  "$$taxone",
                  {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$taxes",
                          as: "taxtwo",
                          cond: {
                            $eq: [
                              { $toString: "$$taxtwo._id" },
                              { $toString: "$$taxone.taxId" },
                            ],
                          },
                        },
                      },
                      0,
                    ],
                  },
                ],
              },
            },
          },
          item: {
            $map: {
              input: "$item",
              as: "itemone",
              in: {
                $mergeObjects: [
                  "$$itemone",
                  {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$items",
                          as: "itemtwo",
                          cond: {
                            $eq: [
                              { $toString: "$$itemtwo._id" },
                              { $toString: "$$itemone.itemId" },
                            ],
                          },
                        },
                      },
                      0,
                    ],
                  },
                ],
              },
            },
          },
        },
      },
      {
        $unset: [
          "taxes",
          "items",
          "productGroup_name",
          "productSubCategory_name",
          "productCategory_name",
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
    let dataFound = await productService.aggregateQuery(finalAggregateQuery);
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

    let result = await productService.aggregateQuery(finalAggregateQuery);
    if (result.length) {
      return res.status(httpStatus.OK).send({
        data: result,
        totalPage: totalpages,
        status: true,
        currentPage: page,
        totalItem: totalData,
        pageSize: limit,
        message: "Data Found",
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
    //if no default query then pass {}
    let matchQuery = { isDeleted: false };
    if (req.query && Object.keys(req.query).length) {
      matchQuery = getQuery(matchQuery, req.query);
    }
    let additionalQuery = [
      { $match: matchQuery },
      {
        $lookup: {
          from: "productcategories",
          localField: "productCategory",
          foreignField: "_id",
          as: "productCategory_name",
          pipeline: [{ $project: { categoryName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "productsubcategories",
          localField: "productSubCategory",
          foreignField: "_id",
          as: "productSubCategory_name",
          pipeline: [{ $project: { subCategoryName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "productgroups",
          localField: "productGroup",
          foreignField: "_id",
          as: "productGroup_name",
          pipeline: [{ $project: { groupName: 1 } }],
        },
      },
      {
        // "tax.taxId": "$tax.taxName",
        $addFields: {
          item: {
            $map: {
              input: "$item",
              as: "itemone",
              in: {
                itemName: "",
                itemId: "$$itemone.itemName",
                itemQuantity: "$$itemone.itemQuantity",
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: "items",
          localField: "item.itemId",
          foreignField: "_id",
          as: "items",
          pipeline: [{ $project: { itemName: 1 } }],
        },
      },
      {
        // "tax.taxId": "$tax.taxName",
        $addFields: {
          tax: {
            $map: {
              input: "$tax",
              as: "taxone",
              in: {
                taxName: "",
                taxId: "$$taxone.taxName",
                taxPercent: "$$taxone.taxPercent",
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: "taxes",
          localField: "tax.taxId",
          foreignField: "_id",
          as: "taxes",
          pipeline: [{ $project: { taxName: 1 } }],
        },
      },

      {
        $addFields: {
          productCategoryLabel: {
            $arrayElemAt: ["$productCategory_name.categoryName", 0],
          },
          productSubCategoryLabel: {
            $arrayElemAt: ["$productSubCategory_name.subCategoryName", 0],
          },
          productGroupLabel: {
            $arrayElemAt: ["$productGroup_name.groupName", 0],
          },

          tax: {
            $map: {
              input: "$tax",
              as: "taxone",
              in: {
                $mergeObjects: [
                  "$$taxone",
                  {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$taxes",
                          as: "taxtwo",
                          cond: {
                            $eq: [
                              { $toString: "$$taxtwo._id" },
                              { $toString: "$$taxone.taxId" },
                            ],
                          },
                        },
                      },
                      0,
                    ],
                  },
                ],
              },
            },
          },
          item: {
            $map: {
              input: "$item",
              as: "itemone",
              in: {
                $mergeObjects: [
                  "$$itemone",
                  {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$items",
                          as: "itemtwo",
                          cond: {
                            $eq: [
                              { $toString: "$$itemtwo._id" },
                              { $toString: "$$itemone.itemId" },
                            ],
                          },
                        },
                      },
                      0,
                    ],
                  },
                ],
              },
            },
          },
        },
      },
      {
        $unset: [
          "taxes",
          "items",
          "productGroup_name",
          "productSubCategory_name",
          "productCategory_name",
        ],
      },
    ];
    let dataExist = await productService.aggregateQuery(additionalQuery);

    if (!dataExist || !dataExist.length) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successfull.",
        status: true,
        data: dataExist,
        code: null,
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
    let idToBeSearch = req.params.id;

    let additionalQuery = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(idToBeSearch),
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: "productcategories",
          localField: "productCategory",
          foreignField: "_id",
          as: "productCategory_name",
          pipeline: [{ $project: { categoryName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "productsubcategories",
          localField: "productSubCategory",
          foreignField: "_id",
          as: "productSubCategory_name",
          pipeline: [{ $project: { subCategoryName: 1 } }],
        },
      },
      {
        $lookup: {
          from: "productgroups",
          localField: "productGroup",
          foreignField: "_id",
          as: "productGroup_name",
          pipeline: [{ $project: { groupName: 1 } }],
        },
      },
      {
        // "tax.taxId": "$tax.taxName",
        $addFields: {
          item: {
            $map: {
              input: "$item",
              as: "itemone",
              in: {
                itemName: "",
                itemId: "$$itemone.itemName",
                itemQuantity: "$$itemone.itemQuantity",
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: "items",
          localField: "item.itemId",
          foreignField: "_id",
          as: "items",
          pipeline: [{ $project: { itemName: 1 } }],
        },
      },
      {
        // "tax.taxId": "$tax.taxName",
        $addFields: {
          tax: {
            $map: {
              input: "$tax",
              as: "taxone",
              in: {
                taxName: "",
                taxId: "$$taxone.taxName",
                taxPercent: "$$taxone.taxPercent",
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: "taxes",
          localField: "tax.taxId",
          foreignField: "_id",
          as: "taxes",
          pipeline: [{ $project: { taxName: 1 } }],
        },
      },

      {
        $addFields: {
          productCategoryLabel: {
            $arrayElemAt: ["$productCategory_name.categoryName", 0],
          },
          productSubCategoryLabel: {
            $arrayElemAt: ["$productSubCategory_name.subCategoryName", 0],
          },
          productGroupLabel: {
            $arrayElemAt: ["$productGroup_name.groupName", 0],
          },

          tax: {
            $map: {
              input: "$tax",
              as: "taxone",
              in: {
                $mergeObjects: [
                  "$$taxone",
                  {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$taxes",
                          as: "taxtwo",
                          cond: {
                            $eq: [
                              { $toString: "$$taxtwo._id" },
                              { $toString: "$$taxone.taxId" },
                            ],
                          },
                        },
                      },
                      0,
                    ],
                  },
                ],
              },
            },
          },
          item: {
            $map: {
              input: "$item",
              as: "itemone",
              in: {
                $mergeObjects: [
                  "$$itemone",
                  {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$items",
                          as: "itemtwo",
                          cond: {
                            $eq: [
                              { $toString: "$$itemtwo._id" },
                              { $toString: "$$itemone.itemId" },
                            ],
                          },
                        },
                      },
                      0,
                    ],
                  },
                ],
              },
            },
          },
        },
      },
      {
        $unset: [
          "taxes",
          "items",
          "productGroup_name",
          "productSubCategory_name",
          "productCategory_name",
        ],
      },
    ];
    let dataExist = await productService.aggregateQuery(additionalQuery);
    if (!dataExist.length) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    } else {
      return res.status(httpStatus.OK).send({
        message: "Successfull.",
        status: true,
        data: dataExist[0],
        code: null,
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
    let _id = req.params.id;
    if (!(await productService.getOneByMultiField({ _id }))) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let deleted = await productService.getOneAndDelete({ _id });
    if (!deleted) {
      throw new ApiError(httpStatus.OK, "Some thing went wrong.");
    }
    return res.status(httpStatus.OK).send({
      message: "Successfull.",
      status: true,
      data: null,
      code: null,
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
    let dataExist = await productService.getOneByMultiField({ _id });
    if (!dataExist) {
      throw new ApiError(httpStatus.OK, "Data not found.");
    }
    let isActive = dataExist.isActive ? false : true;

    let statusChanged = await productService.getOneAndUpdate(
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
      code: null,
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
