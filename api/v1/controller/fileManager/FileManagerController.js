const httpStatus = require('http-status')
const ApiError = require('../../utils/ApiError')
const fileManagerServices = require('../../services/FileManagerService')
const moment = require('moment')
const config = require('../../../../config/config')
//-------------------------------------------------
// add fileManager start
exports.add = async function (req, res) {
  try {
    req.body = JSON.parse(JSON.stringify(req.body))

    if (req.body.fileUrl === '') {
      throw new ApiError(
        httpStatus.NOT_IMPLEMENTED,
        'Something went wrong with the file, unable to upload. Please try again.'
      )
    }

    /**
     * todo: store images on local
     */
    let path_array = req.body.fileUrl.split('public')
    let filePath = `${config.base_url}public${
      path_array[path_array.length - 1]
    }`
    req.body.fileUrl = filePath

    let dataCreated = await fileManagerServices.createNewData(req.body)
    if (dataCreated) {
      return res.status(httpStatus.CREATED).send({
        message: 'Data Added Successfully.',
        data: dataCreated,
        status: true
      })
    } else {
      throw new ApiError(httpStatus.NOT_IMPLEMENTED, `Something went wrong.`)
    }
  } catch (err) {
    let msg = []
    let i = 1
    let error_msg = ''
    let statusCode =
      err.statusCode !== undefined && err.statusCode !== null
        ? err.statusCode
        : 500

    if (!err.message) {
      for (let key in err.errors) {
        if (err.errors[key].message) {
          error_msg += i + '.' + err.errors[key].message
          i++
        }
      }
    } else {
      error_msg = err.message
    }
    return res.status(statusCode).send({
      message: error_msg,
      status: false
    })
  }
}
// add fileManager start

//-------------------------------------------------
//update fileManager start
exports.update = async function (req, res) {
  try {
    const id = req.params.id
    if (
      !(await fileManagerServices.getOneByMultiField({
        _id: id,
        is_deleted: false
      }))
    ) {
      throw new ApiError(httpStatus.OK, `File not found`)
    }

    if (req.body.fileUrl === '') {
      throw new ApiError(
        httpStatus.NOT_IMPLEMENTED,
        'Something went wrong with the file, unable to upload. Please try again.'
      )
    }
    /**
     * getAWSUploadedFileUrl takes following parameters
     * filePath(local file url path)
     * file name
     * file type(document or image)
     * folder name(generally base url )
     */
    let folder_name = req.baseUrl.replace('/', '')

    let uploadedFileUrlData = await getAWSUploadedFileUrl(
      req.body.category,
      req.body.fileUrl,
      req.body.fileTitle,
      req.body.fileType,
      folder_name
    )
    if (!uploadedFileUrlData.isUploaded) {
      throw new ApiError(
        httpStatus.NOT_IMPLEMENTED,
        'Something went wrong with the file, unable to upload. Please try again.'
      )
    } else {
      req.body.fileUrl = uploadedFileUrlData.fileUrl
    }

    let dataUpdated = await fileManagerServices.getByIdAndUpdate(id, req.body)
    if (dataUpdated) {
      return res.status(httpStatus.OK).send({
        message: 'Updated successfully',
        data: dataUpdated,
        status: true
      })
    } else {
      throw new ApiError(httpStatus.NOT_IMPLEMENTED, `Something went wrong.`)
    }
  } catch (err) {
    let msg = []
    let i = 1
    let error_msg = ''
    let statusCode =
      err.statusCode !== undefined && err.statusCode !== null
        ? err.statusCode
        : 500

    if (!err.message) {
      for (let key in err.errors) {
        if (err.errors[key].message) {
          error_msg += i + '.' + err.errors[key].message
          i++
        }
      }
    } else {
      error_msg = err.message
    }
    return res.status(statusCode).send({
      message: error_msg,
      status: false
    })
  }
}
//update fileManager end
//-------------------------------------------------

//change Active status start
exports.changeActiveStatus = async function (req, res) {
  try {
    let id = req.params.id

    let dataFound = await fileManagerServices.getOneByMultiField({
      _id: id,
      is_deleted: false
    })

    if (!dataFound) {
      throw new ApiError(httpStatus.OK, `File not found`)
    }

    let activeStatus = dataFound.is_active === true ? false : true
    let statusValue = activeStatus === true ? 'ACTIVE' : 'DEACTIVE'
    let dataUpdated = await fileManagerServices.getByIdAndUpdate(id, {
      is_active: activeStatus
    })

    if (dataUpdated && dataUpdated.is_active === activeStatus) {
      return res.status(httpStatus.OK).send({
        message: `Status changed to ${statusValue} successfully. `,
        status: true
      })
    } else {
      throw new ApiError(httpStatus.NOT_IMPLEMENTED, `Something went wrong.`)
    }
  } catch (err) {
    let msg = []
    let i = 1
    let error_msg = ''

    let statusCode =
      err.statusCode !== undefined && err.statusCode !== null
        ? err.statusCode
        : 500

    if (!err.message) {
      for (let key in err.errors) {
        if (err.errors[key].message) {
          error_msg += i + '.' + err.errors[key].message
          i++
        }
      }
    } else {
      error_msg = err.message
    }
    return res.status(statusCode).send({
      message: error_msg,
      status: false
    })
  }
}
//change Active status ens

