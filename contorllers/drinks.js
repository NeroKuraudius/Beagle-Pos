const { Category, Drink, Ice, Sugar, Topping, Consume, Customization } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helpers')

const drinkController = {
  // 前台操作首頁
  getDrinks: async (req, res, next) => {
    const limit = 5
    const page = parseInt(req.query.page) || 1
    const offset = getOffset(limit, page)

    const categoryId = parseInt(req.query.categoryId) || ''
    try {
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
      const pagination = getPagination(limit, page, drinks.count)

      const consumes = await Consume.findAll({
        include: [
          { model: Drink },
          { model: Ice },
          { model: Sugar },
          { model: Topping, as: 'addToppings' },
        ]
      })
      const consumesList = consumes.map(consume => {
        const { Drink, Ice, Sugar, addToppings, ...consumeData } = consume.toJSON()
        let totalPrice = 0
        if (addToppings.length !== 0){
          
        }
        consumeData.drinkName = Drink.name
        consumeData.iceName = Ice.name
        consumeData.sugarName = Sugar.name
        consumeData
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
  addDrink: async (req, res, next) => {
    const { drink, ice, sugar, topping } = req.body
    // 飲品不得為空
    if (!drink) {
      req.flash('danger_msg', '請選擇飲品')
      return res.redirect('/drinks')
    }

    try {
      const drinkPrice = await Drink.findByPk(drink)
      const newConsume = await Consume.create({
        drink_name: drink,
        drink_ice: ice,
        drink_sugar: sugar,
        drink_price: drinkPrice.toJSON().price
      })

      const consumeId = await newConsume.toJSON().id
      if (topping.length > 1) {
        for (let i = 0; i < topping.length; i++) {
          const customizedToppings = await Topping.findByPk(topping[i])
          await Customization.create({
            consumeId,
            toppingId: topping[i],
            topping_price: customizedToppings.toJSON().price
          })
        }
      } else if (topping.length === 1) {
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
  }
}

module.exports = drinkController