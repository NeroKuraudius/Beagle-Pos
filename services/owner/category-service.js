const { Category, User, Drink } = require('../../models')
const { Sequelize } = require('sequelize')
const sequelize = new Sequelize(process.env.DATABASE, process.env.DB_USERNAME, process.env.PASSWORD, { host: process.env.HOST, dialect: 'mysql' })

const categoryServices = {
  getCategories: async (req, cb) => {
    try {
      const [ categories, admin ] = await Promise.all([
        await Category.findAll({ where: { isRemoved: false }, attributes: ['id', 'name'], raw: true, nest: true }),
        await User.findOne({ where: { id: req.user.id }, attributes: ['name'], raw: true })
      ])

      return cb(null, { categories, admin })
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

      const [ categories, admin ] = await Promise.all([
        await Category.findAll({ where: { isRemoved: false }, attributes: ['id', 'name'], raw: true, nest: true }),
        await User.findOne({ where: { id: req.user.id }, attributes: ['name'], raw: true })
      ])

      return cb(null, { category, categories, admin })
    } catch (err) {
      return cb(err)
    }
  },

  patchCategoryData: async (req, cb) => {
    const id = parseInt(req.params.Cid)

    const { name } = req.body
    const trimName = name.trim()
    try {
      if (!trimName) {
        const error = new Error('欄位不得為空')
        error.status = 400
        throw error
      }

      const result = await sequelize.transaction(async(t)=>{
        const category = await Category.findByPk(id, { transaction: t })
        if (!category) {
          const error = new Error('找不到該類別相關資料')
          error.status = 404
          throw error
        }

        const existedCategory = await Category.findOne({ where: { name: trimName }, raw: true, transaction: t })
        if (existedCategory && (category.toJSON().id !== existedCategory.id)) {
          const error = new Error('該類別已存在')
          error.status = 400
          throw error
        }
        await category.update({ name: trimName }, { transaction: t })
      })
      return cb(null)
    } catch (err) {
      return cb(err)
    }
  },

  createCategory: async (req, cb) => {
    const { name } = req.body
    const trimName = name.trim()
    try {
      if (!trimName) {
        const error = new Error('欄位不得為空')
        error.status = 400
        throw error
      }

      const result = await sequelize.transaction(async(t)=>{
        const existedCategory = await Category.findOne({ where: { name: trimName }, transaction: t })
        if (existedCategory) {
          const error = new Error('該類別已存在')
          error.status = 400
          throw error
        }

        const newCategory = await Category.create({ name: trimName }, { transaction: t })
        return { newCategory }
      })
      
      return cb(null, result)
    } catch (err) {
      return cb(err)
    }
  },

  deleteCategory: async (req, cb) => {
    const id = parseInt(req.params.Cid)
    try {
      const result = await sequelize.transaction(async(t)=>{
        const category = await Category.findByPk(id, { transaction: t })
        if (!category) {
          const error = new Error('找不到該類別相關資料')
          error.status = 404
          throw error
        }

        const drinksCount = await Drink.count({ where: { categoryId: id, isDeleted: false }, transaction: t })
        if (drinksCount > 0) {
          const error = new Error('該類別中尚有餐點')
          error.status = 400
          throw error
        }

        const deleteCategory = await category.update({ isRemoved: true }, { transaction: t })
        return { deleteCategory }
      }) 
      
      return cb(null, result)
    } catch (err) {
      return cb(err)
    }
  }
}

module.exports = categoryServices