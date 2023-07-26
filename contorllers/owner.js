const { User, Shift, Income, Order, Consume,
  Drink, Ice, Sugar, Topping, Category } = require('../models')
const bcrypt = require('bcryptjs')
const { Sequelize } = require('sequelize')
const sequelize = new Sequelize('pos', 'root', 'password', { host: '127.0.0.1', dialect: 'mysql' })

const ownerController = {
  signinPage: (req, res) => {
    return res.render('back-login')
  },
  signin: (req, res) => {
    return res.redirect('/owner/incomes')
  },
  getIncomes: async (req, res) => {
    try {
      const admin = await User.findByPk(req.user.id, { raw: true })
      const incomes = await Income.findAll({
        raw: true,
        nest: true,
        include: [{
          model: User,
          include: [Shift]
        }]
      })
      return res.render('owner/incomes', { admin, incomes })
    } catch (err) {
      console.error(`Error occupied on ownerControll.getIncomes: ${err}`)
    }
  },
  getOrders: async (req, res) => {
    const incomeId = parseInt(req.params.Iid)
    try {
      const admin = await User.findByPk(req.user.id, { raw: true })
      const incomes = await Income.findAll({
        raw: true,
        nest: true,
        include: [{
          model: User,
          include: [Shift]
        }]
      })
      const orders = await Order.findAll({
        raw: true,
        nest: true,
        where: { incomeId }
      })
      return res.render('owner/incomes', { admin, incomeId, incomes, orders })
    } catch (err) {
      console.error(`Error occupied on ownerControll.getOrders: ${err}`)
    }
  },
  getConsumes: async (req, res) => {
    const { Iid, Oid } = req.params
    try {
      const admin = await User.findByPk(req.user.id, { raw: true })
      const incomes = await Income.findAll({
        raw: true,
        nest: true,
        include: [{
          model: User,
          include: [Shift]
        }]
      })
      const orders = await Order.findAll({
        raw: true,
        nest: true,
        where: { incomeId: parseInt(Iid) }
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
      return res.render('owner/incomes', {
        admin, incomes, orders, consumes: consumesList,
        incomeId: parseInt(Iid), orderId: parseInt(Oid)
      })
    } catch (err) {
      console.error(`Error occupied on ownerControll.getConsumes: ${err}`)
    }
  },
  getStaffs: async (req, res) => {
    try {
      const admin = await User.findByPk(req.user.id, { raw: true })
      const users = await User.findAll({
        raw: true,
        nest: true,
        where: { role: 'staff' },
        include: [Shift]
      })
      return res.render('owner/staffs', { users, admin })
    } catch (err) {
      console.error(`Error occupied on ownerControll.getStaffs: ${err}`)
    }
  },
  putStaff: async (req, res) => {
    const id = parseInt(req.params.Uid)
    try {
      const user = await User.findByPk(id)
      if (!user) {
        req.flash('danger_msg', '查無該員工資料')
        return res.redirect('/owner/staffs')
      }

      if (user.toJSON().shiftId === 1) {
        await user.update({ shiftId: 2 })
      } else {
        await user.update({ shiftId: 1 })
      }
      req.flash('success_msg', '班別轉換成功')
      return res.redirect('/owner/staffs')
    } catch (err) {
      console.error(`Error occupied on ownerControll.putStaff: ${err}`)
    }
  },
  getStaffData: async (req, res) => {
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
      return res.render('owner/staffs', { users, admin, staff })
    } catch (err) {
      console.error(`Error occupied on ownerControll.getStaffData: ${err}`)
    }
  },
  patchStaffData: async (req, res) => {
    const id = parseInt(req.params.Uid)
    const { name, phone, account, password, checkPassword } = req.body
    if (!name.trim() || !phone.trim() || !account.trim()) {
      req.flash('danger_msg', '所有欄位皆為必填')
      return res.redirect(`/owner/staffs/${id}`)
    }
    if (password !== checkPassword) {
      req.flash('danger_msg', '兩次輸入的密碼不相符')
      return res.redirect(`/owner/staffs/${id}`)
    }
    try {
      const usedAccount = await User.findOne({ where: { account } }, { raw: true })
      const editingUser = await User.findByPk(id, { raw: true })
      if (usedAccount && (usedAccount.id !== editingUser.id)) {
        req.flash('danger_msg', '該帳號已被使用')
        return res.redirect(`/owner/staffs/${id}`)
      }
      const hash = await bcrypt.hash(password, 12)
      await User.update({ name, phone, account, password: hash }, { where: { id } })
      req.flash('success_msg', '資料更新成功')
      return res.redirect(`/owner/staffs/${id}`)
    } catch (err) {
      console.error(`Error occupied on ownerControll.patchStaffData: ${err}`)
    }
  },
  deleteStaff: async (req, res) => {
    const id = parseInt(req.params.Uid)
    try {
      const user = await User.findByPk(id)
      if (!user) {
        req.flash('danger_msg', '查無該員工資料')
        return res.redirect('/owner/staffs')
      }
      const name = user.toJSON().name + '(已離職)'
      await user.update({ role: 'quitted', name })
      req.flash('success_msg', '已移除該員工')
      return res.redirect('/owner/staffs')
    } catch (err) {
      console.error(`Error occupied on ownerControll.deleteStaff: ${err}`)
    }
  },
  createStaff: async (req, res) => {
    const { name, phone, account, password, checkPassword, shiftId } = req.body
    if (!name.trim() || !phone.trim() || !account.trim()) {
      req.flash('danger_msg', '所有欄位皆為必填')
      return res.redirect('/owner/staffs')
    }
    if (password !== checkPassword) {
      req.flash('danger_msg', '兩次輸入的密碼不相符')
      return res.redirect(`/owner/staffs/${id}`)
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
        error.push('該帳號已被使用')
        const admin = await User.findByPk(req.user.id, { raw: true })
        return res.render('owner/staffs', { error, users, name, phone, account, password, checkPassword, shiftId, admin })
      }
      const hash = await bcrypt.hash(password, 12)
      await User.create({ name, phone, account, shiftId, password: hash, role: 'staff' })
      req.flash('success_msg', '資料建立成功')
      return res.redirect('/owner/staffs')
    } catch (err) {
      console.error(`Error occupied on ownerControll.createStaff: ${err}`)
    }
  },
  getBeverages: async (req, res) => {
    try {
      const admin = await User.findByPk(req.user.id, { raw: true })
      const categories = await Category.findAll({ raw: true, nest: true })
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
  getBeverageData: async (req, res) => {
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
        include: [Category],
        order: [['categoryId']]
      })
      const categories = await Category.findAll({ raw: true, nest: true })
      return res.render('owner/beverages', { admin, drink, drinks, categories })
    } catch (err) {
      console.error(`Error occupied on ownerControll.getBeverageData: ${err}`)
    }
  },
  patchBeverageData: async (req, res) => {
    const id = parseInt(req.params.Did)
    const { categoryId, name, price } = req.body
    if (!categoryId || !name.trim() || !price.trim()) {
      req.flash('danger_msg', '所有欄位皆為必填')
      return res.redirect(`/owner/beverages/${id}`)
    }
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
  createBeverage: async (req, res) => {
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
          include: [Category],
          order: [['categoryId']]
        })
        const categories = await Category.findAll({ raw: true, nest: true })
        return res.render('owner/beverages', { categoryId, name, price, admin, drinks, categories, error })
      }
      await Drink.create({ categoryId, name, price })
      req.flash('success_msg', '餐點新增成功')
      return res.redirect('/owner/beverages')
    } catch (err) {
      console.error(`Error occupied on ownerControll.createBeverage: ${err}`)
    }
  },
  deleteBeverage: async (req, res) => {
    const id = parseInt(req.params.Did)
    try {
      const drink = await Drink.findByPk(id)
      if (!drink) {
        req.flash('danger_msg', '找不到該餐點相關資料')
        return res.redirect('/owner/beverages')
      }
      await drink.update({ isDeleted: true })
      req.flash('success_msg', '餐點刪除成功')
      return res.redirect('/owner/beverages')
    } catch (err) {
      console.error(`Error occupied on ownerControll.deleteBeverage: ${err}`)
    }
  },
  getCategories: async (req, res) => {
    try {
      const admin = await User.findByPk(req.user.id, { raw: true })
      const categories = await Category.findAll({ raw: true, nest: true })
      return res.render('owner/categories', { admin, categories })
    } catch (err) {
      console.error(`Error occupied on ownerControll.getCategories: ${err}`)
    }
  },
  getCategoryData: async (req, res) => {
    const id = parseInt(req.params.Cid)
    try {
      const category = await Category.findByPk(id, { raw: true })
      if (!category) {
        req.flash('danger_msg', '找不到該類別相關資料')
        return res.redirect('/owner/categories')
      }
      const admin = await User.findByPk(req.user.id, { raw: true })
      const categories = await Category.findAll({ raw: true, nest: true })
      return res.render('owner/categories', { admin, categories, category })
    } catch (err) {
      console.error(`Error occupied on ownerControll.getCategoryData: ${err}`)
    }
  },
  patchCategoryData: async (req, res) => {
    const id = parseInt(req.params.Cid)
    const { name } = req.body
    if (!name.trim()) {
      req.flash('danger_msg', '欄位不得為空')
      return res.redirect(`/owner/categories/${id}`)
    }
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
  createCategory: async (req, res) => {
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
  deleteCategory: async (req, res) => {
    const id = parseInt(req.params.Cid)
    try {
      const category = await Category.findByPk(id)
      if (!category) {
        req.flash('danger_msg', '找不到該類別相關資料')
        return res.redirect('/owner/categories')
      }
      const drinks = await Drink.findAll({ where: { categoryId: id } })
      if (drinks.length !== 0) {
        req.flash('danger_msg', '該類別中尚有餐點')
        return res.redirect('/owner/categories')
      }
      await category.destroy()
      req.flash('ssuccess_msg', '類別刪除成功')
      return res.redirect('/owner/categories')
    } catch (err) {
      console.error(`Error occupied on ownerControll.deleteCategory: ${err}`)
    }
  }
}

module.exports = ownerController