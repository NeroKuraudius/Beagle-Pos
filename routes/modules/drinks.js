const express = require('express')
const router = express.Router()
const { authenticated } = require('../../middleware/auth')
const drinkController = require('../../contorllers/drinks')

router.get('/', authenticated, drinkController.getDrinks)
router.post('/checkout',authenticated,drinkController.checkoutDrinks)
router.post('/', authenticated, drinkController.addDrink)
router.delete('/:id',authenticated,drinkController.deleteDrink)

module.exports = router