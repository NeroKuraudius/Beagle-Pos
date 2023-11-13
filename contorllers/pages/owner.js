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
      return res.redirect('/owner/staffs')
    })
  },
  getStaffData: async (req, res) => {
    ownerServices.getStaffData(req, (err, data) => err ? next(err) : res.render('owner/staffs', data))
  },
  patchStaffData: async (req, res) => {
    ownerServices.patchStaffData(req, (err, data) => {
      if (err) {
        req.flash('danger_msg', `${err.message}`)
        return res.redirect('/owner/staffs')
      }
      req.session.patchStaffData = data
      req.flash('success_msg', '資料修改成功')
      return res.redirect('/owner/staffs')
    })
  },
  createStaff: async (req, res) => {
    ownerServices.createStaff(req, (err, data) => {
      if (err) {
        req.flash('danger_msg', `${err.message}`)
        return res.redirect('/owner/staffs')
      }
      req.session.createStaffData = data
      if (data.errorMsg.length !== 0) {
        req.flash('danger_msg', `${data.errorMsg[0]}`)
        return res.render('owner/staffs', data)
      } else {
        req.flash('success_msg', '資料建立成功')
        return res.redirect('/owner/staffs')
      }
    })
  },
  deleteStaff: async (req, res) => {
    ownerServices.deleteStaff(req, (err, data) => {
      if (err) {
        req.flash('danger_msg', '查無該員工資料')
        return res.redirect('/owner/staffs')
      }
      req.session.deleteStaffData = data
      req.flash('success_msg', '已移除該員工')
      return res.redirect('/owner/staffs')
    })
  },
  getBeverages: async (req, res) => {
    ownerServices.getBeverages(req, (err, data) => err ? next(err) : res.render('owner/beverages', data))
  },
  getBeverageData: async (req, res) => {
    ownerServices.getBeverageData(req, (err, data) => {
      if (err) {
        req.flash('danger_msg', '找不到該餐點相關資料')
        return res.redirect('/owner/beverages')
      }
      return res.render('owner/beverages', data)
    })
  },
  patchBeverageData: async (req, res) => {
    ownerServices.patchBeverageData(req, (err, data) => {
      if (err) {
        req.flash('danger_msg', `${err.message}`)
        return res.redirect('/owner/beverages')
      }
      req.session.patchDrinkData = data
      req.flash('success_msg', '餐點修改成功')
      return res.redirect('/owner/beverages')
    })
  },
  createBeverage: async (req, res) => {
    ownerServices.createBeverage(req, (err, data) => {
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
  deleteBeverage: async (req, res) => {
    ownerServices.deleteBeverage(req, (err, data) => {
      if (err) {
        req.flash('danger_msg', `${err.message}`)
        return res.redirect('/owner/beverages')
      }
      req.session.deleteBeverageData = data
      req.flash('success_msg', '餐點下架成功')
      return res.redirect('/owner/beverages')
    })
  },
  getCategories: async (req, res) => {
    ownerServices.getCategories(req, (err, data) => err ? next(err) : res.render('owner/categories', data))
  },
  getCategoryData: async (req, res) => {
    ownerServices.getCategoryData(req, (err, data) => {
      if (err) {
        req.flash('danger_msg', '找不到此項類別')
        return res.redirect('/owner/categories')
      }
      res.render('owner/categories', data)
    })
  },
  patchCategoryData: async (req, res) => {
    ownerServices.patchCategoryData(req, (err, data) => {
      if (err) {
        req.flash('danger_msg', `${err.message}`)
        return res.redirect('/owner/categories')
      }
      req.session.patchCategoryData = data
      req.flash('success_msg', '餐點修改成功')
      return res.redirect('/owner/categories')
    })
  },
  createCategory: async (req, res) => {
    ownerServices.createCategory(req, (err, data) => {
      if (err) {
        req.flash('danger_msg', `${err.message}`)
        return res.redirect('/owner/categories')
      }
      req.session.createCategoryData = data
      req.flash('success_msg', '類別建立成功')
      return res.redirect('/owner/categories')
    })
  },
  deleteCategory: async (req, res) => {
    ownerServices.deleteCategory(req, (err, data) => {
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