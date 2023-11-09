const ownerServices = require('../../services/owner-services')

const ownerController = {
  signinPage: (req, res) => {
    return res.render('back-login')
  },
  signin: (req, res) => {
    req.flash('success_msg', '登入成功')
    return res.redirect('/owner/incomes')
  },
  getIncomes: async (req, res) => {
    ownerServices.getIncomes(req, (err, data) => err ? next(err) : res.render('owner/incomes', data))
  },
  getOrders: async (req, res) => {
    ownerServices.getOrders(req, (err, data) => err ? next(err) : res.render('owner/incomes', data))
  },
  getConsumes: async (req, res) => {
    ownerServices.getConsumes(req, (err, data) => err ? next(err) : res.render('owner/incomes', data))
  },
  getStaffs: async (req, res) => {
    ownerServices.getStaffs(req, (err, data) => err ? next(err) : res.render('owner/staffs', data))
  },
  putStaff: async (req, res) => {
    ownerServices.putStaff(req, (err, data) => {
      if (err) {
        req.flash('danger_msg', '查無該員工資料')
        return res.redirect('/owner/staffs')
      }
      req.session.putStaffData = data
      req.flash('success_msg', '班別轉換成功')
      return res.redirect('/owner/drinks')
    })
  },
  getStaffData: async (req, res) => {
    ownerServices.getStaffData(req, (err, data) => err ? next(err) : res.render('owner/staffs'))
  },
  patchStaffData: async (req, res) => {  // error handle 不確定
    ownerServices.putStaff(req, (err, data) => {
      if (err) {
        req.flash('danger_msg', `${err.message}`)
        return res.redirect('/owner/staffs')
      }
      req.session.patchStaffData = data
      req.flash('success_msg', '班別轉換成功')
      return res.redirect('/owner/staffs')
    })
  },
  deleteStaff: async (req, res) => {
    ownerServices.putStaff(req, (err, data) => {
      if (err) {
        req.flash('danger_msg', '查無該員工資料')
        return res.redirect('/owner/staffs')
      }
      req.session.deleteStaffData = data
      req.flash('success_msg', '已移除該員工')
      return res.redirect('/owner/staffs')
    })
  },
  createStaff: async (req, res) => {
    ownerServices.putStaff(req, (err, data) => {
      if (err) {
        req.flash('danger_msg', `${err.message}`)
        return res.redirect('/owner/staffs')
      }
      req.session.createStaffData = data
      if (data.error.length !== 0) {
        return res.redirect('/owner/staffs')
      } else {
        req.flash('success_msg', '資料建立成功')
        return res.redirect('/owner/staffs')
      }
    })
  },
  getBeverages: async (req, res) => {
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
  patchBeverageData: async (req, res) => {
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
  deleteBeverage: async (req, res) => {
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
  getCategories: async (req, res) => {
    try {
      const admin = await User.findByPk(req.user.id, { raw: true })
      const categories = await Category.findAll({ raw: true, nest: true, where: { isRemoved: false } })
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
      const categories = await Category.findAll({ raw: true, nest: true, where: { isRemoved: false } })
      return res.render('owner/categories', { admin, categories, category })
    } catch (err) {
      console.error(`Error occupied on ownerControll.getCategoryData: ${err}`)
    }
  },
  patchCategoryData: async (req, res) => {
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

module.exports = ownerController