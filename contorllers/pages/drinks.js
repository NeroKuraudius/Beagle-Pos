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
    if (err) {
      req.flash('danger_msg', '查無該筆訂單')
      return res.redirect('/drinks')
    }
    req.session.deletedConsumeData = data
    return res.redirect('/drinks')
  },
  checkoutDrinks: async (req, res) => {
    const userId = req.user.id
    const transaction = await sequelize.transaction()
    try {
      const consumes = await Consume.findAll({
        raw: true,
        nest: true,
        where: { orderId: 0 },
      })
      if (consumes.length === 0) {
        req.flash('danger_msg', '未選取餐點')
        return res.redirect('/drinks')
      }
      const user = await User.findByPk(userId, { raw: true })
      const newOrder = await Order.create({
        userId: userId,
        shiftId: user.shiftId,
        quantity: consumes.length,
        totalPrice: req.body.orderTotalPrice
      }, { transaction })
      const consumesIdList = consumes.map(consume => { return consume.id })
      await Consume.update({ orderId: newOrder.toJSON().id }, { where: { id: consumesIdList } }, { transaction })
      await transaction.commit()
      return res.redirect('/drinks')
    } catch (err) {
      console.error(`Error occurred on drinkController.checkoutDrink: ${err}`)
      await transaction.rollback()
    }
  },
  getOrders: async (req, res) => {
    const id = parseInt(req.params.id)
    const backPage = true
    try {
      const user = await User.findOne({
        raw: true,
        where: { id: req.user.id },
        include: Shift
      })
      const orders = await Order.findAll({
        raw: true,
        nest: true,
        where: { incomeId: 0 },
        order: [['createdAt', 'DESC']]
      })
      let totalQuantity = 0
      let totalPrice = 0
      orders.forEach(order => {
        totalQuantity += order.quantity
        totalPrice += order.totalPrice
      })
      if (id === 0) return res.render('orders', { user, orders, totalQuantity, totalPrice, backPage })

      const consumes = await Consume.findAll({
        where: { orderId: id },
        include: [
          { model: Drink },
          { model: Ice },
          { model: Sugar },
          { model: Topping, as: 'addToppings' }
        ]
      })
      const consumesList = consumes.map(consume => {
        const { Drink, Ice, Sugar, addToppings, ...consumeData } = consume.toJSON()

        const toppingsNameList = addToppings.map(topping => { return topping.name })
        const toppingsPriceList = addToppings.map(topping => { return topping.price })
        let toppingsPrice = 0
        toppingsPriceList.forEach(price => toppingsPrice += price);

        consumeData.drinkName = Drink.name
        consumeData.iceName = Ice.name
        consumeData.sugarName = Sugar.name
        consumeData.allToppings = toppingsNameList
        consumeData.totalPrice = toppingsPrice + Drink.price
        return consumeData
      })

      return res.render('orders', { user, orders, totalQuantity, totalPrice, consumesList, id, backPage })
    } catch (err) {
      console.error(`Error occurred on drinkController.getOrders: ${err}`)
    }
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