const { User, Shift, Income, Order, Consume,
  Drink, Ice, Sugar, Topping, Category } = require('../models')
const bcrypt = require('bcryptjs')
const { Sequelize } = require('sequelize')
const sequelize = new Sequelize(process.env.DATABASE, process.env.USERNAME, process.env.PASSWORD, { host: process.env.HOST, dialect: 'mysql' })

const ownerServices = {
  getIncomes: async (req, cb) => {
    try {
      const admin = await User.findByPk(req.user.id, { raw: true })
      const incomes = await Income.findAll({
        raw: true,
        nest: true,
        include: [{
          model: User,
          include: [Shift]
        }],
        order: [['createdAt', 'DESC']]
      })
      return cb(null, { admin, incomes })
    } catch (err) {
      cb(err)
    }
  },
  getOrders: async (req, cb) => {
    const incomeId = parseInt(req.params.Iid)
    try {
      const admin = await User.findByPk(req.user.id, { raw: true })
      const incomes = await Income.findAll({
        raw: true,
        nest: true,
        include: [{
          model: User,
          include: [Shift]
        }],
        order: [['createdAt', 'DESC']]
      })
      const orders = await Order.findAll({
        raw: true,
        nest: true,
        where: { incomeId },
        order: [['createdAt', 'DESC']]
      })
      return cb(null, { admin, incomeId, incomes, orders })
    } catch (err) {
      cb(err)
    }
  },
  getConsumes: async (req, cb) => {
    const { Iid, Oid } = req.params
    try {
      const admin = await User.findByPk(req.user.id, { raw: true })
      const incomes = await Income.findAll({
        raw: true,
        nest: true,
        include: [{
          model: User,
          include: [Shift]
        }],
        order: [['createdAt', 'DESC']]
      })
      const orders = await Order.findAll({
        raw: true,
        nest: true,
        where: { incomeId: parseInt(Iid) },
        order: [['createdAt', 'DESC']]
      })
      const consumes = await Consume.findAll({
        where: { orderId: parseInt(Oid) },
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
        consumeData.iceName = Ice.name
        consumeData.sugarName = Sugar.name
        consumeData.allToppings = toppingsNameList
        consumeData.totalPrice = toppingsPrice + Drink.price
        return consumeData
      })
      return cb(null, {
        admin, incomes, orders, consumes: consumesList,
        incomeId: parseInt(Iid), orderId: parseInt(Oid)
      })
    } catch (err) {
      cb(err)
    }
  },
  getStaffs: async (req, cb) => {
    try {
      const admin = await User.findByPk(req.user.id, { raw: true })
      const users = await User.findAll({
        raw: true,
        nest: true,
        where: { role: 'staff' },
        include: [Shift]
      })
      return cb(null, { users, admin })
    } catch (err) {
      cb(err)
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

      if (user.toJSON().shiftId === 1) {
        const shiftChangedUser = await user.update({ shiftId: 2 })
      } else {
        const shiftChangedUser = await user.update({ shiftId: 1 })
      }
      return cb(null, { shiftChangedUser })
    } catch (err) {
      cb(err)
    }
  },
  getStaffData: async (req, cb) => {
    const id = parseInt(req.params.Uid)
    try {
      const users = await User.findAll({
        raw: true,
        nest: true,
        where: { role: 'staff' },
        include: [Shift]
      })
      const admin = await User.findByPk(req.user.id, { raw: true })
      const staff = await User.findByPk(id, { raw: true })
      return cb(null, { users, admin, staff })
    } catch (err) {
      cb(err)
    }
  },
  patchStaffData: async (req, cb) => {
    const { name, phone, account, password, checkPassword } = req.body
    if (!name.trim() || !phone.trim() || !account.trim()) {
      const err = new Error()
      err.status = 404
      err.message = '缺少必填資料'
      throw err
    }
    if (password !== checkPassword) {
      const err = new Error()
      err.status = 404
      err.message = '密碼不一致'
      throw err
    }
    const id = parseInt(req.params.Uid)
    try {
      const usedAccount = await User.findOne({ where: { account } }, { raw: true })
      const editingUser = await User.findByPk(id, { raw: true })
      if (usedAccount && (usedAccount.id !== editingUser.id)) {
        const err = new Error()
        err.status = 404
        err.message = '該帳號已被使用'
        throw err
      }
      const hash = await bcrypt.hash(password, 12)
      const updatedUser = await User.update({ name, phone, account, password: hash }, { where: { id } })
      return cb(null, { updatedUser })
    } catch (err) {
      cb(err)
    }
  },
  deleteStaff: async (req, cb) => {
    const id = parseInt(req.params.Uid)
    try {
      const user = await User.findByPk(id)
      if (!user) {
        const err = new Error('缺少必填資料')
        err.status = 404
        throw err
      }
      const name = user.toJSON().name + '(已離職)'
      const deletedUser = await user.update({ role: 'quitted', name })
      return cb(null, { deletedUser })
    } catch (err) {
      cb(err)
    }
  },
  createStaff: async (req, cb) => {
    const { name, phone, account, password, checkPassword, shiftId } = req.body
    if (!name.trim() || !phone.trim() || !account.trim()) {
      const err = new Error()
      err.status = 404
      err.message = '所有欄位皆為必填'
      throw err
    }
    if (password !== checkPassword) {
      const err = new Error()
      err.status = 404
      err.message = '兩次輸入的密碼不相符'
      throw err
    }
    try {
      const userdAccount = await User.findOne({ where: { account } })
      const error = []
      if (userdAccount) {
        const users = await User.findAll({
          raw: true,
          nest: true,
          where: { role: 'staff' },
          include: [Shift]
        })
        err.push('該帳號已被使用')
        const admin = await User.findByPk(req.user.id, { raw: true })
        return cb(null, { error, users, name, phone, account, password, checkPassword, shiftId, admin })
      }
      const hash = await bcrypt.hash(password, 12)
      const newUser = await User.create({ name, phone, account, shiftId, password: hash, role: 'staff' })
      return cb(null, { newUser })
    } catch (err) {
      cb(err)
    }
  },
  getBeverages: async (req, cb) => {
    try {
      const admin = await User.findByPk(req.user.id, { raw: true })
      const categories = await Category.findAll({ raw: true, nest: true, where: { isRemoved: false } })
      const drinks = await Drink.findAll({
        raw: true,
        nest: true,
        where: { isDeleted: false },
        include: [Category],
        order: [['categoryId']]
      })
      return res.render('owner/beverages', { admin, drinks, categories })
    } catch (err) {
      console.error(`Error occupied on ownerControll.getBeverages: ${err}`)
    }
  },
  getBeverageData: async (req, cb) => {
    const id = parseInt(req.params.Did)
    try {
      const drink = await Drink.findByPk(id, { raw: true })
      if (!drink) {
        req.flash('danger_msg', '找不到該餐點相關資料')
        return res.redirect('/owner/beverages')
      }
      const admin = await User.findByPk(req.user.id, { raw: true })
      const drinks = await Drink.findAll({
        raw: true,
        nest: true,
        where: { isDeleted: false },
        include: [Category],
        order: [['categoryId']]
      })
      const categories = await Category.findAll({ raw: true, nest: true, where: { isRemoved: false } })
      return res.render('owner/beverages', { admin, drink, drinks, categories })
    } catch (err) {
      console.error(`Error occupied on ownerControll.getBeverageData: ${err}`)
    }
  },
  patchBeverageData: async (req, cb) => {
    const { categoryId, name, price } = req.body
    if (!categoryId || !name.trim() || !price.trim()) {
      req.flash('danger_msg', '所有欄位皆為必填')
      return res.redirect(`/owner/beverages/${id}`)
    }
    const id = parseInt(req.params.Did)
    try {
      const drink = await Drink.findByPk(id)
      if (!drink) {
        req.flash('danger_msg', '找不到該餐點相關資料')
        return res.redirect('/owner/beverages')
      }
      const exsistedBeverage = await Drink.findOne({ where: { name } }, { raw: true })
      if (exsistedBeverage && (exsistedBeverage.id !== drink.toJSON().id)) {
        req.flash('danger_msg', '該餐點已登錄')
        return res.redirect(`/owner/beverages/${id}`)
      }
      await drink.update({ categoryId, name, price })
      req.flash('success_msg', '餐點修改成功')
      return res.redirect('/owner/beverages')
    } catch (err) {
      console.error(`Error occupied on ownerControll.patchBeverageData: ${err}`)
    }
  },
  createBeverage: async (req, cb) => {
    const { categoryId, name, price } = req.body
    if (!categoryId || !name.trim() || !price.trim()) {
      req.flash('danger_msg', '所有欄位皆為必填')
      return res.redirect(`/owner/beverages`)
    }
    try {
      const error = []
      const exsistedBeverage = await Drink.findOne({ where: { name } })
      if (exsistedBeverage) {
        error.push('該餐點已登錄')
        const admin = await User.findByPk(req.user.id, { raw: true })
        const drinks = await Drink.findAll({
          raw: true,
          nest: true,
          where: { isDeleted: false },
          include: [Category],
          order: [['categoryId']]
        })
        const categories = await Category.findAll({ raw: true, nest: true, where: { isRemoved: false } })
        return res.render('owner/beverages', { categoryId, name, price, admin, drinks, categories, error })
      }
      await Drink.create({ categoryId, name, price })
      req.flash('success_msg', '餐點新增成功')
      return res.redirect('/owner/beverages')
    } catch (err) {
      console.error(`Error occupied on ownerControll.createBeverage: ${err}`)
    }
  },
  deleteBeverage: async (req, cb) => {
    const id = parseInt(req.params.Did)
    try {
      const drink = await Drink.findByPk(id)
      if (!drink) {
        req.flash('danger_msg', '找不到該餐點相關資料')
        return res.redirect('/owner/beverages')
      }
      const name = drink.toJSON().name + '(已下架)'
      await drink.update({ isDeleted: true, name })
      req.flash('success_msg', '餐點下架成功')
      return res.redirect('/owner/beverages')
    } catch (err) {
      console.error(`Error occupied on ownerControll.deleteBeverage: ${err}`)
    }
  },
  getCategories: async (req, cb) => {
    try {
      const admin = await User.findByPk(req.user.id, { raw: true })
      const categories = await Category.findAll({ raw: true, nest: true, where: { isRemoved: false } })
      return res.render('owner/categories', { admin, categories })
    } catch (err) {
      console.error(`Error occupied on ownerControll.getCategories: ${err}`)
    }
  },
  getCategoryData: async (req, cb) => {
    const id = parseInt(req.params.Cid)
    try {
      const category = await Category.findByPk(id, { raw: true })
      if (!category) {
        req.flash('danger_msg', '找不到該類別相關資料')
        return res.redirect('/owner/categories')
      }
      const admin = await User.findByPk(req.user.id, { raw: true })
      const categories = await Category.findAll({ raw: true, nest: true, where: { isRemoved: false } })
      return res.render('owner/categories', { admin, categories, category })
    } catch (err) {
      console.error(`Error occupied on ownerControll.getCategoryData: ${err}`)
    }
  },
  patchCategoryData: async (req, cb) => {
    const { name } = req.body
    if (!name.trim()) {
      req.flash('danger_msg', '欄位不得為空')
      return res.redirect(`/owner/categories/${id}`)
    }
    const id = parseInt(req.params.Cid)
    try {
      const category = await Category.findByPk(id)
      if (!category) {
        req.flash('danger_msg', '找不到該類別相關資料')
        return res.redirect('/owner/categories')
      }
      const existedCategory = await Category.findOne({ where: { name } }, { raw: true })
      if (existedCategory && (category.toJSON().id !== existedCategory.id)) {
        req.flash('danger_msg', '該類別資料已建立')
        return res.redirect(`/owner/categories/${id}`)
      }
      await category.update({ name })
      req.flash('success_msg', '類別資料修改成功')
      return res.redirect('/owner/categories')
    } catch (err) {
      console.error(`Error occupied on ownerControll.patchCategoryData: ${err}`)
    }
  },
  createCategory: async (req, cb) => {
    const { name } = req.body
    if (!name.trim()) {
      req.flash('danger_msg', '欄位不得為空')
      return res.redirect('/owner/categories')
    }
    try {
      const existedCategory = await Category.findOne({ where: { name } })
      if (existedCategory) {
        req.flash('danger_msg', '該類別資料已建立')
        return res.redirect(`/owner/categories`)
      }
      await Category.create({ name })
      req.flash('success_msg', '類別新增成功')
      return res.redirect('/owner/categories')
    } catch (err) {
      console.error(`Error occupied on ownerControll.createCategory: ${err}`)
    }
  },
  deleteCategory: async (req, cb) => {
    const id = parseInt(req.params.Cid)
    try {
      const category = await Category.findByPk(id)
      if (!category) {
        req.flash('danger_msg', '找不到該類別相關資料')
        return res.redirect('/owner/categories')
      }
      const drinks = await Drink.findAll({ where: { categoryId: id, isDeleted: false } })
      if (drinks.length !== 0) {
        req.flash('danger_msg', '該類別中尚有餐點')
        return res.redirect('/owner/categories')
      }
      await category.update({ isRemoved: true })
      req.flash('ssuccess_msg', '類別刪除成功')
      return res.redirect('/owner/categories')
    } catch (err) {
      console.error(`Error occupied on ownerControll.deleteCategory: ${err}`)
    }
  }
}

module.exports = ownerServices