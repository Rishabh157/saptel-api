const config = require('../../../../config/config')
const logger = require('../../../../config/logger')
const httpStatus = require('http-status')
const ApiError = require('../../../utils/apiErrorUtils')
const { userEnum } = require('../../helper/enumUtils')
const fileManagerService = require('./FileManagerService')
const { searchKeys, allFields } = require('./FileManagerSchema')
const errorRes = require('../../../utils/resError')
const { getQuery } = require('../../helper/utils')
const { unlinkfile } = require('../../helper/fileUnlinkHelper')
const {
  getSearchQuery,
  checkInvalidParams,
  getRangeQuery,
  getFilterQuery,
  getDateFilterQuery,
  getLimitAndTotalCount,
  getOrderByAndItsValue
} = require('../../helper/paginationFilterHelper')

/**
 * add start
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.add = async (req, res) => {
  try {
    req.body = JSON.parse(JSON.stringify(req.body))
    let { fileType, fileUrl, category } = req.body

    if (req.body.fileUrl === '') {
      throw new ApiError(
        httpStatus.NOT_IMPLEMENTED,
        'Something went wrong with the file, unable to upload. Please try again.'
      )
    }

    /**
     * todo: store images on local
     */
    console.log(req.body.fileUrl, 'req.body.fileUrl')
    let path_array = req.body.fileUrl.split('public')
    let filePath = `${config.base_url}public${path_array[path_array.length - 1]
      }`
    req.body.fileUrl = filePath

    /**
     * check duplicate exist
     */
    // let dataExist = await fileManagerService.isExists([{ email }, { mobile }])
    // if (dataExist.exists && dataExist.existsSummary) {
    //   throw new ApiError(httpStatus.OK, dataExist.existsSummary)
    // }
    //------------------create data-------------------
    let dataCreated = await fileManagerService.createNewData({ ...req.body })

    if (dataCreated) {
      return res.status(httpStatus.CREATED).send({
        message: `Successfull`,
        data: dataCreated,
        status: true,
        code: "OK",
        issue: null
      })
    } else {
      throw new ApiError(httpStatus.NOT_IMPLEMENTED, `Something went wrong.`)
    }
  } catch (err) {
    console.log(err)
    let errData = errorRes(err)
    logger.info(errData.resData)
    let { message, status, data, code, issue } = errData.resData
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue })
  }
}

/**
 * update start
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.update = async (req, res) => {
  try {
    req.body = JSON.parse(JSON.stringify(req.body))
    let { fileType, fileUrl, category } = req.body
    let id = req.params.id

    if (req.body.fileUrl === '') {
      throw new ApiError(
        httpStatus.NOT_IMPLEMENTED,
        'Something went wrong with the file, unable to upload. Please try again.'
      )
    }

    /**
     * todo: store images on local
     */
    console.log(req.body.fileUrl, 'req.body.fileUrl')
    let path_array = req.body.fileUrl.split('public')
    let filePath = `${config.base_url}public${path_array[path_array.length - 1]
      }`
    req.body.fileUrl = filePath

    //------------------Find data-------------------
    let datafound = await fileManagerService.getOneByMultiField({
      _id: id
    })
    if (!datafound) {
      throw new ApiError(httpStatus.OK, `User not found.`)
    }

    let dataUpdated = await fileManagerService.getOneAndUpdate(
      {
        _id: id,
        isDeleted: false
      },
      {
        $set: {
          ...req.body
        }
      }
    )

    if (dataUpdated) {
      return res.status(httpStatus.CREATED).send({
        message: `Successfull`,
        data: dataUpdated,
        status: true,
        code: "OK",
        issue: null
      })
    } else {
      throw new ApiError(httpStatus.NOT_IMPLEMENTED, `Something went wrong.`)
    }
  } catch (err) {
    let errData = errorRes(err)
    logger.info(errData.resData)
    let { message, status, data, code, issue } = errData.resData
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue })
  }
}

