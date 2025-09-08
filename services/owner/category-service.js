const { Category, User, Drink } = require('../../models')
const { Sequelize } = require('sequelize')
const sequelize = new Sequelize(process.env.DATABASE, process.env.DB_USERNAME, process.env.PASSWORD, { host: process.env.HOST, dialect: 'mysql' })

const categoryServices = {
  getCategories: async (req, cb) => {
    try {
      const admin = await User.findOne({ where: { id: req.user.id }, attributes: ['name'], raw: true })
      const categories = await Category.findAll({ where: { isRemoved: false }, attributes: ['id', 'name'], raw: true, nest: true })
      return cb(null, { admin, categories })
    } catch (err) {
      return cb(err)
    }
  },

  getCategoryData: async (req, cb) => {
    const id = parseInt(req.params.Cid)
    try {
      const category = await Category.findOne({ where: { id }, attributes: ['id', 'name'], raw: true })
      if (!category) {
        const error = new Error('找不到此項類別')
        error.status = 404
        throw error
      }
      const admin = await User.findOne({ where: { id: req.user.id }, attributes: ['name'], raw: true })
      const categories = await Category.findAll({ where: { isRemoved: false }, attributes: ['id', 'name'], raw: true, nest: true })
      return cb(null, { admin, categories, category })
    } catch (err) {
      return cb(err)
    }
  },

  patchCategoryData: async (req, cb) => {
    const { name } = req.body
    const id = parseInt(req.params.Cid)
    try {
      if (!name.trim()) {
        const error = new Error('欄位不得為空')
        error.status = 404
        throw error
      }

      const category = await Category.findByPk(id)
      if (!category) {
        const error = new Error('找不到該類別相關資料')
        error.status = 404
        throw error
      }
      const existedCategory = await Category.findOne({ where: { name } }, { raw: true })
      if (existedCategory && (category.toJSON().id !== existedCategory.id)) {
        const error = new Error('該類別已存在')
        error.status = 404
        throw error
      }
      await category.update({ name })
      return cb(null)
    } catch (err) {
      return cb(err)
    }
  },

  createCategory: async (req, cb) => {
    const { name } = req.body
    try {
      if (!name.trim()) {
        const error = new Error('欄位不得為空')
        error.status = 404
        throw error
      }

      const existedCategory = await Category.findOne({ where: { name } })
      if (existedCategory) {
        const error = new Error('該類別已存在')
        error.status = 404
        throw error
      }
      const newCategory = await Category.create({ name })
      return cb(null, { newCategory })
    } catch (err) {
      return cb(err)
    }
  },

  deleteCategory: async (req, cb) => {
    const id = parseInt(req.params.Cid)
    try {
      const category = await Category.findByPk(id)
      if (!category) {
        const error = new Error('找不到該類別相關資料')
        error.status = 404
        throw error
      }
      const drinks = await Drink.findAll({ where: { categoryId: id, isDeleted: false } })
      if (drinks.length !== 0) {
        const error = new Error('該類別中尚有餐點')
        error.status = 404
        throw error
      }
      const deleteCategory = await category.update({ isRemoved: true })
      return cb(null, { deleteCategory })
    } catch (err) {
      return cb(err)
    }
  }
}

module.exports = categoryServices