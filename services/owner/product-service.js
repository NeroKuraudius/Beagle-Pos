const { Category, User, Drink } = require('../../models')
const { Sequelize } = require('sequelize')
const sequelize = new Sequelize(process.env.DATABASE, process.env.DB_USERNAME, process.env.PASSWORD, { host: process.env.HOST, dialect: 'mysql' })

const productServices = {
  getBeverages: async (req, cb) => {
    try {
      const [ admin, categories, drinks ] = await Promise.all([
        User.findOne({ where: { id: req.user.id }, attributes: ['name'], raw: true }),

        Category.findAll({ where: { isRemoved: false }, attributes: ['name'], raw: true }),

        Drink.findAll({
          where: { isDeleted: false },
          attributes: ['id', 'name', 'price'],
          include: [{ model: Category, attributes: ['name'] }],
          order: [['categoryId']],
          raw: true, nest: true
        })
      ])

      return cb(null, { admin, categories, drinks })
    } catch (err) {
      if (!err.status) err.status = 500
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
        raw: true, nest: true
      })
      if (!drink || drink.name.includes('(已下架)')) {
        const err = new Error('找不到該餐點相關資料')
        err.status = 404
        throw err
      }

      const [ drinks, admin, categories ] = await Promise.all([
        Drink.findAll({
          where: { isDeleted: false },
          attributes: ['id', 'name', 'price'],
          include: [{ model: Category, attributes: ['name'] }],
          order: [['categoryId']],
          raw: true, nest: true
        }),

        User.findOne({ where: { id: req.user.id }, attributes: ['name'], raw: true }),

        Category.findAll({ raw: true, where: { isRemoved: false } })
      ])

      return cb(null, { drink, drinks, admin, categories })
    } catch (err) {
      if (!err.status) err.status = 500
      return cb(err)
    }
  },

  patchBeverageData: async (req, cb) => {
    const { categoryId, name, price } = req.body
    const [ trimName, trimPrice ] = [ name.trim(), price.trim() ]
    const id = parseInt(req.params.Did)
    try {
      if (!categoryId || !trimName || !trimPrice) {
        const error = new Error('所有欄位皆為必填')
        error.status = 400
        throw error
      }

      const result = await sequelize.transaction(async(t)=>{
        const drink = await Drink.findByPk(id, { transaction: t })
        if (!drink) {
          const error = new Error('找不到該餐點相關資料')
          error.status = 404
          throw error
        }

        const existingBeverageWithName = await Drink.findOne({
            where: {
                name: trimName,
                id: { [Op.ne]: id } // Op.ne: Not equal (不等於)
            },
            transaction: t
        })
        if (existingBeverageWithName) {
          const error = new Error('該餐點已登錄')
          error.status = 400
          throw error
        }

        await drink.update({ categoryId, name: trimName, price: parseInt(trimPrice) }, { transaction: t })
      })
      
      return cb(null)
    } catch (err) {
      if (!err.status) err.status = 500
      return cb(err)
    }
  },

  createBeverage: async (req, cb) => {
    const { categoryId, name, price } = req.body
    const [ trimName, trimPrice ] = [ name.trim(), price.trim() ]
    try {
      if (!categoryId || !trimName || !trimPrice) {
        const error = new Error('所有欄位皆為必填')
        error.status = 400
        throw error
      }

      const result = await sequelize.transaction(async(t)=>{
        const exsistedBeverage = await Drink.findOne({ where: { name }, attributes: ['id'], transaction: t })
        if (exsistedBeverage) {
          const error = new Error('該餐點已登錄')
          error.status = 400
          throw error
        }

        const newDrink = await Drink.create({ categoryId, name: trimName, price: parseInt(trimPrice) }, { transaction: t })
        return { newDrink }
      })
      
      return cb(null, result)
    } catch (err) {
      if (!err.status) err.status = 500
      return cb(err)
    }
  },

  deleteBeverage: async (req, cb) => {
    const id = parseInt(req.params.Did)
    try {
      const result = await sequelize.transaction(async(t)=>{
        const drink = await Drink.findByPk(id, { transaction: t })
        if (!drink || drink.toJSON().name.includes('(已下架)')) {
          const error = new Error('找不到該餐點相關資料')
          error.status = 404
          throw error
        }

        const removedName = drink.toJSON().name + '(已下架)'
        const deleteDrink = await drink.update({ isDeleted: true, name: removedName }, { transaction: t })
        return { deleteDrink }
      })
      
      return cb(null, result)
    } catch (err) {
      if (!err.status) err.status = 500
      return cb(err)
    }
  }
}

module.exports = productServices