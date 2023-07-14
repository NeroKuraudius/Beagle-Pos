const { Category, Drink } = require('../models')

const drinkController = {
  // 前台操作首頁
  getDrinks: async (req, res, next) => {
    // const categories = await Category.findAll({ attributes: ['name'], raw: true, nest: true })
    const drinks = await Drink.findAll({ raw: true, nest: true })
    return res.render('drinks', { drinks })
  }
}

module.exports = drinkController