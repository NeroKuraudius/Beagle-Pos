const express = require('express')
const router = express.Router()
const { authenticated } = require('../../middleware/auth')
const drinkController = require('../../contorllers/drinks')

router.get('/', authenticated, drinkController.getDrinks)
router.post('/', authenticated, drinkController.addDrink)

module.exports = router