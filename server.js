const http = require('http')
const app = require('./app')
const config = require('./config/config')
const logger = require('./config/logger')
const fs = require('fs')
const port = config.port || 3004
const server = http.createServer(app)

//-------------------------------
//start server
// TODO: check server connection, do not remove console logs in this file

const serverConnected = server.listen(port, async () => {
  logger.info(`Server is running on port ${port}`)
})

//--------------------------------------------------------------------
