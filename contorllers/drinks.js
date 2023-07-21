const { Category, Drink, Ice, Sugar, Topping, Consume, Customization, Order, User, Shift } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helpers')

const drinkController = {
  // 前台操作首頁
  getDrinks: async (req, res) => {
    const limit = 5
    const page = parseInt(req.query.page) || 1
    const offset = getOffset(limit, page)
    const categoryId = parseInt(req.query.categoryId) || ''
    try {
      // 引用資料庫
      const categories = await Category.findAll({ raw: true, nest: true })
      const ices = await Ice.findAll({ raw: true, nest: true })
      const sugars = await Sugar.findAll({ raw: true, nest: true })
      const toppings = await Topping.findAll({ raw: true, nest: true })
      const drinks = await Drink.findAndCountAll({
        raw: true,
        nest: true,
        where: { ...categoryId ? { categoryId } : {} },
        limit,
        offset
      })
      const consumes = await Consume.findAll({
        where: { is_checked: false, user_id: req.user.id },
        include: [
          { model: Drink, attribute: ['name'] },
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
      })
    } catch (err) {
      console.error(`Data search error: ${err}`)
    }
  },
  addDrink: async (req, res) => {
    const { drink, ice, sugar, topping } = req.body
    // 飲品不得為空
    if (!drink) {
      req.flash('danger_msg', '請選擇飲品')
      return res.redirect('/drinks')
    }
    try {
      const consumeDrink = await Drink.findByPk(drink)
      const newConsume = await Consume.create({
        drinkName: drink,
        drinkIce: ice,
        drinkSugar: sugar,
        drink_price: consumeDrink.toJSON().price,
        user_id: req.user.id
      })

      const consumeId = await newConsume.toJSON().id
      const toppingNum = topping ? topping.length : null
      if (toppingNum > 1) {
        for (let i = 0; i < toppingNum; i++) {
          const customizedToppings = await Topping.findByPk(topping[i])
          await Customization.create({
            consumeId,
            toppingId: topping[i],
            topping_price: customizedToppings.toJSON().price
          })
        }
      } else if (toppingNum === 1) {
        const customizedToppings = await Topping.findByPk(topping)
        await Customization.create({
          consumeId,
          toppingId: topping,
          topping_price: customizedToppings.toJSON().price
        })
      }
      return res.redirect('/drinks')
    } catch (err) {
      console.error(`Error on drinkController.addDrink: ${err}`)
    }
  },
  deleteDrink: async (req, res) => {
    const { id } = req.params
    try {
      const consume = await Consume.findByPk(id)
      if (!consume) {
        console.error(`Didn't find the consume with id:${id}`)
        return res.redirect('/drinks')
      }
      const customization = await Customization.findAll({ where: { consumeId: id } })
      if (consume && customization) {
        await consume.destroy()
        await Customization.destroy({ where: { consumeId: id } })
      } else {
        await consume.destroy()
      }
      return res.redirect('/drinks')
    } catch (err) {
      console.error(`Error occurred on drinkController.deleteDrink: ${err}`)
    }
  },
  checkoutDrinks: async (req, res) => {
    const userId = req.user.id
    try {
      const consumes = await Consume.findAll({
        raw: true,
        nest: true,
        where: { is_checked: false },
      })
      if (consumes.length === 0) {
        req.flash('danger_msg', '未選取任何餐點')
        return res.redirect('/drinks')
      }
      const user = await User.findByPk(userId)
      const newOrder = await Order.create({
        user_id: userId,
        shift_id: user.toJSON().shift_id,
        quantity: consumes.length,
        total_price: req.body.orderTotalPrice
      })
      const consumesIdList = consumes.map(consume => { return consume.id })
      await Consume.update({ is_checked: true, order_id: newOrder.toJSON().id }, { where: { id: consumesIdList } })
      return res.redirect('/drinks')
    } catch (err) {
      console.error(`Error occurred on drinkController.checkoutDrink: ${err}`)
    }
  },
  getOrders: async (req, res) => {

  }
}

module.exports = drinkController