// Import
const express = require('express')
const fs = require('fs')


// Call Constants
const constants = require('./constants.js')

// Call Utils
const utils = require('./utils.js')

// Call api
let test = require('./api/test.js')

// Run server
const app = express()
const port = 3000
app.listen(port, () => console.log(`App listening on port ${port}!`))

test()