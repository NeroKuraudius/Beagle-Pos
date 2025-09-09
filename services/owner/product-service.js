const { Category, User, Drink } = require('../../models')
const { Sequelize } = require('sequelize')
const sequelize = new Sequelize(process.env.DATABASE, process.env.DB_USERNAME, process.env.PASSWORD, { host: process.env.HOST, dialect: 'mysql' })

const productServices = {
  getBeverages: async (req, cb) => {
    try {
      const admin = await User.findOne({ where: { id: req.user.id }, attributes: ['name'], raw: true })
      const categories = await Category.findAll({ where: { isRemoved: false }, attributes: ['name'], raw: true, nest: true })
      const drinks = await Drink.findAll({
        where: { isDeleted: false },
        attributes: ['id', 'name', 'price'],
        include: [{ model: Category, attributes: ['name'] }],
        order: [['categoryId']],
        raw: true, nest: true
      })
      return cb(null, { admin, drinks, categories })
    } catch (err) {
      return cb(err)
    }
  },

  getBeverageData: async (req, cb) => {
    const id = parseInt(req.params.Did)
    try {
      const drink = await Drink.findOne({
        where: { id },
        attributes: ['id', 'name', 'price', 'categoryId'],
        include: [{ model: Category, attributes: ['name'] }],
        raw: true
      })
      if (!drink || drink.name.includes('(已下架)')) {
        const err = new Error('找不到該餐點相關資料')
        err.status = 404
        throw err
      }

      const admin = await User.findOne({ where: { id: req.user.id }, attributes: ['name'], raw: true })
      const drinks = await Drink.findAll({
        where: { isDeleted: false },
        attributes: ['id', 'name', 'price'],
        include: [{ model: Category, attributes: ['name'] }],
        order: [['categoryId']],
        raw: true, nest: true
      })
      const categories = await Category.findAll({ raw: true, nest: true, where: { isRemoved: false } })
      return cb(null, { admin, drink, drinks, categories })
    } catch (err) {
      return cb(err)
    }
  },

  patchBeverageData: async (req, cb) => {
    const { categoryId, name, price } = req.body
    const id = parseInt(req.params.Did)
    try {
      if (!categoryId || !name.trim() || !price.trim()) {
        const error = new Error('所有欄位皆為必填')
        error.status = 404
        throw error
      }

      const drink = await Drink.findByPk(id)
      if (!drink) {
        const error = new Error('找不到該餐點相關資料')
        error.status = 404
        throw error
      }
      const exsistedBeverage = await Drink.findOne({ where: { name }, raw: true })
      if (exsistedBeverage && (exsistedBeverage.id !== drink.toJSON().id)) {
        const error = new Error('該餐點已登錄')
        error.status = 404
        throw error
      }
      await drink.update({ categoryId, name, price })
      return cb(null)
    } catch (err) {
      return cb(err)
    }
  },

  createBeverage: async (req, cb) => {
    const { categoryId, name, price } = req.body
    try {
      if (!categoryId || !name.trim() || !price.trim()) {
        const error = new Error('所有欄位皆為必填')
        error.status = 404
        throw error
      }

      const exsistedBeverage = await Drink.findOne({ where: { name } })
      if (exsistedBeverage) {
        const error = new Error('該餐點已登錄')
        error.status = 404
        throw error
      }

      const newDrink = await Drink.create({ categoryId, name, price })
      return cb(null, { newDrink })
    } catch (err) {
      return cb(err)
    }
  },

  deleteBeverage: async (req, cb) => {
    const id = parseInt(req.params.Did)
    try {
      const drink = await Drink.findByPk(id)
      if (!drink || drink.toJSON().name.includes('(已下架)')) {
        const error = new Error('找不到該餐點相關資料')
        error.status = 404
        throw error
      }

      const name = drink.toJSON().name + '(已下架)'
      const deleteDrink = await drink.update({ isDeleted: true, name })
      return cb(null, { deleteDrink })
    } catch (err) {
      return cb(err)
    }
  }
}

module.exports = productServices