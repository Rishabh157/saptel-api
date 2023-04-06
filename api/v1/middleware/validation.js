exports.regNumber = new RegExp(/^[0-9]*$/);
exports.regName = RegExp(/^[a-z A-Z-.']+$/);
exports.regAlpha = RegExp(/^[a-z A-Z]+$/);
exports.regAlphaNum = RegExp(/^[a-z A-Z. 0-9',-]+$/);
exports.regEmail = RegExp(/^\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b$/i);
exports.regCard = RegExp(/^[0-9.]*$/);
exports.regUrl = RegExp(
    /(http(s)?:\\)?([\w-]+\.)+[\w-]+[.com|.in|.org]+(\[\?%&=]*)?/
);
exports.regPhone = RegExp(/^[0-9 \s]{10}$/);
exports.regIndiaPhone = RegExp(/^[0]?[6789]\d{9}$/);
exports.regnotnumeric = RegExp(
    /^[a-z A-Z !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/
);
exports.regJoinDate = RegExp(
    /^(0[1-9]|[12][0-9]|3[01])[\- \/.](?:(0[1-9]|1[012])[\- \/.](19|20)[0-9]{2})$/
);
exports.regHour = RegExp(/^\d{1,2}[:][0-5][0-9]$/);
exports.regPin = RegExp(/^[1-9]\d{5}$/);
exports.regPassword = RegExp(
    /^(?!.*[\s])(?=.*[A-Za-z])(?!.*[\s])(?=.*[0-9])(?!.*[\s]).{6,21}$/
);
exports.imageMimetype = [
    "image/bmp",
    "application/postscript",
    "image/jpg",
    "image/jpe",
    "image/x-jp2",
    "image/x-jpf",
    "application/x-indesign",
    "image/heif",
    "image/x-panasonic-raw",
    "image/cis-cod",
    "image/vnd.adobe.photoshop",
    "image/gif",
    "image/ief",
    "image/jpeg",
    "image/png",
    "image/pipeg",
    "image/svg+xml",
    "image/tiff",
    "image/x-cmu-raster",
    "image/x-cmx",
    "image/x-icon",
    "image/x-portable-anymap",
    "image/x-portable-bitmap",
    "image/x-portable-graymap",
    "image/x-portable-pixmap",
    "image/x-rgb",
    "image/x-xbitmap",
    "image/x-xpixmap",
    "image/x-xwindowdump",
    "image/webp",
    "image/jfif",
];
exports.videoMimetype = [
    "video/mp4",
    "application/mp4",
    "video/x-flv",
    "application/x-mpegURL",
    "video/MP2T",
    "video/3gpp",
    "video/quicktime",
    "video/x-msvideo",
    "video/x-ms-wmv",
    "video/webm",
];

exports.documentMimeType = [
    "application/msword",
    "text/html",
    "application/pdf",
    "application/vnd.ms-powerpoint.template.macroEnabled.12",
    "application/vnd.ms-powerpoint.slideshow.macroEnabled.12",
    "application/rtf",
    "text/rtf",
    "text/plain",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.template",
    "application/vnd.ms-word.document.macroEnabled.12",
    "application/vnd.ms-word.template.macroEnabled.12",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.template",
    "application/vnd.ms-excel.sheet.macroEnabled.12",
    "application/vnd.ms-excel.template.macroEnabled.12",
    "application/vnd.ms-excel.addin.macroEnabled.12",
    "application/vnd.ms-excel.sheet.binary.macroEnabled.12",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.openxmlformats-officedocument.presentationml.template",
    "application/vnd.openxmlformats-officedocument.presentationml.slideshow",
    "application/vnd.ms-powerpoint.addin.macroEnabled.12",
    "application/vnd.ms-powerpoint.presentation.macroEnabled.12",
    "application/vnd.ms-powerpoint.slideshow.macroEnabled.12"
];

exports.allMimetype = [
    "image/bmp",
    "application/postscript",
    "image/jpg",
    "image/jpe",
    "image/x-jp2",
    "image/x-jpf",
    "application/x-indesign",
    "image/heif",
    "image/x-panasonic-raw",
    "image/cis-cod",
    "image/vnd.adobe.photoshop",
    "image/gif",
    "image/ief",
    "image/jpeg",
    "image/png",
    "image/pipeg",
    "image/svg+xml",
    "image/tiff",
    "image/x-cmu-raster",
    "image/x-cmx",
    "image/x-icon",
    "image/x-portable-anymap",
    "image/x-portable-bitmap",
    "image/x-portable-graymap",
    "image/x-portable-pixmap",
    "image/x-rgb",
    "image/x-xbitmap",
    "image/x-xpixmap",
    "image/x-xwindowdump",
    "image/webp",
    "image/jfif",
    "video/mp4",
    "application/mp4",
    "video/x-flv",
    "application/x-mpegURL",
    "video/MP2T",
    "video/3gpp",
    "video/quicktime",
    "video/x-msvideo",
    "video/x-ms-wmv",
    "video/webm",
    "application/msword",
    "application/vnd.ms-word.document.macroEnabled.12",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.template",
    "application/vnd.ms-word.template.macroEnabled.12",
    "text/html",
    "application/pdf",
    "application/vnd.ms-powerpoint.template.macroEnabled.12",
    "application/vnd.openxmlformats-officedocument.presentationml.template",
    "application/vnd.ms-powerpoint.addin.macroEnabled.12",
    "application/vnd.openxmlformats-officedocument.presentationml.slideshow",
    "application/vnd.openxmlformats-officedocument.presentationml.slideshow",
    "application/vnd.ms-powerpoint.slideshow.macroEnabled.12",
    "application/vnd.ms-powerpoint",
    "application/vnd.ms-powerpoint.presentation.macroEnabled.12",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/rtf",
    "text/rtf",
    "text/plain",
]

exports.pdfMimeType = [
    "application/pdf"
]