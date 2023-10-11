const express = require('express')
const router = express.Router()
const passport = require('../../config/passport')
const drinks = require('./modules/drinks')
const owner = require('./modules/owner')
const userController = require('../../contorllers/apis/usersAPI')

// 首頁路由
router.use('/drinks', drinks)

// 管理員路由
router.use('/owner', owner)

module.exports = router