const { Category, Drink, Ice, Sugar, Topping,
  Consume, Customization, Order, User, Shift, Income } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helpers')

const { Sequelize } = require('sequelize')
const sequelize = new Sequelize(process.env.DATABASE, process.env.DB_USERNAME, process.env.PASSWORD, { host: process.env.HOST, dialect: 'mysql' })

const drinksServices = {
  getDrinks: async (req, cb) => {
    const limit = 5
    const page = parseInt(req.query.page) || 1
    const offset = getOffset(limit, page)
    const categoryId = parseInt(req.query.categoryId) || ''
    try {
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
        attributes: ['id', 'drinkName', 'drinkIce', 'drinkSugar', 'drinkPrice'],
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
        consumeData.drinkIce = Ice.name
        consumeData.drinkSugar = Sugar.name
        consumeData.allToppings = toppingsNameList
        consumeData.totalPrice = toppingsPrice + Drink.price
        return consumeData
      })
      // 計算訂單總價
      let orderTotalPrice = 0
      consumesList.forEach(consume => orderTotalPrice += consume.totalPrice)
      const orderTotalNum = consumesList.length

      return cb(null, {
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
      })
    } catch (err) {
      cb(err)
    }
  },

  addDrink: async (req, cb) => {
    const { drink, ice, sugar, topping } = req.body
    try {
      if (!drink) {
        const err = new Error('未選取任何餐點')
        err.status = 400
        throw err
      }

      const result = await sequelize.transaction(async(t)=>{
        const consumeDrink = await Drink.findByPk(drink, { raw: true, transaction: t })
        if (!consumeDrink) {
          const err = new Error('找不到指定的飲品')
          err.status = 404
          throw err
        }

        const newConsume = await Consume.create({
          drinkName: drink,
          drinkIce: ice,
          drinkSugar: sugar,
          drinkPrice: consumeDrink.price,
          userId: req.user.id
          }, 
          { transaction: t }
        )

        if (topping && topping.length > 0){
          const toppingIds = [].concat(topping)

          const toppingsData = await Topping.findAll({
            where: { id: toppingIds },
            raw: true,
            transaction: t
          })
          if (toppingsData.length !== toppingIds.length) {
            const err = new Error('包含無效的配料選項')
            err.status = 400
            throw err
          }

          const customizationData = toppingsData.map(tData => (
            {
            consumeId: newConsume.id,
            toppingId: tData.id,
            toppingPrice: tData.price,
            }
          ))

          await Customization.bulkCreate(customizationData, { transaction: t })
        }
        return { newConsume }
      })
      
      return cb(null, result)
    } catch (err) {
      if (!err.status) err.status = 500
      return cb(err)
    }
  },

  deleteDrink: async (req, cb) => {
    const consumeId = parseInt(req.params.id)
    try {
      const result = await sequelize.transaction(async(t)=>{
        const consume = await Consume.findByPk(consumeId, { transaction: t })
        if (!consume) {
          const err = new Error('查無該筆訂單')
          err.status = 404
          throw err
        }

        const deletedCosume = consume
        const customization = await Customization.findAll({ where: { consumeId }, transaction: t })
        if (customization) {
          await consume.destroy({ transaction: t })
          await Customization.destroy({ where: { consumeId }, transaction: t })
        } else {
          await consume.destroy()
        }

        return { deletedCosume, consumeToppings: customization }
      })
      
      return cb(null, result)
    } catch (err) {
      if (!err.status) err.status = 500
      cb(err)
    }
  },

  checkoutDrinks: async (req, cb) => {
    const userId = req.user.id
    try {
      const result = await sequelize.transaction(async(t)=>{
        const consumes = await Consume.findAll({
          raw: true,
          nest: true,
          where: { orderId: 0 },
          transaction: t
        })

        if (consumes.length === 0) {
          const err = new Error('未選取任何餐點')
          err.status = 404
          throw err
        }

        const user = await User.findByPk(userId, { raw: true, transaction: t })
        const newOrder = await Order.create({
          userId: userId,
          shiftId: user.shiftId,
          quantity: consumes.length,
          totalPrice: req.body.orderTotalPrice
        }, { transaction: t })

        const consumesIdList = consumes.map(consume => { return consume.id })
        await Consume.update(
          { orderId: newOrder.toJSON().id }, 
          { where: { id: consumesIdList }, transaction: t }
        )
        return { newOrder }
      })
      
      return cb(null, result)
    } catch (err) {
      if (!err.status) err.status = 500
      cb(err)
    }
  },

  getOrders: async (req, cb) => {
    const id = parseInt(req.params.id)
    const backPage = true
    try {
      const user = await User.findOne({
        raw: true,
        attributes: ['id', 'name'],
        where: { id: req.user.id },
        include: [
          {
            model: Shift,
            attributes: ['id', 'name']
          }
        ]
      })
      const orders = await Order.findAll({
        raw: true,
        nest: true,
        where: { incomeId: 0 , userId: req.user.id},
        attributes: ['id', 'quantity', 'totalPrice', 'createdAt'],
        order: [['createdAt', 'DESC']]
      })
      let totalQuantity = 0
      let totalPrice = 0
      orders.forEach(order => {
        totalQuantity += order.quantity
        totalPrice += order.totalPrice
      })
      if (id === 0) return cb(null, { user, orders, totalQuantity, totalPrice, backPage })

      const consumes = await Consume.findAll({
        where: { orderId: id },
        attributes: ['id', 'drinkName', 'drinkIce', 'drinkSugar', 'drinkPrice'],
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

      return cb(null, { user, orders, totalQuantity, totalPrice, consumesList, id, backPage })
    } catch (err) {
      cb(err)
    }
  },

  shiftChange: async (req, cb) => {
    const { id } = req.user
    try {
      const transaction = await sequelize.transaction(async(t)=>{
        const orders = await Order.findAll({
          raw: true,
          nest: true,
          where: { incomeId: 0 , userId : id },
          transaction: t
        })
        if (!orders.length) {
          const err = new Error('無交易不須交班')
          err.status = 400
          throw err
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
        }, { transaction: t })
        await Order.update({ incomeId: newIncome.toJSON().id }, { where: { id: ordersIdList }, transaction: t })

        return { newIncome }
      })

      return cb(null, result)
    } catch (err) {
      if (!err.status) err.status = 500
      return cb(err)
    }
  }
}

module.exports = drinksServices