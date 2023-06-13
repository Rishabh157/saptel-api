const express = require("express");
const router = express.Router();
const docsRoute = require("./DocRoute");
const config = require("../../config/config");
const accessRoute = require("./src/accessModule/AccessModuleRoute");


const devRoutes = [
    // routes available only in development mode
    {
        path: "/api-docs",
        route: docsRoute,
    },
];

const defaultRoutes = [
    {
        path: "/access-module",
        route: accessRoute,
    },
];


defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

/* ignore next */
if (config.env === "development") {
    devRoutes.forEach((route) => {
        router.use(route.path, route.route);
    });
}

module.exports = router;
