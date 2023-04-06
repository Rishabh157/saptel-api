const moment = require("moment");
const { uploadFile2S3 } = require("../middleware/S3UploadImage");
const { promises: Fs } = require("fs");
const path = require("path");
const { documentMimeType, excelMimeType } = require("../middleware/validation");
const config = require('../../../config/config');
const logger = require('../../../config/logger');


const uploadFileFunction = async (fileData, fieldName, routeData) => {
    try {
        let isUploaded = false
        let fileUrl = ""
        let path_array = fileData.path.split(".");
        let file_name = `${fieldName}_${fileData.fieldname}${moment(new Date()).utcOffset("+05:30").format("YMMDDHHmmss")}.${path_array[path_array.length - 1]}`.toLowerCase();
        let result = await uploadFile2S3(
            fileData.path,
            `${config.project}/${routeData}/${file_name}`.toLowerCase(),
            path_array[path_array.length - 1]
        );
        // let new_file_path = path.join(__dirname, '../../../../', 'public', 'uploads', routeData, file_name)



        // try {
        //     let renamed = await Fs.rename(new_file_path, fileData.path)

        // } catch (e) {

        // }

        fileUrl = result;
        isUploaded = fileUrl !== "" ? true : false

        if (result) {
            try {
                let unlinked = await Fs.unlink(fileData.path);
            } catch (e) {
                logger.info("Could'nt unlink file")
            }
        }
        return {
            isUploaded: isUploaded,
            fileUrl: fileUrl
        }

    } catch (err) {
        return {
            isUploaded: false,
            fileUrl: ""
        }
    }

}

exports.uploadFileHelper = async (req, routeData, fieldName, errorFiles) => {
    try {
        let fileObject = {}
        let isError = true
        let errMsg = "Some thing went wrong"

        if (req.files !== null && req.files !== {} && req.files !== [] && errorFiles.length === 0) {

            for (let field in req.files) {

                if (Array.isArray(req.files[field])) {
                    if (req.files[field].length) {
                        for (let each in req.files[field]) {
                            let fileData = req.files[field][each]
                            if (!documentMimeType.includes(fileData.mimetype)) {
                                let unlinked = await Fs.unlink(fileData.path)
                                isError = true
                                errMsg = `File extension for ${fileData.fieldname} is not valid. Only files are allowed.`
                            }
                            let fileUploadedData = await uploadFileFunction(fileData, fieldName, routeData)
                            if (fileUploadedData.isUploaded) {
                                isError = false
                                errMsg = ""
                                // fileObject.push([fileData.fieldname] = fileUploadedData.fileUrl)
                                if (fileObject.hasOwnProperty([fileData.fieldname])) {
                                    if (typeof fileObject[fileData.fieldname] === "string") {
                                        fileObject[fileData.fieldname] = fileObject[fileData.fieldname].split(",")
                                        fileObject[fileData.fieldname].push(fileUploadedData.fileUrl)
                                    }
                                } else {
                                    fileObject[fileData.fieldname] = fileUploadedData.fileUrl
                                }
                                // fileObject[fileData.fieldname] = fileObject.hasOwnProperty([fileData.fieldname]) ? fileObject[fileData.fieldname].split(',').push(fileUploadedData.fileUrl) : fileUploadedData.fileUrl
                                // req.body[fileData.fieldname] = fileUploadedData.fileUrl
                            } else {
                                let unlinked = await Fs.unlink(fileData.path)
                                isError = true
                                errMsg = `Something went wrong with the file for ${fileData.fieldname}.`
                            }
                        }
                    }
                } else {
                    if (!Array.isArray(req.files[field]) && typeof req.files[field] === "object") {
                        let fileData = req.files[field]
                        if (!documentMimeType.includes(fileData.mimetype)) {
                            let unlinked = await Fs.unlink(fileData.path)
                            isError = true
                            errMsg = `File extension for ${fileData.fieldname} is not valid. Only files are allowed.`
                        }
                        let fileUploadedData = await uploadFileFunction(fileData, fieldName, routeData)
                        if (fileUploadedData.isUploaded) {
                            isError = false
                            errMsg = ""
                            // fileObject.push([fileData.fieldname] = fileUploadedData.fileUrl)
                            if (fileObject.hasOwnProperty([fileData.fieldname])) {
                                if (typeof fileObject[fileData.fieldname] === "string") {
                                    fileObject[fileData.fieldname] = fileObject[fileData.fieldname].split(",")
                                    fileObject[fileData.fieldname].push(fileUploadedData.fileUrl)
                                }
                            } else {
                                fileObject[fileData.fieldname] = fileUploadedData.fileUrl
                            }

                            // req.body[fileData.fieldname] = fileUploadedData.fileUrl
                        } else {
                            let unlinked = await Fs.unlink(fileData.path)
                            isError = true
                            errMsg = `Something went wrong with the file for ${fileData.fieldname}.`
                        }
                    }
                }

            }
        }

        for (let each in fileObject) {
            req.body[each] = fileObject[each]
        }
        return { fileData: fileObject, errStatus: isError, errMsg: errMsg }
    } catch (err) {

        return { fileData: [], errStatus: true, errMsg: "" }
    }
}


