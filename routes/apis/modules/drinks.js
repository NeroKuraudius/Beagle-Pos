const express = require('express')
const router = express.Router()
const drinkController = require('../../../contorllers/apis/drinks-api')

// 首頁
router.get('/', drinkController.getDrinks)

module.exports = router