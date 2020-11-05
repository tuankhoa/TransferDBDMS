// Import
const express = require('express')

// Call Constants
const constants = require('./constants.js')

// Call Utils
const utils = require('./utils.js')

// Call api
let main = require('./api/main.js')

// Run server
const app = express()
const port = 3000
app.listen(port, () => console.log(`App listening on port ${port}!`))

main()