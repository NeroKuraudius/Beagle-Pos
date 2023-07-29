const { Category, Drink, Ice, Sugar, Topping,
  Consume, Customization, Order, User, Shift, Income } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helpers')
const { Sequelize } = require('sequelize')
const sequelize = new Sequelize('pos', 'root', 'password', { host: '127.0.0.1', dialect: 'mysql' })

const drinkController = {
  // 前台操作首頁
  getDrinks: async (req, res) => {
    const limit = 5
    const page = parseInt(req.query.page) || 1
    const offset = getOffset(limit, page)
    const categoryId = parseInt(req.query.categoryId) || ''
    try {
      // 引用資料庫
      const categories = await Category.findAll({
        raw: true,
        nest: true,
        where: { isRemoved: false }
      })
      const drinks = await Drink.findAndCountAll({
        raw: true,
        nest: true,
        where: { ...categoryId ? { categoryId } : {}, isDeleted: false },
        limit,
        offset
      })
      const ices = await Ice.findAll({ raw: true, nest: true })
      const sugars = await Sugar.findAll({ raw: true, nest: true })
      const toppings = await Topping.findAll({ raw: true, nest: true })

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

      return res.render('drinks', {
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
      console.error(`Data search error: ${err}`)
    }
  },
  addDrink: async (req, res) => {
    const { drink, ice, sugar, topping } = req.body
    // 飲品不得為空
    if (!drink) {
      req.flash('danger_msg', '未選取餐點')
      return res.redirect('/drinks')
    }
    try {
      const consumeDrink = await Drink.findByPk(drink, { raw: true })
      const newConsume = await Consume.create({
        drinkName: drink,
        drinkIce: ice,
        drinkSugar: sugar,
        drinkPrice: consumeDrink.price,
        userId: req.user.id
      })
      const consumeId = await newConsume.id
      const toppingNum = topping ? topping.length : null
      if (toppingNum > 1) {
        for (let i = 0; i < toppingNum; i++) {
          const customizedToppings = await Topping.findByPk(topping[i])
          await Customization.create({
            consumeId,
            toppingId: topping[i],
            toppingPrice: customizedToppings.toJSON().price
          })
        }
      } else if (toppingNum === 1) {
        const customizedToppings = await Topping.findByPk(topping)
        await Customization.create({
          consumeId,
          toppingId: topping,
          toppingPrice: customizedToppings.toJSON().price
        })
      }
      return res.redirect('/drinks')
    } catch (err) {
      console.error(`Error on drinkController.addDrink: ${err}`)
    }
  },
  deleteDrink: async (req, res) => {
    const consumeId = parseInt(req.params.id)
    const consume = await Consume.findByPk(consumeId)
    if (!consume) {
      console.error(`Didn't find the consume with id:${consumeId}`)
      return res.redirect('/drinks')
    }
    const transaction = await sequelize.transaction()
    try {
      const customization = await Customization.findAll({ where: { consumeId } })
      if (customization) {
        await consume.destroy({ transaction })
        await Customization.destroy({ where: { consumeId } }, { transaction })
        await transaction.commit()
      } else {
        await consume.destroy()
      }
      return res.redirect('/drinks')
    } catch (err) {
      console.error(`Error occurred on drinkController.deleteDrink: ${err}`)
      await transaction.rollback()
    }
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
      })
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
      if(orders.length===0){
        req.flash('danger_msg','無交易不須交班')
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
      })
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