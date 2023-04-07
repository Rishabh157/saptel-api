const express = require("express");
const router = express.Router();
const docsRoute = require("./DocRoute");
const accessRoute = require("./AccessModuleRoute");
const countryRoute = require("./CountryRoute");
const companyRoute = require("./CompanyRouter");
const stateRoute = require("./StateRoute");
const districtRoute = require("./DistrictRoute");
const tehsilRoute = require("./TehsilRoute");
const pincodeRoute = require("./PincodeRoute");
const areaRoute = require("./AreaRoute");
const productSubCategoryRoute = require("./ProductSubCategoryRoute");
const productGroupRoute = require("./ProductGroupRoute");
const productCategoryRoute = require("./ProductCategoryRoute");
const taxesRoute = require("./TaxesRoute");
const attributesGroupRoute = require("./AttributesGroupRoute");
const attributesRoute = require("./AttributesRoute");
const adminRoute = require("./AdminRoute");
const fileManagerRoute = require("./FileManagerRoute");
const userRoute = require("./UserRoute");
const config = require("../../../../config/config");

const devRoutes = [
  // routes available only in development mode
  {
    path: "/api-docs",
    route: docsRoute,
  },
];

const defaultRoutes = [
  {
    path: "/admin",
    route: adminRoute,
  },

  {
    path: "/file-manager",
    route: fileManagerRoute,
  },
  {
    path: "/user",
    route: userRoute,
  },
  {
    path: "/access-module",
    route: accessRoute,
  },
  {
    path: "/company",
    route: companyRoute,
  },
  {
    path: "/country",
    route: countryRoute,
  },
  {
    path: "/state",
    route: stateRoute,
  },
  {
    path: "/district",
    route: districtRoute,
  },
  {
    path: "/tehsil",
    route: tehsilRoute,
  },
  {
    path: "/pincode",
    route: pincodeRoute,
  },
  {
    path: "/area",
    route: areaRoute,
  },
  {
    path: "/product-code",
    route: productCategoryRoute,
  },
  {
    path: "/taxes",
    route: taxesRoute,
  },
  {
    path: "/product-sub-category",
    route: productSubCategoryRoute,
  },
  {
    path: "/product-group",
    route: productGroupRoute,
  },
  {
    path: "/attributes-group",
    route: attributesGroupRoute,
  },
  {
    path: "/attribute",
    route: attributesRoute,
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
