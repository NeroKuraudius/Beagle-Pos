const express = require('express')
const router = express.Router()
const passport = require('../../config/passport')
const drinks = require('./modules/drinks')
const owner = require('./modules/owner')
const userController = require('../../contorllers/apis/users-api')
const { apiErrorHandler } = require('../../middleware/error-handler')

// 首頁路由
router.use('/drinks', drinks)

// 管理員路由
router.use('/owner', owner)

// Error處理
router.use('/', apiErrorHandler)

module.exports = router