const { User, Shift, Income, Order, Consume,
  Drink, Ice, Sugar, Topping } = require('../models')

const ownerController = {
  signinPage: (req, res) => {
    return res.render('back-login')
  },
  signin: (req, res) => {
    return res.redirect('/owner/incomes')
  },
  getIncomes: async (req, res) => {
    try {
      const admin = await User.findByPk(req.user.id)
      const incomes = await Income.findAll({
        raw: true,
        nest: true,
        include: [{
          model: User,
          include: [Shift]
        }]
      })
      return res.render('owner/incomes', { admin: admin.toJSON(), incomes })
    } catch (err) {
      console.error(`Error occupied on ownerControll.getIncomes: ${err}`)
    }
  },
  getOrders: async (req, res) => {
    const { Iid } = req.params
    try {
      const admin = await User.findByPk(req.user.id)
      const incomes = await Income.findAll({
        raw: true,
        nest: true,
        include: [{
          model: User,
          include: [Shift]
        }]
      })
      const orders = await Order.findAll({
        raw: true,
        nest: true,
        where: { income_id: Iid }
      })
      return res.render('owner/incomes', { admin: admin.toJSON(), incomes, orders })
    } catch (err) {
      console.error(`Error occupied on ownerControll.getOrders: ${err}`)
    }
  },
  getConsumes: async (req, res) => {
    const { Iid, Oid } = req.params
    try {
      const admin = await User.findByPk(req.user.id)
      const incomes = await Income.findAll({
        raw: true,
        nest: true,
        include: [{
          model: User,
          include: [Shift]
        }]
      })
      const orders = await Order.findAll({
        raw: true,
        nest: true,
        where: { income_id: Iid }
      })
      const consumes = await Consume.findAll({
        where: { order_id: Oid },
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
      return res.render('owner/incomes', { admin: admin.toJSON(), incomes, orders, consumes: consumesList })
    } catch (err) {
      console.error(`Error occupied on ownerControll.getConsumes: ${err}`)
    }
  },
  getStaffs: async (req, res) => {

  },
  getBeverages: async (req, res) => {

  },
  getCategories: async (req, res) => {

  }
}


module.exports = ownerController