const { Category, Drink, Ice, Sugar, Topping,
  Consume, Customization, Order, User, Shift, Income } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helpers')
const { Sequelize } = require('sequelize')
const sequelize = new Sequelize(process.env.DATABASE, process.env.USERNAME, process.env.PASSWORD, { host: process.env.HOST, dialect: 'mysql' })

const drinksServices = {
  // 前台操作首頁
  getDrinks: async (req, cb) => {
    const limit = 5
    const page = parseInt(req.query.page) || 1
    const offset = getOffset(limit, page)
    const categoryId = parseInt(req.query.categoryId) || ''
    try {
      // 引用資料庫
      const categories = await Category.findAll({
        raw: true,
        nest: true,
        attributes: ['id', 'name'],
        where: { isRemoved: false }
      })
      const drinks = await Drink.findAndCountAll({
        raw: true,
        nest: true,
        attributes: ['id', 'name', 'price'],
        where: { ...categoryId ? { categoryId } : {}, isDeleted: false },
        limit,
        offset
      })
      const ices = await Ice.findAll({ raw: true, nest: true, attributes: ['id', 'name'] })
      const sugars = await Sugar.findAll({ raw: true, nest: true, attributes: ['id', 'name'] })
      const toppings = await Topping.findAll({ raw: true, nest: true, attributes: ['id', 'name', 'price'] })

      const consumes = await Consume.findAll({
        where: { orderId: 0, userId: req.user.id },
        include: [
          { model: Drink },
          { model: Ice },
          { model: Sugar },
          { model: Topping, as: 'addToppings' }
        ]
      })

      // 創建分頁器
      const pagination = getPagination(limit, page, drinks.count)
      // 創造訂單列表
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
      // 計算訂單總價
      let orderTotalPrice = 0
      consumesList.forEach(consume => orderTotalPrice += consume.totalPrice)
      const orderTotalNum = consumesList.length

      return cb(null,{
        data: {
          categoryId,
          categories,
          ices,
          sugars,
          toppings,
          drinks: drinks.rows,
          pagination,
          consumesList,
          orderTotalPrice,
          orderTotalNum
        }
      })
    } catch (err) {
      cb(err)
    }
  }
}

module.exports = drinksServices