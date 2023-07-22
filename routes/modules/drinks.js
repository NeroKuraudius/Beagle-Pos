const express = require('express')
const router = express.Router()
const { authenticated } = require('../../middleware/auth')
const drinkController = require('../../contorllers/drinks')


// 查看訂單頁
router.get('/orders/:id', authenticated, drinkController.getOrders)

// 首頁
router.get('/', authenticated, drinkController.getDrinks)

// 結帳
router.post('/checkout', authenticated, drinkController.checkoutDrinks)

// 新增訂單
router.post('/', authenticated, drinkController.addDrink)

// 刪除訂單
router.delete('/:id', authenticated, drinkController.deleteDrink)

module.exports = router