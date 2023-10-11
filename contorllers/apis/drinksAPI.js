const drinksServices = require('../../services/drinks-services')

const drinkController = {
  // 前台操作首頁
  getDrinks: async (req, res, next) => {
    drinksServices.getDrinks(req, (err, data) => err ? next(err) : res.json(data))
  }
}

module.exports = drinkController