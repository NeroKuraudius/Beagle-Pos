const { User, Income, Order, Consume, Shift,
        Drink, Ice, Sugar, Topping } = require('../../models')
const { Sequelize } = require('sequelize')
const sequelize = new Sequelize(process.env.DATABASE, process.env.DB_USERNAME, process.env.PASSWORD, { host: process.env.HOST, dialect: 'mysql' })

const ownerServices = {
  getIncomes: async (req, cb) => {
    try {
      const { admin, incomes, orders, consumes } = await getTrades(req.user.id)

      return cb(null, { admin, incomes })
    } catch (err) {
      return cb(err)
    }
  },

  getOrders: async (req, cb) => {
    const incomeId = parseInt(req.params.Iid)
    try {
      const { admin, incomes, orders, consumes } = await getTrades(req.user.id, incomeId)

      return cb(null, { incomeId, admin, incomes, orders })
    } catch (err) {
      return cb(err)
    }
  },

  getConsumes: async (req, cb) => {
    const { Iid, Oid } = req.params
    const [ incomeId, orderId ] = [ parseInt(Iid), parseInt(Oid) ]
    try {
      const { admin, incomes, orders, consumes } = await getTrades(req.user.id, incomeId, orderId)

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

      return cb(null, { incomeId, orderId, admin, incomes, orders, consumes: consumesList })
    } catch (err) {
      return cb(err)
    }
  }  
}

/* ============================== DB query ============================== */
async function getTrades(userId, incomeId=null, orderId=null) {
  const [ admin, incomes, orders, consumes ] = await Promise.all([
        User.findOne({ where: { id: userId }, attributes: ['name'], raw: true }),

        Income.findAll({
          attributes: ['id', 'quantity', 'income', 'createdAt'],
          include: [{
            model: User,
            attributes: ['name'],
            include: [{ model: Shift, attributes: ['name'] }]
          }],
          order: [['createdAt', 'DESC']],
          raw: true, nest: true
        }),

        incomeId ? Order.findAll({
        attributes: ['id', 'quantity', 'totalPrice', 'incomeId', 'createdAt'],
        where: { incomeId },
        order: [['createdAt', 'DESC']],
        raw: true, nest: true
      }) : Promise.resolve(null),

        orderId ? Consume.findAll({
          where: { orderId },
          attributes: ['drinkName', 'drinkIce', 'drinkSugar'],
          include: [
            { model: Drink },
            { model: Ice },
            { model: Sugar },
            { model: Topping, as: 'addToppings' }
          ]
        }) : Promise.resolve(null)
      ])

  return { admin, incomes, orders, consumes }
}
/* ============================== DB query ============================== */

module.exports = ownerServices