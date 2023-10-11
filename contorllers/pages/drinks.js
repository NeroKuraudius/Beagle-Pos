const drinksServices = require('../../services/drinks-services')

const drinkController = {
  // 前台操作首頁
  getDrinks: async (req, res, next) => {
    drinksServices.getDrinks(req, (err, data) => err ? next(err) : res.render('drinks', data))
  },
  addDrink: async (req, res, next) => {
    drinksServices.addDrink(req, (err, data) => {
      if (err) {
        req.flash('danger_msg', '未選取餐點')
        return res.redirect('/drinks')
      }
      req.session.addDrinkData = data
      return res.redirect('/drinks')
    })
  },
  deleteDrink: async (req, res, next) => {
    drinksServices.deleteDrink(req, (err, data) => {
      if (err) {
        req.flash('danger_msg', '查無該筆訂單')
        return res.redirect('/drinks')
      }
      req.session.deletedConsumeData = data
      return res.redirect('/drinks')
    })
  },
  checkoutDrinks: async (req, res, next) => {
    drinksServices.checkoutDrinks(req, (err, data) => {
      if (err) {
        req.flash('danger_msg', '未選取任何餐點')
        return res.redirect('/drinks')
      }
      req.session.checkoutData = data
      return res.redirect('/drinks')
    })
  },
  getOrders: async (req, res, next) => {
    drinksServices.getOrders(req, (err, data) => err ? next(err) : res.render('orders', data))
  },
  shiftChange: async (req, res, next) => {
    drinksServices.shiftChange(req, (err, data) => {
      if (err) {
        req.flash('danger_msg', '無交易不須交班')
        return res.redirect('/drinks')
      }
      req.session.shiftIncome = data
      req.flash('success_msg', '交班成功')
      return res.redirect('/drinks')
    })
  }
}

module.exports = drinkController