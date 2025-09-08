const drinksServices = require('../../services/staff/drinks-services')

const drinkController = {
  // 前台操作首頁
  getDrinks: async (req, res, next) => {
    drinksServices.getDrinks(req, (err, data) => err ? next(err) : res.json({ status: 200, message: 'success', data }))
  },
  addDrink: async (req, res, next) => {
    drinksServices.addDrink(req, (err, data) => err ? next(err) : res.json({ status: 200, message: 'success', data }))
  },
  deleteDrink: async (req, res, next) => {
    drinksServices.deleteDrink(req, (err, data) => err ? next(err) : res.json({ status: 200, message: 'success', data }))
  },
  checkoutDrinks: async (req, res, next) => {
    drinksServices.checkoutDrinks(req, (err, data) => err ? next(err) : res.json({ status: 200, message: 'success', data }))
  },
  getOrders: async (req, res, next) => {
    drinksServices.getOrders(req, (err, data) => err ? next(err) : res.json({ status: 200, message: 'success', data }))
  },
  shiftChange: async (req, res, next) => {
    drinksServices.shiftChange(req, (err, data) => err ? next(err) : res.json({ status: 200, message: 'success', data }))
  }
}

module.exports = drinkController