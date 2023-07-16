const { Category, Drink, Ice } = require('../models')
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
      const drinks = await Drink.findAndCountAll({
        raw: true,
        nest: true,
        where: { ...categoryId ? { categoryId } : {} },
        limit,
        offset
      })
      const pagination = getPagination(limit, page, drinks.count)

      return res.render('drinks', { categoryId, categories, ices,drinks: drinks.rows, pagination })
    } catch (err) {
      console.error(`Data search error: ${err}`)
    }
  }
}

module.exports = drinkController