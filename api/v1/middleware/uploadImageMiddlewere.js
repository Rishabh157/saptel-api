const moment = require('moment')
const { uploadFileS3 } = require('../middleware/S3UploadImage')
const { promises: Fs } = require('fs')
const { imageMimetype } = require('../middleware/validation')
const config = require('../../../config/config')
const logger = require('../../../config/logger')

const uploadImageFunction = async (fileData, fieldName, routeData) => {
  try {
    let isUploaded = false
    let imageUrl = ''
    let path_array = fileData.path.split('.')
    let image_name = `${fieldName}_${fileData.fieldname}_image_${moment(
      new Date()
    )
      .utcOffset('+05:30')
      .format('YMMDDHHmmss')}.${
      path_array[path_array.length - 1]
    }`.toLowerCase()
    let result = await uploadFileS3(
      fileData.path,
      `${config.project}/${routeData}/${image_name}`.toLowerCase(),
      path_array[path_array.length - 1]
    )

    imageUrl = result
    isUploaded = imageUrl !== '' ? true : false
    if (result) {
      try {
        let unlinked = await Fs.unlink(fileData.path)
      } catch (e) {
        //todo: to check file unlink worked. Do not remove console.
        logger.info("Could'nt unlink file.")
      }
    }

    return {
      isUploaded: isUploaded,
      imageUrl: imageUrl
    }
  } catch (err) {
    return {
      isUploaded: false,
      imageUrl: ''
    }
  }
}

exports.uploadImage = async fieldName => {
  return async (req, res, next) => {
    try {
      if (
        req.files &&
        Object.keys(req.files).length !== null &&
        Object.keys(req.files).length !== 0 &&
        Object.keys(req.files) !== []
      ) {
        if (req.body.errorFiles === undefined) {
          req.body.errorFiles = []
        }
        let imageObject = {}
        let isError = true
        let errMsg = 'No file found'
        var folder_name = req.baseUrl.replace('/', '')

        let imageTitle = req.body[fieldName].replace(' ', '')

        if (
          Object.keys(req.files).length !== null &&
          Object.keys(req.files).length !== 0 &&
          Object.keys(req.files) !== [] &&
          req.body.errorFiles.length === 0
        ) {
          for (let field in req.files) {
            if (Array.isArray(req.files[field])) {
              if (req.files[field].length) {
                for (let each in req.files[field]) {
                  let fileData = req.files[field][each]
                  if (!imageMimetype.includes(fileData.mimetype)) {
                    isError = true
                    errMsg = `File extension for ${fieldName} is not valid. Only images are allowed.`
                  }

                  let imageUploadedData = await uploadImageFunction(
                    fileData,
                    imageTitle,
                    folder_name
                  )

                  if (imageUploadedData.isUploaded) {
                    isError = false
                    errMsg = ''
                    // imageObject.push([fileData.fieldname] = imageUploadedData.imageUrl)
                    if (imageObject.hasOwnProperty([fileData.fieldname])) {
                      if (typeof imageObject[fileData.fieldname] === 'string') {
                        imageObject[fileData.fieldname] =
                          imageObject[fileData.fieldname].split(',')
                        imageObject[fileData.fieldname].push(
                          imageUploadedData.imageUrl
                        )
                      }
                    } else {
                      imageObject[fileData.fieldname] =
                        imageUploadedData.imageUrl
                    }
                    // imageObject[fileData.fieldname] = imageObject.hasOwnProperty([fileData.fieldname]) ? imageObject[fileData.fieldname].split(',').push(imageUploadedData.imageUrl) : imageUploadedData.imageUrl
                    // req.body[fileData.fieldname] = imageUploadedData.imageUrl
                  } else {
                    isError = true
                    errMsg = `Something went wrong with the file for ${fileData.fieldname}.`
                  }
                }
              }
            } else {
              if (
                !Array.isArray(req.files[field]) &&
                typeof req.files[field] === 'object'
              ) {
                let fileData = req.files[field]
                if (!imageMimetype.includes(fileData.mimetype)) {
                  isError = true
                  errMsg = `File extension for ${fileData.fieldname} is not valid. Only images are allowed.`
                }
                let imageUploadedData = await uploadImageFunction(
                  fileData,
                  imageTitle,
                  routeData
                )
                if (imageUploadedData.isUploaded) {
                  isError = false
                  errMsg = ''
                  // imageObject.push([fileData.fieldname] = imageUploadedData.imageUrl)
                  if (imageObject.hasOwnProperty([fileData.fieldname])) {
                    if (typeof imageObject[fileData.fieldname] === 'string') {
                      imageObject[fileData.fieldname] =
                        imageObject[fileData.fieldname].split(',')
                      imageObject[fileData.fieldname].push(
                        imageUploadedData.imageUrl
                      )
                    }
                  } else {
                    imageObject[fileData.fieldname] = imageUploadedData.imageUrl
                  }

                  // req.body[fileData.fieldname] = imageUploadedData.imageUrl
                } else {
                  isError = true
                  errMsg = `Something went wrong with the file for ${fileData.fieldname}.`
                }
              }
            }
          }
          for (let each in imageObject) {
            req.body[each] = imageObject[each]
          }
        }

        if (isError) {
          return res.status(200).send({
            message: errMsg,
            status: false
          })
        }

        next()
      } else {
        next()
      }

      // return { imageData: imageObject, errStatus: isError, errMsg: errMsg }
    } catch (err) {
      return res.status(200).send({
        message: `Something went wrong with the image ${fieldName}.`,
        status: false
      })
      // return { imageData: [], errStatus: true, errMsg: "" }
    }
  }
}

// exports.uploadImageCall = ()
