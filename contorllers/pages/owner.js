const ownerServices = require('../../services/owner/owner-services')
const personnelServices = require('../../services/owner/personnel-services')
const productServices = require('../../services/owner/product-service')
const categoryServices = require('../../services/owner/category-service')

const ownerController = {
  // 使用者
  signinPage: (req, res, next) => {
    return res.render('back-login')
  },
  signin: (req, res, next) => {
    req.flash('success_msg', '登入成功')
    return res.redirect('/owner/incomes')
  },
  getIncomes: async (req, res, next) => {
    ownerServices.getIncomes(req, (err, data) => err ? next(err) : res.render('owner/incomes', data))
  },
  getOrders: async (req, res, next) => {
    ownerServices.getOrders(req, (err, data) => err ? next(err) : res.render('owner/incomes', data))
  },
  getConsumes: async (req, res, next) => {
    ownerServices.getConsumes(req, (err, data) => err ? next(err) : res.render('owner/incomes', data))
  },

  // 人事
  getStaffs: async (req, res, next) => {
    personnelServices.getStaffs(req, (err, data) => err ? next(err) : res.render('owner/staffs', data))
  },
  putStaff: async (req, res, next) => {
    personnelServices.putStaff(req, (err, data) => {
      if (err) {
        req.flash('danger_msg', '查無該員工資料')
        return res.redirect('/owner/staffs')
      }
      req.session.putStaffData = data
      req.flash('success_msg', '班別轉換成功')
      return res.redirect('/owner/staffs')
    })
  },
  getStaffData: async (req, res, next) => {
    personnelServices.getStaffData(req, (err, data) => err ? next(err) : res.render('owner/staffs', data))
  },
  patchStaffData: async (req, res, next) => {
    personnelServices.patchStaffData(req, (err, data) => {
      if (err) {
        req.flash('danger_msg', `${err.message}`)
        return res.redirect('/owner/staffs')
      }
      req.session.patchStaffData = data
      req.flash('success_msg', '資料修改成功')
      return res.redirect('/owner/staffs')
    })
  },
  createStaff: async (req, res, next) => {
    personnelServices.createStaff(req, (err, data) => {
      if (err) {
        req.flash('danger_msg', `${err.message}`)
        return res.redirect('/owner/staffs')
      }
      req.session.createStaffData = data
      if (data.errorMsg.length !== 0) {
        return res.render('owner/staffs', data)
      } else {
        req.flash('success_msg', '資料建立成功')
        return res.redirect('/owner/staffs')
      }
    })
  },
  deleteStaff: async (req, res, next) => {
    personnelServices.deleteStaff(req, (err, data) => {
      if (err) {
        req.flash('danger_msg', '查無該員工資料')
        return res.redirect('/owner/staffs')
      }
      req.session.deleteStaffData = data
      req.flash('success_msg', '已移除該員工')
      return res.redirect('/owner/staffs')
    })
  },

  // 商品
  getBeverages: async (req, res, next) => {
    productServices.getBeverages(req, (err, data) => err ? next(err) : res.render('owner/beverages', data))
  },
  getBeverageData: async (req, res, next) => {
    productServices.getBeverageData(req, (err, data) => {
      if (err) {
        req.flash('danger_msg', '找不到該餐點相關資料')
        return res.redirect('/owner/beverages')
      }
      return res.render('owner/beverages', data)
    })
  },
  patchBeverageData: async (req, res, next) => {
    productServices.patchBeverageData(req, (err, data) => {
      if (err) {
        req.flash('danger_msg', `${err.message}`)
        return res.redirect('/owner/beverages')
      }
      req.session.patchDrinkData = data
      req.flash('success_msg', '餐點修改成功')
      return res.redirect('/owner/beverages')
    })
  },
  createBeverage: async (req, res, next) => {
    productServices.createBeverage(req, (err, data) => {
      if (err) {
        req.flash('danger_msg', `${err.message}`)
        return res.redirect('/owner/beverages')
      }
      req.session.createDrinkData = data
      req.flash('success_msg', '資料建立成功')
      return res.redirect('/owner/beverages')
    }
    )
  },
  deleteBeverage: async (req, res, next) => {
    productServices.deleteBeverage(req, (err, data) => {
      if (err) {
        req.flash('danger_msg', `${err.message}`)
        return res.redirect('/owner/beverages')
      }
      req.session.deleteBeverageData = data
      req.flash('success_msg', '餐點下架成功')
      return res.redirect('/owner/beverages')
    })
  },

  // 分類
  getCategories: async (req, res, next) => {
    categoryServices.getCategories(req, (err, data) => err ? next(err) : res.render('owner/categories', data))
  },
  getCategoryData: async (req, res, next) => {
    categoryServices.getCategoryData(req, (err, data) => {
      if (err) {
        req.flash('danger_msg', '找不到此項類別')
        return res.redirect('/owner/categories')
      }
      res.render('owner/categories', data)
    })
  },
  patchCategoryData: async (req, res, next) => {
    categoryServices.patchCategoryData(req, (err, data) => {
      if (err) {
        req.flash('danger_msg', `${err.message}`)
        return res.redirect('/owner/categories')
      }
      req.session.patchCategoryData = data
      req.flash('success_msg', '餐點修改成功')
      return res.redirect('/owner/categories')
    })
  },
  createCategory: async (req, res, next) => {
    categoryServices.createCategory(req, (err, data) => {
      if (err) {
        req.flash('danger_msg', `${err.message}`)
        return res.redirect('/owner/categories')
      }
      req.session.createCategoryData = data
      req.flash('success_msg', '類別建立成功')
      return res.redirect('/owner/categories')
    })
  },
  deleteCategory: async (req, res, next) => {
    categoryServices.deleteCategory(req, (err, data) => {
      if (err) {
        req.flash('danger_msg', `${err.message}`)
        return res.redirect('/owner/categories')
      }
      req.session.deleteCategoryData = data
      req.flash('success_msg', '類別刪除成功')
      return res.redirect('/owner/categories')
    })
  }
}

module.exports = ownerController