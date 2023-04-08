exports.combineObjects = (objectsArray) => {
  let arra = objectsArray.reduce((acc, el) => {
    return { ...acc, ...el };
  }, {});
  return arra;
};

exports.getQuery = (defaultQuery, reqQuery = false) => {
  if (defaultQuery && reqQuery && Object.keys(reqQuery)) {
    return Object.keys(reqQuery).reduce((acc, key) => {
      acc[key] = reqQuery[key];
      return acc;
    }, defaultQuery);
  }
  return defaultQuery;
};

exports.isAllFieldsExists = (allFields, fields) => {
  const filteredArray = allFields.filter(
    (item) =>
      item !== "isDeleted" &&
      item !== "isActive" &&
      item !== "createdAt" &&
      item !== "updatedAt" &&
      item !== "_id" &&
      item !== "__v"
  );

  return filteredArray.reduce(
    (acc, field) => {
      let fieldExists = fields.find((e) => {
        return e.fieldName === field;
      });
      if (!fieldExists) {
        acc.status = false;
        acc.message += `${field} is missing in fields array. `;
      }
      return acc;
    },
    { status: true, message: "" }
  );
};