/**
 *  all filter pagination api
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.allFilterPagination = async (req, res) => {
  try {
    var dateFilter = req.body.dateFilter
    let searchValue = req.body.searchValue
    let searchIn = req.body.params
    let filterBy = req.body.filterBy
    let rangeFilterBy = req.body.rangeFilterBy
    let isPaginationRequired = req.body.isPaginationRequired
      ? req.body.isPaginationRequired
      : true
    let finalAggregateQuery = []
    let matchQuery = {
      $and: [{ isDeleted: false }]
    }
    /**
     * to send only active data on web
     */
    if (req.userData.userType === userEnum.user) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        `You do not have authority to access this.`
      )
    }

    let { orderBy, orderByValue } = getOrderByAndItsValue(
      req.body.orderBy,
      req.body.orderByValue
    )

    //----------------------------

    /**
     * check search keys valid
     **/
    console.log(searchKeys, allFields)
    let searchQueryCheck = checkInvalidParams(searchIn, searchKeys)

    if (searchQueryCheck && !searchQueryCheck.status) {
      return res.status(httpStatus.OK).send({
        ...searchQueryCheck
      })
    }
    /**
     * get searchQuery
     */
    const searchQuery = getSearchQuery(searchIn, searchKeys, searchValue)
    if (searchQuery && searchQuery.length) {
      matchQuery.$and.push({ $or: searchQuery })
    }
    //----------------------------
    /**
     * get range filter query
     */
    const rangeQuery = getRangeQuery(rangeFilterBy)
    if (rangeQuery && rangeQuery.length) {
      matchQuery.$and.push(...rangeQuery)
    }

    //----------------------------
    /**
     * get filter query
     */
    let booleanFields = ['isActive']
    let numberFileds = []
    const filterQuery = getFilterQuery(filterBy, booleanFields, numberFileds)
    if (filterQuery && filterQuery.length) {
      matchQuery.$and.push(...filterQuery)
    }
    //----------------------------
    //calander filter
    /**
     * ToDo : for date filter
     */

    let allowedDateFiletrKeys = ['createdAt', 'updatedAt']

    const datefilterQuery = await getDateFilterQuery(
      dateFilter,
      allowedDateFiletrKeys
    )
    if (datefilterQuery && datefilterQuery.length) {
      matchQuery.$and.push(...datefilterQuery)
    }

    //calander filter
    //----------------------------

    /**
     * for lookups , project , addfields or group in aggregate pipeline form dynamic quer in additionalQuery array
     */
    let additionalQuery = []

    if (additionalQuery.length) {
      finalAggregateQuery.push(...additionalQuery)
    }

    finalAggregateQuery.push({
      $match: matchQuery
    })

    //-----------------------------------
    let dataFound = await fileManagerService.aggregateQuery(finalAggregateQuery)
    if (dataFound.length === 0) {
      throw new ApiError(httpStatus.OK, `No data Found`)
    }

    let { limit, page, totalData, skip, totalpages } =
      await getLimitAndTotalCount(
        req.body.limit,
        req.body.page,
        dataFound.length,
        req.body.isPaginationRequired
      )

    finalAggregateQuery.push({ $sort: { [orderBy]: parseInt(orderByValue) } })
    if (isPaginationRequired) {
      finalAggregateQuery.push({ $skip: skip })
      finalAggregateQuery.push({ $limit: limit })
    }

    let result = await fileManagerService.aggregateQuery(finalAggregateQuery)
    if (result.length) {
      return res.status(httpStatus.OK).send({
        data: result,
        totalPage: totalpages,
        status: true,
        currentPage: page,
        totalItem: totalData,
        pageSize: limit,
        message: 'Data Found'
      })
    } else {
      throw new ApiError(httpStatus.OK, `No data Found`)
    }
  } catch (err) {
    console.log(err)
    let errData = errorRes(err)
    logger.info(errData.resData)
    let { message, status, data, code, issue } = errData.resData
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue })
  }
}

/**
 * get api
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.get = async (req, res) => {
  try {
    //if no default query then pass {}

    let matchQuery = { isDeleted: false }
    if (req.userData.userType === userEnum.user) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        `You do not have authority to access this.`
      )
    }
    if (req.query && Object.keys(req.query).length) {
      matchQuery = getQuery(matchQuery, req.query)
    }

    let dataExist = await fileManagerService.findAllWithQuery(matchQuery)

    if (!dataExist || !dataExist.length) {
      throw new ApiError(httpStatus.OK, 'Data not found.')
    } else {
      return res.status(httpStatus.OK).send({
        message: 'Successfull.',
        status: true,
        data: dataExist,
        code: "OK",
        issue: null
      })
    }
  } catch (err) {
    let errData = errorRes(err)
    logger.info(errData.resData)
    let { message, status, data, code, issue } = errData.resData
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue })
  }
}

/**
 * delete api
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.deleteDocument = async (req, res) => {
  try {
    let _id = req.params.id
    if (req.userData.userType === userEnum.user) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        `You do not have authority to access this.`
      )
    }
    let dataExist = await fileManagerService.getOneByMultiField({ _id })

    if (!dataExist) {
      throw new ApiError(httpStatus.OK, 'Data not found.')
    }
    let { fileUrl } = dataExist
    fileUrl = fileUrl.replace(config.base_url, '')

    let deleted = await fileManagerService.getOneAndDelete({ _id })
    if (!deleted) {
      throw new ApiError(httpStatus.OK, 'Some thing went wrong.')
    }

    let unlinkedFile = await unlinkfile(fileUrl)
    logger.info(
      `file unlink status ${unlinkedFile.status}, message: ${unlinkedFile.message}`
    )
    return res.status(httpStatus.OK).send({
      message: 'Successfull.',
      status: true,
      data: null,
      code: "OK",
      issue: null
    })
  } catch (err) {
    let errData = errorRes(err)
    logger.info(errData.resData)
    let { message, status, data, code, issue } = errData.resData
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue })
  }
}

/**
 * statusChange
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.statusChange = async (req, res) => {
  try {
    let _id = req.params.id
    if (req.userData.userType === userEnum.user) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        `You do not have authority to access this.`
      )
    }
    let dataExist = await fileManagerService.getOneByMultiField({ _id })
    if (!dataExist) {
      throw new ApiError(httpStatus.OK, 'Data not found.')
    }
    let isActive = dataExist.isActive ? false : true

    let statusChanged = await fileManagerService.getOneAndUpdate(
      { _id },
      { isActive }
    )
    if (!statusChanged) {
      throw new ApiError(httpStatus.OK, 'Some thing went wrong.')
    }
    return res.status(httpStatus.OK).send({
      message: 'Successfull.',
      status: true,
      data: statusChanged,
      code: "OK",
      issue: null
    })
  } catch (err) {
    let errData = errorRes(err)
    logger.info(errData.resData)
    let { message, status, data, code, issue } = errData.resData
    return res
      .status(errData.statusCode)
      .send({ message, status, data, code, issue })
  }
}
