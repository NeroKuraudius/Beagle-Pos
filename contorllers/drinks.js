const { Category, Drink } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helpers')

const drinkController = {
  // 前台操作首頁
  getDrinks: async (req, res, next) => {
    // const MAX_PAGE = 4
    // const page = parseInt(req.query.page) || 1
    // const limit = parseInt(req.query.limit) || MAX_PAGE
    // const offset = getOffset(limit, page)

    const categoryId = parseInt(req.query.categoryId) || ''
    try{
    const categories = await Category.findAll({ raw: true, nest: true })
    const drinks = await Drink.findAll({ 
      raw: true, 
      nest: true,
      where:{...categoryId ? { categoryId } : {}}
     })

    console.log(drinks)
    return res.render('drinks', { categoryId,categories,drinks })
    }catch(err){
      console.error(`Data search error: ${err}`)
    }
  }
}

module.exports = drinkController