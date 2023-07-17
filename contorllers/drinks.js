const { Category, Drink, Ice, Sugar, Topping, Consume, Customization } = require('../models')
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
      const consumes = await Consume.findAll({
        include: [
          { model: Drink, attribute: ['name'] },
          { model: Ice },
          { model: Sugar },
          { model: Topping, as: 'addToppings' }
        ]
      })
      const drinks = await Drink.findAndCountAll({
        raw: true,
        nest: true,
        where: { ...categoryId ? { categoryId } : {} },
        limit,
        offset
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

      return res.render('drinks', {
        categoryId,
        categories,
        ices,
        sugars,
        toppings,
        drinks: drinks.rows,
        pagination,
        consumesList
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
        drink_price: consumeDrink.toJSON().price
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
  }

}

module.exports = drinkController