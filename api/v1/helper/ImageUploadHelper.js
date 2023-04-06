const moment = require("moment");
const { uploadFileS3 } = require("../middleware/S3UploadImage");
const { promises: Fs } = require("fs");
const path = require("path");
const { imageMimetype } = require("../middleware/validation");
const config = require('../../../config/config');


const uploadImageFunction = async (fileData, fieldName, routeData) => {
    try {
        let isUploaded = false
        let imageUrl = ""
        let path_array = fileData.path.split(".");
        let image_name = `${fieldName}_${fileData.fieldname}${moment(new Date()).utcOffset("+05:30").format("YMMDDHHmmss")}.${path_array[path_array.length - 1]}`.toLowerCase();
        let result = await uploadFileS3(
            fileData.path,
            `${config.project}/${routeData}/${image_name}`.toLowerCase(),
            path_array[path_array.length - 1]
        );
        // let new_file_path = path.join(__dirname, '../../../../', 'public', 'uploads', routeData, image_name)



        // try {
        //     let renamed = await Fs.rename(new_file_path, fileData.path)

        // } catch (e) {

        // }

        imageUrl = result;
        isUploaded = imageUrl !== "" ? true : false

        if (result) {
            try {
                let unlinked = await Fs.unlink(fileData.path);
            } catch (e) {
                logger.info("Could'nt unlink file")
            }
        }
        return {
            isUploaded: isUploaded,
            imageUrl: imageUrl
        }

    } catch (err) {
        return {
            isUploaded: false,
            imageUrl: ""
        }
    }

}

exports.uploadImageHelper = async (req, routeData, fieldName, errorFiles) => {
    try {
        let imageObject = {}
        let isError = true
        let errMsg = "Some thing went wrong"

        if (req.files !== null && req.files !== {} && req.files !== [] && errorFiles.length === 0) {

            for (let field in req.files) {

                if (Array.isArray(req.files[field])) {
                    if (req.files[field].length) {
                        for (let each in req.files[field]) {
                            let fileData = req.files[field][each]
                            if (!imageMimetype.includes(fileData.mimetype)) {
                                let unlinked = await Fs.unlink(fileData.path)
                                isError = true
                                errMsg = `File extension for ${fileData.fieldname} is not valid. Only images are allowed.`
                            }
                            let imageUploadedData = await uploadImageFunction(fileData, fieldName, routeData)
                            if (imageUploadedData.isUploaded) {
                                isError = false
                                errMsg = ""
                                // imageObject.push([fileData.fieldname] = imageUploadedData.imageUrl)
                                if (imageObject.hasOwnProperty([fileData.fieldname])) {
                                    if (typeof imageObject[fileData.fieldname] === "string") {
                                        imageObject[fileData.fieldname] = imageObject[fileData.fieldname].split(",")
                                        imageObject[fileData.fieldname].push(imageUploadedData.imageUrl)
                                    }
                                } else {
                                    imageObject[fileData.fieldname] = imageUploadedData.imageUrl
                                }
                                // imageObject[fileData.fieldname] = imageObject.hasOwnProperty([fileData.fieldname]) ? imageObject[fileData.fieldname].split(',').push(imageUploadedData.imageUrl) : imageUploadedData.imageUrl
                                // req.body[fileData.fieldname] = imageUploadedData.imageUrl
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
                        if (!imageMimetype.includes(fileData.mimetype)) {
                            let unlinked = await Fs.unlink(fileData.path)
                            isError = true
                            errMsg = `File extension for ${fileData.fieldname} is not valid. Only images are allowed.`
                        }
                        let imageUploadedData = await uploadImageFunction(fileData, fieldName, routeData)
                        if (imageUploadedData.isUploaded) {
                            isError = false
                            errMsg = ""
                            // imageObject.push([fileData.fieldname] = imageUploadedData.imageUrl)
                            if (imageObject.hasOwnProperty([fileData.fieldname])) {
                                if (typeof imageObject[fileData.fieldname] === "string") {
                                    imageObject[fileData.fieldname] = imageObject[fileData.fieldname].split(",")
                                    imageObject[fileData.fieldname].push(imageUploadedData.imageUrl)
                                }
                            } else {
                                imageObject[fileData.fieldname] = imageUploadedData.imageUrl
                            }

                            // req.body[fileData.fieldname] = imageUploadedData.imageUrl
                        } else {
                            let unlinked = await Fs.unlink(fileData.path)
                            isError = true
                            errMsg = `Something went wrong with the file for ${fileData.fieldname}.`
                        }
                    }
                }

            }
        }

        for (let each in imageObject) {
            req.body[each] = imageObject[each]
        }
        return { imageData: imageObject, errStatus: isError, errMsg: errMsg }
    } catch (err) {

        return { imageData: [], errStatus: true, errMsg: "" }
    }
}