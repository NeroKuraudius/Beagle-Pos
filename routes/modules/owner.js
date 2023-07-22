const express = require('express')
const router = express.Router()
const passport = require('../../config/passport')
const { authenticatedOwner } = require('../../middleware/auth')
const ownerController = require('../../contorllers/owner')

// 後臺登入
router.get('/signin', ownerController.signinPage)
router.post('/signin', passport.authenticate('ownerLogin', { failureMessage: true, failureRedirect: '/owner/signin' }), ownerController.signin)

// 後臺管理訂單
router.get('/incomes/:Iid/:Oid', authenticatedOwner, ownerController.getConsumes)
router.get('/incomes/:Iid', authenticatedOwner, ownerController.getOrders)
router.get('/incomes', authenticatedOwner, ownerController.getIncomes)

// 後臺管理人員
router.get('/staffs', authenticatedOwner, ownerController.getStaffs)

// 後臺管理餐點
router.get('/beverages', authenticatedOwner, ownerController.getBeverages)

// 後臺管理類別
router.get('/categories', authenticatedOwner, ownerController.getCategories)

module.exports = router