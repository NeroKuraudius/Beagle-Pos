const { User, Shift, Income, Order, Consume,
  Drink, Ice, Sugar, Topping, Category } = require('../models')
const bcrypt = require('bcryptjs')

const ownerController = {
  signinPage: (req, res) => {
    return res.render('back-login')
  },
  signin: (req, res) => {
    return res.redirect('/owner/incomes')
  },
  getIncomes: async (req, res) => {
    try {
      const admin = await User.findByPk(req.user.id)
      const incomes = await Income.findAll({
        raw: true,
        nest: true,
        include: [{
          model: User,
          include: [Shift]
        }]
      })
      return res.render('owner/incomes', { admin: admin.toJSON(), incomes })
    } catch (err) {
      console.error(`Error occupied on ownerControll.getIncomes: ${err}`)
    }
  },
  getOrders: async (req, res) => {
    const income_id = parseInt(req.params.Iid)
    try {
      const admin = await User.findByPk(req.user.id)
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
        where: { income_id }
      })
      return res.render('owner/incomes', { admin: admin.toJSON(), incomes, orders })
    } catch (err) {
      console.error(`Error occupied on ownerControll.getOrders: ${err}`)
    }
  },
  getConsumes: async (req, res) => {
    const { Iid, Oid } = req.params
    try {
      const admin = await User.findByPk(req.user.id)
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
        where: { income_id: parseInt(Iid) }
      })
      const consumes = await Consume.findAll({
        where: { order_id: parseInt(Oid) },
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
      return res.render('owner/incomes', { admin: admin.toJSON(), incomes, orders, consumes: consumesList })
    } catch (err) {
      console.error(`Error occupied on ownerControll.getConsumes: ${err}`)
    }
  },
  getStaffs: async (req, res) => {
    try {
      const admin = await User.findByPk(req.user.id)
      const users = await User.findAll({
        raw: true,
        nest: true,
        where: { role: 'staff' },
        include: [Shift]
      })
      return res.render('owner/staffs', { users, admin: admin.toJSON() })
    } catch (err) {
      console.error(`Error occupied on ownerControll.getStaffs: ${err}`)
    }
  },
  putStaffs: async (req, res) => {
    const id = parseInt(req.params.Uid)
    try {
      const user = await User.findByPk(id)
      if (!user) {
        req.flash('danger_msg', '查無該員工資料')
        return res.redirect('/owner/staffs')
      }

      if (user.toJSON().shift_id === 1) {
        await user.update({ shift_id: 2 })
      } else {
        await user.update({ shift_id: 1 })
      }
      req.flash('success_msg', '班別轉換成功')
      return res.redirect('/owner/staffs')
    } catch (err) {
      console.error(`Error occupied on ownerControll.putStaffs: ${err}`)
    }
  },
  getStaffData: async (req, res) => {
    const id = parseInt(req.params.Uid)
    try {
      const admin = await User.findByPk(req.user.id)
      const users = await User.findAll({
        raw: true,
        nest: true,
        where: { role: 'staff' },
        include: [Shift]
      })
      const staff = await User.findByPk(id)
      return res.render('owner/staffs', { users, staff: staff.toJSON(), admin: admin.toJSON() })
    } catch (err) {
      console.error(`Error occupied on ownerControll.getStaffData: ${err}`)
    }
  },
  patchStaffData: async (req, res) => {
    const id = parseInt(req.params.Uid)
    const { name, phone, account, password, checkPassword } = req.body
    if (!name || !phone || !account) {
      req.flash('danger_msg', '所有欄位皆為必填')
      return res.redirect(`/owner/staffs/${id}`)
    }
    if (password !== checkPassword) {
      req.flash('danger_msg', '兩次輸入的密碼不相符')
      return res.redirect(`/owner/staffs/${id}`)
    }
    try {
      const usedAccount = await User.findOne({ where: { account } })
      const editingUser = await User.findByPk(id)
      if (usedAccount && (usedAccount.toJSON().id !== editingUser.toJSON().id)) {
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
      const name = user.toJSON() + '(已離職)'
      await user.update({ role: 'quitted', name })
      req.flash('success_msg', '已移除該員工')
      return res.redirect('/owner/staffs')
    } catch (err) {
      console.error(`Error occupied on ownerControll.deleteStaff: ${err}`)
    }
  },
  createStaff: async (req, res) => {
    const { name, phone, account, password, checkPassword, shift_id } = req.body
    if (!name || !phone || !account) {
      req.flash('danger_msg', '所有欄位皆為必填')
      return res.redirect(`/owner/staffs/${id}`)
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
        const admin = await User.findByPk(req.user.id)
        return res.render('owner/staffs', { error, users, name, phone, account, password, checkPassword, shift_id, admin: admin.toJSON() })
      }
      const hash = await bcrypt.hash(password, 12)
      await User.create({ name, phone, account, shift_id, password: hash, role: 'staff' })
      req.flash('success_msg', '資料建立成功')
      return res.redirect('/owner/staffs')
    } catch (err) {
      console.error(`Error occupied on ownerControll.createStaff: ${err}`)
    }
  },
  getBeverages: async (req, res) => {
    try {
      const admin = await User.findByPk(req.user.id)
      const categories = await Category.findAll({ raw: true, nest: true })
      const drinks = await Drink.findAll({
        raw: true,
        nest: true,
        include: [Category],
        order: [['category_id']]
      })
      return res.render('owner/beverages', { admin: admin.toJSON(), drinks, categories })
    } catch (err) {
      console.error(`Error occupied on ownerControll.getBeverages: ${err}`)
    }
  },
  getBeverageData: async (req, res) => {
    const id = parseInt(req.params.Did)
    try {
      const drink = await Drink.findByPk(id)
      if (!drink) {
        req.flash('danger_msg', '找不到該餐點相關資料')
        return res.redirect('/owner/beverages')
      }
      const admin = await User.findByPk(req.user.id)
      const drinks = await Drink.findAll({
        raw: true,
        nest: true,
        include: [Category],
        order: [['category_id']]
      })
      const categories = await Category.findAll({ raw: true, nest: true })
      return res.render('owner/beverages', { admin: admin.toJSON(), drink: drink.toJSON(), drinks, categories })
    } catch (err) {
      console.error(`Error occupied on ownerControll.getBeverageData: ${err}`)
    }
  },
  patchBeverageData: async (req, res) => {
    const id = parseInt(req.params.Did)
    const { category_id, name, price } = req.body
    if (!category_id || !name || !price) {
      req.flash('danger_msg', '所有欄位皆為必填')
      return res.redirect(`/owner/beverages/${id}`)
    }
    try {
      const drink = await Drink.findByPk(id)
      if (!drink) {
        req.flash('danger_msg', '找不到該餐點相關資料')
        return res.redirect(`/owner/beverages/${id}`)
      }
      await drink.update({ category_id, name, price })
      return res.redirect('/owner/beverages')
    } catch (err) {
      console.error(`Error occupied on ownerControll.patchBeverageData: ${err}`)
    }
  },
  createBeverage: async (req, res) => {
    const { category_id, name, price } = req.body
    if (!category_id || !name || !price) {
      req.flash('danger_msg', '所有欄位皆為必填')
      return res.redirect(`/owner/beverages`)
    }
    try {
      const error = []
      const exsistedBeverage = await Drink.findOne({ where: { name } })
      if (exsistedBeverage) {
        error.push('該餐點已登錄')
        const admin = await User.findByPk(req.user.id)
        const drinks = await Drink.findAll({
          raw: true,
          nest: true,
          include: [Category],
          order: [['category_id']]
        })
        const categories = await Category.findAll({ raw: true, nest: true })
        return res.render('owner/beverages', { category_id, name, price, admin: admin.toJSON(), drinks, categories, error })
      }
      await Drink.create({ category_id, name, price })
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
      await drink.destroy()
      req.flash('success_msg', '餐點刪除成功')
      return res.redirect('/owner/beverages')
    } catch (err) {
      console.error(`Error occupied on ownerControll.deleteBeverage: ${err}`)
    }
  },
  getCategories: async (req, res) => {

  }
}


module.exports = ownerController