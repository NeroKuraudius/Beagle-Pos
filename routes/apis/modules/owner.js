const express = require('express')
const router = express.Router()

const { authenticatedOwner } = require('../../../middleware/api-auth')

const ownerController = require('../../../contorllers/apis/owner-api')


// 後臺登入
router.post('/signin', ownerController.signin)

// 後臺管理訂單
router.get('/incomes/:Iid/:Oid', authenticatedOwner, ownerController.getConsumes)
router.get('/incomes/:Iid', authenticatedOwner, ownerController.getOrders)
router.get('/incomes', authenticatedOwner, ownerController.getIncomes)

// 後臺管理人員
router.post('/staffs/create', authenticatedOwner, ownerController.createStaff)
router.get('/staffs/:Uid', authenticatedOwner, ownerController.getStaffData) 
router.patch('/staffs/:Uid', authenticatedOwner, ownerController.patchStaffData) 
router.put('/staffs/:Uid', authenticatedOwner, ownerController.putStaff) 
router.delete('/staffs/:Uid', authenticatedOwner, ownerController.deleteStaff) 
router.get('/staffs', authenticatedOwner, ownerController.getStaffs) 

// 後臺管理餐點
router.post('/beverages/create', authenticatedOwner, ownerController.createBeverage)
router.get('/beverages/:Did', authenticatedOwner, ownerController.getBeverageData)
router.patch('/beverages/:Did', authenticatedOwner, ownerController.patchBeverageData)
router.delete('/beverages/:Did', authenticatedOwner, ownerController.deleteBeverage)
router.get('/beverages', authenticatedOwner, ownerController.getBeverages)

// 後臺管理類別
router.post('/categories/create', authenticatedOwner, ownerController.createCategory)
router.get('/categories/:Cid', authenticatedOwner, ownerController.getCategoryData)
router.patch('/categories/:Cid', authenticatedOwner, ownerController.patchCategoryData)
router.delete('/categories/:Cid', authenticatedOwner, ownerController.deleteCategory)
router.get('/categories', authenticatedOwner, ownerController.getCategories)

module.exports = router
