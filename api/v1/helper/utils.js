exports.combineObjects = objectsArray => {
  let arra = objectsArray.reduce((acc, el) => {
    return { ...acc, ...el }
  }, {})
  return arra
}

exports.getQuery = (defaultQuery, reqQuery = false) => {
  if (defaultQuery && reqQuery && Object.keys(reqQuery)) {
    return Object.keys(reqQuery).reduce((acc, key) => {
      acc[key] = reqQuery[key]
      return acc
    }, defaultQuery)
  }
  return defaultQuery
}
