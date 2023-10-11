const express = require('express')
const router = express.Router()
const passport = require('../../../config/passport')
const { authenticatedOwner } = require('../../../middleware/auth')
const ownerController = require('../../../contorllers/apis/ownerAPI')



module.exports = router