//-------------------------------------------------

//allWithFilters
exports.allWithFilters = async (req, res) => {
  try {
    let limit = req.body.limit
    let page = req.body.page
    var orderBy = req.body.orderBy
    var orderByValue = req.body.orderByValue
    var dateFilter = req.body.dateFilter
    let searchValue = req.body.searchValue
    let searchIn = req.body.params
    let filterBy = req.body.filterBy
    let rangeFilterBy = req.body.rangeFilterBy
    let isPaginationRequired = req.body.isPaginationRequired
      ? req.body.isPaginationRequired
      : true

    const searchKeys = [
      'category',
      'fileType',
      'fileTitle',
      'fileUrl',
      'isActive'
    ]

    let query = []
    let matchQuery = {
      $and: [{ is_deleted: false }]
    }

    /**
     * to send only active data on web
     */
    //   if (req.path.includes('/web/') || req.path.includes('/web')) {
    //      matchQuery.$and.push({ is_active: true })
    //   }

    limit = parseInt(limit)
    page = parseInt(page)

    if (limit === undefined || !limit || limit < 1 || Math.sign(limit) === -1) {
      limit = 10
    }

    if (page === undefined || !page || page < 1 || Math.sign(page) === -1) {
      page = 1
    }

    if (
      orderBy === undefined ||
      orderBy === '' ||
      typeof orderBy !== 'string'
    ) {
      orderBy = 'createdAt'
    }

    if (
      orderByValue === undefined ||
      orderByValue === '' ||
      isNaN(parseInt(orderByValue))
    ) {
      orderByValue = -1
    }

    let skip = page * limit - limit

    //check search keys valid

    if (searchIn === undefined) {
      searchIn = []
    } else if (!Array.isArray(searchIn)) {
      throw new ApiError(httpStatus.OK, `params must be an array`)
    } else if (searchIn.length) {
      for (let key in searchIn) {
        if (searchIn[key] === '') {
          throw new ApiError(httpStatus.OK, `params key should not be blank`)
        }

        if (!searchKeys.includes(searchIn[key])) {
          throw new ApiError(
            httpStatus.OK,
            `params ${searchIn[key]} key does not exist.`
          )
        }
      }
    }
    //check search keys valid
    //----------------------------
    //searchQuery
    let searchQuery = []

    if (
      searchValue !== undefined &&
      searchValue !== '' &&
      searchValue !== null
    ) {
      let value = { $regex: `.*${searchValue}.*`, $options: 'i' }
      for (let each in searchKeys) {
        let key = searchKeys[each]
        let val = value
        searchQuery.push({ [key]: val })
      }
    }
    //searchQuery
    //----------------------------

    // rangeFilterBy
    if (
      rangeFilterBy !== undefined &&
      rangeFilterBy !== null &&
      rangeFilterBy !== {} &&
      typeof rangeFilterBy === 'object'
    ) {
      if (
        rangeFilterBy.rangeFilterKey !== undefined &&
        rangeFilterBy.rangeFilterKey !== '' &&
        rangeFilterBy.rangeFilterKey !== null &&
        typeof rangeFilterBy.rangeFilterKey === 'string'
      ) {
        if (
          rangeFilterBy.rangeInitial !== undefined &&
          rangeFilterBy.rangeInitial !== '' &&
          rangeFilterBy.rangeInitial !== null &&
          !isNaN(parseFloat(rangeFilterBy.rangeInitial))
        ) {
          if (
            rangeFilterBy.rangeEnd !== undefined &&
            rangeFilterBy.rangeEnd !== '' &&
            rangeFilterBy.rangeEnd !== null &&
            !isNaN(parseFloat(rangeFilterBy.rangeEnd))
          ) {
            filterQuery.push({
              [`${rangeFilterBy.rangeFilterKey}`]: {
                $gte: rangeFilterBy.rangeInitial
              }
            })
            filterQuery.push({
              [`${rangeFilterBy.rangeFilterKey}`]: {
                $lte: rangeFilterBy.rangeEnd
              }
            })
          }
        }
      }
    }

    //----------------------------
    let invalidData = ['null', null, undefined, 'undefined', '']
    let booleanFields = ['isActive']
    let numberFileds = []
    let filterQuery = []
    if (filterBy !== undefined) {
      if (!Array.isArray(filterBy)) {
        throw new ApiError(httpStatus.OK, `filterBy must be an array.`)
      }
      if (filterBy.length > 0) {
        for (let each in filterBy) {
          if (!invalidData.includes(filterBy[each].fieldName)) {
            if (Array.isArray(filterBy[each].value)) {
              if (filterBy[each].value.length) {
                filterQuery.push({
                  [filterBy[each].fieldName]: { $in: filterBy[each].value }
                })
              }
            } else if (filterBy[each].value !== '') {
              if (
                typeof filterBy[each].value === 'string' &&
                !booleanFields.includes(filterBy[each].fieldName)
              ) {
                filterQuery.push({
                  [filterBy[each].fieldName]: filterBy[each].value
                })
              } else if (
                numberFileds.includes(filterBy[each].fieldName) &&
                !isNaN(parseInt(filterBy[each].value))
              ) {
                filterQuery.push({
                  [filterBy[each].fieldName]: parseInt(filterBy[each].value)
                })
              } else if (
                typeof filterBy[each].value === 'boolean' ||
                booleanFields.includes(filterBy[each].fieldName)
              ) {
                filterQuery.push({
                  [filterBy[each].fieldName]:
                    filterBy[each].value === true ||
                    filterBy[each].value === 'true'
                      ? true
                      : false
                })
              }
            }
          }
        }
      }
    }
    //----------------------------
    //----------------------------
    //calander filter
    /**
     *
     * ToDo : for date filter
     *
     */

    let allowedDateFiletrKeys = ['createdAt', 'updatedAt']
    if (
      dateFilter !== undefined &&
      dateFilter !== null &&
      Object.keys(dateFilter).length
    ) {
      if (
        dateFilter.dateFilterKey !== undefined &&
        dateFilter.dateFilterKey !== ''
      ) {
        if (!allowedDateFiletrKeys.includes(dateFilter.dateFilterKey)) {
          throw new ApiError(
            httpStatus.NOT_IMPLEMENTED,
            `Date filter key is invalid.`
          )
        }
      } else {
        dateFilter.dateFilterKey = 'createdAt'
      }
      if (
        dateFilter.startDate !== undefined &&
        dateFilter.startDate !== '' &&
        (dateFilter.endDate === undefined || dateFilter.endDate === '')
      ) {
        dateFilter.endDate = dateFilter.startDate
      } else if (
        dateFilter.endDate !== undefined &&
        dateFilter.endDate !== '' &&
        (dateFilter.startDate === undefined || dateFilter.startDate === '')
      ) {
        dateFilter.startDate = dateFilter.endDate
      }
      if (dateFilter.startDate !== '' && dateFilter.endDate !== '') {
        dateFilter.startDate = new Date(`${dateFilter.startDate}`)
        dateFilter.endDate = new Date(`${dateFilter.endDate}`)
        dateFilter.startDate.setHours(0, 0, 0, 0)
        dateFilter.endDate.setHours(23, 59, 59, 999)

        filterQuery.push({
          $expr: {
            $and: [
              {
                $gte: [
                  {
                    $convert: {
                      input: `$${dateFilter.dateFilterKey}`,
                      to: 'date'
                    }
                  },
                  new Date(`${dateFilter.startDate}`)
                ]
              },
              {
                $lte: [
                  {
                    $convert: {
                      input: `$${dateFilter.dateFilterKey}`,
                      to: 'date'
                    }
                  },
                  new Date(`${dateFilter.endDate}`)
                ]
              }
            ]
          }
        })
      }
    }

    //calander filter
    //----------------------------

    //search query-----------

    if (searchQuery.length > 0) {
      matchQuery.$and.push({ $or: searchQuery })
    }

    //search query-----------
    //----------------for filter

    if (filterQuery.length > 0) {
      for (let each in filterQuery) {
        matchQuery.$and.push(filterQuery[each])
      }
    }
    let countQuery = []
    let additionaQuery = [
      {
        $addFields: {
          createdAt: {
            $convert: {
              input: {
                $dateToString: {
                  format: '%Y-%m-%dT%H:%M:%S.%LZ',
                  date: '$createdAt'
                }
              },
              to: 'date'
            }
          },
          updatedAt: {
            $convert: {
              input: {
                $dateToString: {
                  format: '%Y-%m-%dT%H:%M:%S.%LZ',
                  date: '$updatedAt'
                }
              },
              to: 'date'
            }
          }
        }
      }
    ]

    countQuery.push(...additionaQuery, {
      $match: matchQuery
    })

    //-----------------------------------
    let totalData = 0
    let dataFound = await fileManagerServices.aggregateQuery(countQuery)
    if (dataFound.length === 0) {
      throw new ApiError(httpStatus.OK, `No data Found`)
    }
    totalData = dataFound.length
    let totalpages = 1
    if (isPaginationRequired) {
      totalpages = Math.ceil(totalData / (limit === '' ? totalData : limit))
    } else {
      limit = totalData
    }

    query.push(...additionaQuery, {
      $match: matchQuery
    })

    query.push({ $sort: { [orderBy]: parseInt(orderByValue) } })
    if (isPaginationRequired) {
      query.push({ $skip: skip })
      query.push({ $limit: limit })
    }

    let result = await fileManagerServices.aggregateQuery(query)
    if (result.length) {
      return res.status(200).send({
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
    let msg = []
    let i = 1
    let error_msg = ''
    let statusCode =
      err.statusCode !== undefined && err.statusCode !== null
        ? err.statusCode
        : 500
    if (!err.message) {
      for (let key in err.errors) {
        if (err.errors[key].message) {
          error_msg += i + '.' + err.errors[key].message
          i++
        }
      }
    } else {
      error_msg = err.message
    }
    return res.status(statusCode).send({
      message: error_msg,
      status: false,
      data: null
    })
  }
}

//-------------------------------------------------
//fileManager list start
exports.list = async function (req, res) {
  try {
    let query = { is_deleted: false }
    if (Object.keys(req.body).length) {
      query = { is_deleted: false, ...req.body }
    }
    // const allDataList = await fileManager.find({ is_deleted: false })
    const allDataList = await fileManagerServices.findAllWithQuery(query)
    if (allDataList.length) {
      return res.status(200).send({
        message: 'Data found.',
        status: true,
        data: allDataList
      })
    } else {
      throw new ApiError(httpStatus.OK, `No data Found`)
    }
  } catch (err) {
    let msg = []
    let i = 1
    let error_msg = ''
    let statusCode =
      err.statusCode !== undefined && err.statusCode !== null
        ? err.statusCode
        : 500

    if (!err.message) {
      for (let key in err.errors) {
        if (err.errors[key].message) {
          error_msg += i + '.' + err.errors[key].message
          i++
        }
      }
    } else {
      error_msg = err.message
    }
    return res.status(statusCode).send({
      message: error_msg,
      status: false
    })
  }
}
//fileManager list end
//------------------------------------------------
//delete fileManager start

exports.delete_by_id = async function (req, res) {
  try {
    let id = req.params.id

    let dataFound = await fileManagerServices.getOneByMultiField({
      _id: id,
      is_deleted: false
    })

    if (!dataFound) {
      throw new ApiError(httpStatus.OK, `File not found`)
    } else {
      let dataUpdated = await fileManagerServices.getByIdAndUpdate(id, {
        is_deleted: true
      })
      if (dataUpdated) {
        return res.status(httpStatus.OK).send({
          message: 'Deleted successfully',
          status: true
        })
      } else {
        throw new ApiError(httpStatus.NOT_IMPLEMENTED, `Something went wrong.`)
      }
    }
  } catch (err) {
    let msg = []
    let i = 1
    let error_msg = ''
    let statusCode =
      err.statusCode !== undefined && err.statusCode !== null
        ? err.statusCode
        : 500

    if (!err.message) {
      for (let key in err.errors) {
        if (err.errors[key].message) {
          error_msg += i + '.' + err.errors[key].message
          i++
        }
      }
    } else {
      error_msg = err.message
    }
    return res.status(statusCode).send({
      message: error_msg,
      status: false
    })
  }
}
//delete fileManager end
//------------------------------------------------

//--------------------------------------------------------
//get fileManager's details
exports.view = async function (req, res) {
  try {
    let id = req.params.id

    let dataFound = await fileManagerServices.getOneByMultiField({
      _id: id,
      is_deleted: false
    })
    if (!dataFound) {
      throw new ApiError(httpStatus.OK, `File not found`)
    } else {
      return res.status(httpStatus.OK).send({
        message: 'Data Found.',
        status: true,
        data: dataFound
      })
    }
  } catch (err) {
    let msg = []
    let i = 1
    let error_msg = ''
    let statusCode =
      err.statusCode !== undefined && err.statusCode !== null
        ? err.statusCode
        : 500

    if (!err.message) {
      for (let key in err.errors) {
        if (err.errors[key].message) {
          error_msg += i + '.' + err.errors[key].message
          i++
        }
      }
    } else {
      error_msg = err.message
    }
    return res.status(statusCode).send({
      message: error_msg,
      status: false
    })
  }
}
//--------------------------------------------------------
