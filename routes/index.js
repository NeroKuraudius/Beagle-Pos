const express = require('express')
const router = express.Router()
const passport = require('../config/passport')
const drinks = require('./modules/drinks')
const owner = require('./modules/owner')
const userController = require('../contorllers/users')


// 首頁路由
router.use('/drinks',drinks)

// 管理員路由
router.use('/owner', owner)

// 前臺登入
router.get('/signin', userController.signinPage)
router.post('/signin', passport.authenticate('staffLogin', { failureMessage: true, failureRedirect: '/signin' }), userController.signin)

// 前後臺登出
router.post('/signout', userController.signout)

router.get('', (req, res) => res.redirect('/drinks'))

module.exports = router