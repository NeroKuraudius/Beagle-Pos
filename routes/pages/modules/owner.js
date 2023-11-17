const express = require('express')
const router = express.Router()
const passport = require('../../../config/passport')
const { authenticatedOwner } = require('../../../middleware/auth')
const ownerController = require('../../../contorllers/pages/owner')

// 後臺登入
router.get('/signin', ownerController.signinPage)
router.post('/signin', passport.authenticate('ownerLogin', { failureMessage: true, failureRedirect: '/owner/signin' }), ownerController.signin)

// 後臺管理訂單
router.get('/incomes/:Iid/:Oid', authenticatedOwner, ownerController.getConsumes)
router.get('/incomes/:Iid', authenticatedOwner, ownerController.getOrders)
router.get('/incomes', authenticatedOwner, ownerController.getIncomes)

// 後臺管理人員
router.get('/staffs/:Uid', authenticatedOwner, ownerController.getStaffData)
router.patch('/staffs/:Uid', authenticatedOwner, ownerController.patchStaffData)
router.put('/staffs/:Uid', authenticatedOwner, ownerController.putStaff)
router.delete('/staffs/:Uid', authenticatedOwner, ownerController.deleteStaff)
router.get('/staffs', authenticatedOwner, ownerController.getStaffs)
router.post('/staffs', authenticatedOwner, ownerController.createStaff)

// 後臺管理餐點
router.get('/beverages/:Did', authenticatedOwner, ownerController.getBeverageData)
router.patch('/beverages/:Did', authenticatedOwner, ownerController.patchBeverageData)
router.delete('/beverages/:Did', authenticatedOwner, ownerController.deleteBeverage)
router.get('/beverages', authenticatedOwner, ownerController.getBeverages)
router.post('/beverages', authenticatedOwner, ownerController.createBeverage)

// 後臺管理類別
router.get('/categories/:Cid', authenticatedOwner, ownerController.getCategoryData)
router.patch('/categories/:Cid', authenticatedOwner, ownerController.patchCategoryData)
router.delete('/categories/:Cid', authenticatedOwner, ownerController.deleteCategory)
router.get('/categories', authenticatedOwner, ownerController.getCategories)
router.post('/categories', authenticatedOwner, ownerController.createCategory)

module.exports = router