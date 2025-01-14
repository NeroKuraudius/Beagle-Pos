const { User, Shift, Income, Order, Consume,
  Drink, Ice, Sugar, Topping, Category } = require('../models')
const bcrypt = require('bcryptjs')
const { Sequelize } = require('sequelize')
const sequelize = new Sequelize(process.env.DATABASE, process.env.DB_USERNAME, process.env.PASSWORD, { host: process.env.HOST, dialect: 'mysql' })

const ownerServices = {
  getIncomes: async (req, cb) => {
    try {
      const admin = await User.findOne({ where: { id: req.user.id }, attributes: ['name'], raw: true })
      const incomes = await Income.findAll({
        attributes: ['id', 'quantity', 'income', 'createdAt'],
        include: [{
          model: User,
          attributes: ['name'],
          include: [{ model: Shift, attributes: ['name'] }]
        }],
        order: [['createdAt', 'DESC']],
        raw: true, nest: true,
      })
      return cb(null, { admin, incomes })
    } catch (err) {
      return cb(err)
    }
  },
  getOrders: async (req, cb) => {
    const incomeId = parseInt(req.params.Iid)
    try {
      const admin = await User.findOne({ where: { id: req.user.id }, attributes: ['name'], raw: true })
      const incomes = await Income.findAll({
        attributes: ['id', 'quantity', 'income', 'createdAt'],
        include: [{
          model: User,
          attributes: ['name'],
          include: [{ model: Shift, attributes: ['name'] }]
        }],
        order: [['createdAt', 'DESC']],
        raw: true, nest: true,
      })
      const orders = await Order.findAll({
        attributes: ['id', 'quantity', 'totalPrice', 'incomeId', 'createdAt'],
        where: { incomeId },
        order: [['createdAt', 'DESC']],
        raw: true, nest: true
      })
      return cb(null, { admin, incomes, incomeId, orders })
    } catch (err) {
      return cb(err)
    }
  },
  getConsumes: async (req, cb) => {
    const { Iid, Oid } = req.params
    try {
      const admin = await User.findOne({ where: { id: req.user.id }, attributes: ['name'], raw: true })
      const incomes = await Income.findAll({
        attributes: ['id', 'quantity', 'income', 'createdAt'],
        include: [{
          model: User,
          attributes: ['name'],
          include: [{ model: Shift, attributes: ['name'] }]
        }],
        order: [['createdAt', 'DESC']],
        raw: true, nest: true,
      })
      const orders = await Order.findAll({
        attributes: ['id', 'quantity', 'totalPrice', 'incomeId', 'createdAt'],
        where: { incomeId: parseInt(Iid) },
        order: [['createdAt', 'DESC']],
        raw: true, nest: true
      })
      const consumes = await Consume.findAll({
        where: { orderId: parseInt(Oid) },
        attributes: ['drinkName', 'drinkIce', 'drinkSugar'],
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
        consumeData.drinkIce = Ice.name
        consumeData.drinkSugar = Sugar.name
        consumeData.allToppings = toppingsNameList
        consumeData.totalPrice = toppingsPrice + Drink.price
        return consumeData
      })
      return cb(null, {
        admin, incomes, incomeId: parseInt(Iid),
        orders, orderId: parseInt(Oid), consumes: consumesList
      })
    } catch (err) {
      return cb(err)
    }
  },
  getStaffs: async (req, cb) => {
    try {
      const admin = await User.findOne({ where: { id: req.user.id }, attributes: ['name'], raw: true })
      const users = await User.findAll({
        where: { role: 'staff' },
        attributes: ['id', 'name'],
        include: [{ model: Shift, attributes: ['name'] }],
        raw: true, nest: true
      })
      return cb(null, { users, admin })
    } catch (err) {
      return cb(err)
    }
  },
  putStaff: async (req, cb) => {
    const id = parseInt(req.params.Uid)
    try {
      const user = await User.findByPk(id)
      if (!user) {
        const err = new Error('查無該員工資料')
        err.status = 404
        throw err
      }

      let shiftChangedUser
      if (user.toJSON().shiftId === 1) {
        await user.update({ shiftId: 2 })
      } else {
        await user.update({ shiftId: 1 })
      }
      return cb(null)
    } catch (err) {
      return cb(err)
    }
  },
  getStaffData: async (req, cb) => {
    const id = parseInt(req.params.Uid)
    try {
      const staff = await User.findOne({ where: { id }, attributes: ['name', 'phone', 'account'], raw: true })
      if (!staff || staff.name.includes('(已離職)')) {
        const err = new Error('找不到該員工資料')
        err.status = 404
        throw err
      }

      const admin = await User.findOne({ where: { id: req.user.id }, attributes: ['name'], raw: true })
      const users = await User.findAll({
        where: { role: 'staff' },
        attributes: ['id', 'name'],
        include: [{ model: Shift, attributes: ['name'] }],
        raw: true, nest: true
      })
      return cb(null, { admin, users, staff })
    } catch (err) {
      return cb(err)
    }
  },
  patchStaffData: async (req, cb) => {
    const { name, phone, account, password, checkPassword } = req.body
    const id = parseInt(req.params.Uid)
    try {
      if (!name.trim() || !phone.trim() || !account.trim()) {
        const err = new Error('缺少必填資料')
        err.status = 404
        throw err
      }
      if (password !== checkPassword) {
        const err = new Error('密碼不一致')
        err.status = 404
        throw err
      }

      const usedAccount = await User.findOne({ where: { account } }, { raw: true })
      const editingUser = await User.findByPk(id, { raw: true })
      if (usedAccount && (usedAccount.id !== editingUser.id)) {
        const err = new Error('該帳號已被使用')
        err.status = 404
        throw err
      }
      const hash = await bcrypt.hash(password, 12)
      await User.update({ name, phone, account, password: hash }, { where: { id } })
      return cb(null)
    } catch (err) {
      return cb(err)
    }
  },
  createStaff: async (req, cb) => {
    const { name, phone, account, password, checkPassword, shiftId } = req.body
    try {
      if (!name.trim() || !phone.trim() || !account.trim() || !shiftId || !password.trim() || !checkPassword.trim()) {
        const err = new Error('所有欄位皆為必填')
        err.status = 404
        throw err
      }
      if (password !== checkPassword) {
        const err = new Error('兩次輸入的密碼不相符')
        err.status = 404
        throw err
      }

      const userdAccount = await User.findOne({ where: { account } })
      const errorMsg = []
      if (userdAccount) {
        const users = await User.findAll({
          where: { role: 'staff' },
          attributes: ['id', 'name'],
          include: [{ model: Shift, attributes: ['name'] }],
          raw: true, nest: true
        })
        errorMsg.push('該帳號已被使用')
        const admin = await User.findOne({ where: { id: req.user.id }, attributes: ['name'], raw: true })
        return cb(null, { errorMsg, admin, users, name, phone, account })
      }

      const hash = await bcrypt.hash(password, 12)
      let newUser = await User.create({ name, phone, account, shiftId, password: hash, role: 'staff' })
      newUser = newUser.toJSON()
      delete newUser.password

      return cb(null, { errorMsg, newUser })
    } catch (err) {
      return cb(err)
    }
  },
  deleteStaff: async (req, cb) => {
    const id = parseInt(req.params.Uid)
    try {
      const user = await User.findByPk(id)
      if (!user) {
        const err = new Error('查無該員工資料')
        err.status = 404
        throw err
      }
      if (user.toJSON().name.includes('(已離職)')) {
        const err = new Error('該員工已離職')
        err.status = 404
        throw err
      }

      const name = user.toJSON().name + '(已離職)'
      let deletedUser = await user.update({ role: 'quitted', name })
      deletedUser = deletedUser.toJSON()
      delete deletedUser.password

      return cb(null, { deletedUser })
    } catch (err) {
      return cb(err)
    }
  },
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
        attributes: ['name', 'price', 'categoryId'],
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
      const exsistedBeverage = await Drink.findOne({ where: { name } }, { raw: true })
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
  },
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

module.exports = ownerServices