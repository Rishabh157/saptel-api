const multer = require("multer");
const path = require("path");
const uuid4 = require('uuid4'); // for naming files with random characters
const fs = require("fs");


const storage = multer.diskStorage({
    destination: function (req, file, cb) {

        var folder_name = req.baseUrl.replace("/", "");

        let dest = path.join(
            __dirname,
            "../../../",
            "public",
            "uploads",
            folder_name
        )
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        cb(null, dest);

    },

    filename: function (req, file, cb) {

        let uuid = uuid4()
        cb(null, uuid + path.extname(file.originalname));
        // cb(null, file.originalname);

    },
});


// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {


//         var folder_name = req.baseUrl.replace("/", "");
//         let dest = path.join(
//             __dirname,
//             "../../../",
//             "public",
//             "uploads",
//             folder_name
//         )
//         cb(null, dest);

//     },
//     filename: function (req, file, cb) {
//         let uuid = uuid4()
//         cb(null, file.fieldname + "-" + uuid + path.extname(file.originalname));
//     }
// })

const upload = multer({ storage: storage })


//img error start
let errorFiles = [];

exports.imgError = function (req, res, next) {

    errorFiles = [];
    next();
};
//img error end

//image validate
const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === "image/bmp" ||
        file.mimetype === "application/postscript" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpe" ||
        file.mimetype === "image/x-jp2" ||
        file.mimetype === "image/x-jpf" ||
        file.mimetype === "application/x-indesign" ||
        file.mimetype === "image/heif" ||
        file.mimetype === "image/x-panasonic-raw" ||
        file.mimetype === "image/cis-cod" ||
        file.mimetype === "image/vnd.adobe.photoshop" ||
        file.mimetype === "image/gif" ||
        file.mimetype === "image/ief" ||
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/png" ||
        file.mimetype === "image/pipeg" ||
        file.mimetype === "image/svg+xml" ||
        file.mimetype === "image/tiff" ||
        file.mimetype === "image/x-cmu-raster" ||
        file.mimetype === "image/x-cmx" ||
        file.mimetype === "image/x-icon" ||
        file.mimetype === "image/x-portable-anymap" ||
        file.mimetype === "image/x-portable-bitmap" ||
        file.mimetype === "image/x-portable-graymap" ||
        file.mimetype === "image/x-portable-pixmap" ||
        file.mimetype === "image/x-rgb" ||
        file.mimetype === "image/x-xbitmap" ||
        file.mimetype === "image/x-xpixmap" ||
        file.mimetype === "image/x-xwindowdump" ||
        file.mimetype === "image/webp" ||
        file.mimetype === "image/jfif" ||
        file.mimetype ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
        cb(null, true);
    } else {
        errorFiles.push(file.originalname);
        cb(null, false);
    }


    req.body.errorFiles = errorFiles;
};

//image upload
exports.imgUpload = multer({
    storage: storage,
    // limits: {
    //     fileSize: 1024 * 1024 * 5,
    // },
    //fileFilter: fileFilter,
})
exports.removeImg = function (req, res, next) {

    next();
};