exports.uploadExcelHelper = async (req, routeData, fieldName, errorFiles) => {
    try {
        let fileObject = {}
        let isError = true
        let errMsg = "Some thing went wrong"

        if (req.files !== undefined && req.files !== null && req.files !== {} && req.files !== [] && Array.isArray(errorFiles)) {
            if (!errorFiles.length === 0) {
                let unlinked = await Fs.unlink(fileData.path)
                isError = true
                errMsg = `File extension for ${fileData.fieldname} is not valid. Only XLSX are allowed.`
            } else {
                for (let field in req.files) {
                    if (Array.isArray(req.files[field])) {
                        if (req.files[field].length) {
                            for (let each in req.files[field]) {
                                let fileData = req.files[field][each]
                                if (!excelMimeType.includes(fileData.mimetype)) {
                                    let unlinked = await Fs.unlink(fileData.path)
                                    isError = true
                                    errMsg = `File extension for ${fileData.fieldname} is not valid. Only XLSX are allowed.`
                                }
                                let fileUploadedData = await uploadFileFunction(fileData, fieldName, routeData)
                                if (fileUploadedData.isUploaded) {
                                    isError = false
                                    errMsg = ""
                                    // fileObject.push([fileData.fieldname] = fileUploadedData.fileUrl)
                                    if (fileObject.hasOwnProperty([fileData.fieldname])) {
                                        if (typeof fileObject[fileData.fieldname] === "string") {
                                            fileObject[fileData.fieldname] = fileObject[fileData.fieldname].split(",")
                                            fileObject[fileData.fieldname].push(fileUploadedData.fileUrl)
                                        }
                                    } else {
                                        fileObject[fileData.fieldname] = fileUploadedData.fileUrl
                                    }
                                    // fileObject[fileData.fieldname] = fileObject.hasOwnProperty([fileData.fieldname]) ? fileObject[fileData.fieldname].split(',').push(fileUploadedData.fileUrl) : fileUploadedData.fileUrl
                                    // req.body[fileData.fieldname] = fileUploadedData.fileUrl
                                } else {
                                    let unlinked = await Fs.unlink(fileData.path)
                                    isError = true
                                    errMsg = `Something went wrong with the file for ${fileData.fieldname}.`
                                }
                            }
                        }
                    } else {
                        if (!Array.isArray(req.files[field]) && typeof req.files[field] === "object") {
                            let fileData = req.files[field]
                            if (!excelMimeType.includes(fileData.mimetype)) {
                                let unlinked = await Fs.unlink(fileData.path)
                                isError = true
                                errMsg = `File extension for ${fileData.fieldname} is not valid. Only files are allowed.`
                            }
                            let fileUploadedData = await uploadFileFunction(fileData, fieldName, routeData)
                            if (fileUploadedData.isUploaded) {
                                isError = false
                                errMsg = ""
                                // fileObject.push([fileData.fieldname] = fileUploadedData.fileUrl)
                                if (fileObject.hasOwnProperty([fileData.fieldname])) {
                                    if (typeof fileObject[fileData.fieldname] === "string") {
                                        fileObject[fileData.fieldname] = fileObject[fileData.fieldname].split(",")
                                        fileObject[fileData.fieldname].push(fileUploadedData.fileUrl)
                                    }
                                } else {
                                    fileObject[fileData.fieldname] = fileUploadedData.fileUrl
                                }

                                // req.body[fileData.fieldname] = fileUploadedData.fileUrl
                            } else {
                                let unlinked = await Fs.unlink(fileData.path)
                                isError = true
                                errMsg = `Something went wrong with the file for ${fileData.fieldname}.`
                            }
                        }
                    }

                }
            }
        }

        for (let each in fileObject) {
            req.body[each] = fileObject[each]
        }
        return { fileData: fileObject, errStatus: isError, errMsg: errMsg }
    } catch (err) {
        logger.info(err)
        return { fileData: [], errStatus: true, errMsg: "" }
    }
}