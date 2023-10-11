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
  shiftChange: async (req, res) => {
    const transaction = await sequelize.transaction()
    try {
      const orders = await Order.findAll({
        raw: true,
        nest: true,
        where: { incomeId: 0 }
      })
      if (orders.length === 0) {
        req.flash('danger_msg', '無交易不須交班')
        return res.redirect('/drinks')
      }

      let totalNum = 0
      let totalIncome = 0
      const ordersIdList = []
      orders.forEach(order => {
        totalNum += order.quantity
        totalIncome += order.totalPrice
        ordersIdList.push(order.id)
      })
      const newIncome = await Income.create({
        quantity: totalNum,
        income: totalIncome,
        userId: req.user.id
      }, { transaction })
      await Order.update({ incomeId: newIncome.toJSON().id }, { where: { id: ordersIdList } }, { transaction })
      await transaction.commit()
      req.flash('success_msg', '交班成功')
      return res.redirect('/drinks')
    } catch (err) {
      console.error(`Error occurred on drinkController.shiftChange: ${err}`)
      await transaction.rollback()
    }
  }
}

module.exports = drinkController