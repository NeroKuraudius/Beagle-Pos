const { User, Income, Order, Consume } = require('../../models')
const { Sequelize } = require('sequelize')
const sequelize = new Sequelize(process.env.DATABASE, process.env.DB_USERNAME, process.env.PASSWORD, { host: process.env.HOST, dialect: 'mysql' })

const ownerServices = {
  getIncomes: async (req, cb) => {
    try {
      const admin = await User.findOne({ where: { id: req.user.id }, attributes: ['name'], raw: true })
      const incomes = await Income.findAll({
        attributes: ['id', 'quantity', 'income', 'createdAt'],
        include: [{
          model: User,
          attributes: ['name'],
          include: [{ model: Shift, attributes: ['name'] }]
        }],
        order: [['createdAt', 'DESC']],
        raw: true, nest: true
      })
      return cb(null, { admin, incomes })
    } catch (err) {
      return cb(err)
    }
  },

  getOrders: async (req, cb) => {
    const incomeId = parseInt(req.params.Iid)
    try {
      const admin = await User.findOne({ where: { id: req.user.id }, attributes: ['name'], raw: true })
      const incomes = await Income.findAll({
        attributes: ['id', 'quantity', 'income', 'createdAt'],
        include: [{
          model: User,
          attributes: ['name'],
          include: [{ model: Shift, attributes: ['name'] }]
        }],
        order: [['createdAt', 'DESC']],
        raw: true, nest: true
      })
      const orders = await Order.findAll({
        attributes: ['id', 'quantity', 'totalPrice', 'incomeId', 'createdAt'],
        where: { incomeId },
        order: [['createdAt', 'DESC']],
        raw: true, nest: true
      })
      return cb(null, { admin, incomes, incomeId, orders })
    } catch (err) {
      return cb(err)
    }
  },

  getConsumes: async (req, cb) => {
    const { Iid, Oid } = req.params
    try {
      const admin = await User.findOne({ where: { id: req.user.id }, attributes: ['name'], raw: true })
      const incomes = await Income.findAll({
        attributes: ['id', 'quantity', 'income', 'createdAt'],
        include: [{
          model: User,
          attributes: ['name'],
          include: [{ model: Shift, attributes: ['name'] }]
        }],
        order: [['createdAt', 'DESC']],
        raw: true, nest: true
      })
      const orders = await Order.findAll({
        attributes: ['id', 'quantity', 'totalPrice', 'incomeId', 'createdAt'],
        where: { incomeId: parseInt(Iid) },
        order: [['createdAt', 'DESC']],
        raw: true, nest: true
      })
      const consumes = await Consume.findAll({
        where: { orderId: parseInt(Oid) },
        attributes: ['drinkName', 'drinkIce', 'drinkSugar'],
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
        consumeData.drinkIce = Ice.name
        consumeData.drinkSugar = Sugar.name
        consumeData.allToppings = toppingsNameList
        consumeData.totalPrice = toppingsPrice + Drink.price
        return consumeData
      })
      return cb(null, {
        admin, incomes, incomeId: parseInt(Iid),
        orders, orderId: parseInt(Oid), consumes: consumesList
      })
    } catch (err) {
      return cb(err)
    }
  }  
}

module.exports = ownerServices