const mongoose = require('mongoose')
const mongoDBErros = require('mongoose-mongodb-errors')
const config = require('../config/config')
const logger = require('../config/logger')

mongoose.Promise = Promise
mongoose.plugin(mongoDBErros)
mongoose
  .connect(config.mongoose.url, config.mongoose.options)
  .then(result => {
    // TODO: check database connection, do not remove console logs in this file
    logger.info('Connected to database.... ')
  })
  .catch(err => {
    logger.info("Could'nt connect with database.")
  })
