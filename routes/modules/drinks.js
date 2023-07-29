const express = require('express')
const router = express.Router()
const drinkController = require('../../contorllers/drinks')


// 查看訂單頁
router.get('/orders/:id', drinkController.getOrders)

// 交班
router.post('/shift', drinkController.shiftChange)

// 結帳
router.post('/checkout', drinkController.checkoutDrinks)

// 刪除訂單
router.delete('/:id', drinkController.deleteDrink)

// 新增訂單
router.post('/', drinkController.addDrink)

// 首頁
router.get('/', drinkController.getDrinks)


module.exports = router