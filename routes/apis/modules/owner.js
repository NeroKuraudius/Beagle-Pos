const express = require('express')
const router = express.Router()
const passport = require('../../../config/passport')
const ownerController = require('../../../contorllers/apis/owner-api')
const { authenticated } = require('../../../middleware/api-auth')



module.exports = router