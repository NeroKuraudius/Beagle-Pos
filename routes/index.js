const express = require('express')
const router = express.Router()
const passport = require('../config/passport')
const owner = require('./modules/owner')
const userController = require('../contorllers/users')
const drinkController = require('../contorllers/drinks')

// 管理員路由
router.use('/owner', owner)

// 前台登入
router.get('/signin', userController.signinPage)
router.post('/signin', passport.authenticate('staffLogin', { failureMessage: true, failureRedirect: '/signin' }), userController.signin)
router.post('/signout', userController.signout)

router.get('', (req, res) => res.redirect('/drinks'))

module.exports = router