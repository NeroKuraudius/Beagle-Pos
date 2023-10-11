const drinksServices = require('../../services/drinks-services')

const drinkController = {
  // 前台操作首頁
  getDrinks: async (req, res, next) => {
    drinksServices.getDrinks(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  addDrink: async (req, res, next) => {
    drinksServices.addDrink(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  deleteDrink: async (req, res, next) => {
    drinksServices.deleteDrink(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
}

module.exports = drinkController