const ownerServices = require('../../services/owner/owner-services')

const { User } = require('../../models')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const ownerController = {
  signin: async (req, res, next) => {
    const { account, password } = req.body
    try {
      const user = await User.findOne({ where: { account }, raw: true })
      if (!user) throw new Error('Incorrect account or password.')
      const userMatch = await bcrypt.compare(password, user.password)
      if (!userMatch) throw new Error('Incorrect account or password.')

      delete user.password

      const token = jwt.sign(user, process.env.SECRET, { expiresIn: '3d' })
      return res.json({
        status: 200,
        message: 'success',
        data: {
          token,
          loginUser: user
        }
      })
    } catch (err) {
      next(err)
    }
  },
  getIncomes: async (req, res, next) => {
    ownerServices.getIncomes(req, (err, data) => err ? next(err) : res.json({ status: 200, message: 'success', data }))
  },
  getOrders: async (req, res, next) => {
    ownerServices.getOrders(req, (err, data) => err ? next(err) : res.json({ status: 200, message: 'success', data }))
  },
  getConsumes: async (req, res, next) => {
    ownerServices.getConsumes(req, (err, data) => err ? next(err) : res.json({ status: 200, message: 'success', data }))
  },
  getStaffs: async (req, res, next) => {
    ownerServices.getStaffs(req, (err, data) => err ? next(err) : res.json({ status: 200, message: 'success', data }))
  },
  putStaff: async (req, res, next) => {
    ownerServices.putStaff(req, (err, data) => err ? next(err) : res.json({ status: 200, message: 'success' }))
  },
  getStaffData: async (req, res, next) => {
    ownerServices.getStaffData(req, (err, data) => err ? next(err) : res.json({ status: 200, message: 'success', data }))
  },
  patchStaffData: async (req, res, next) => {
    ownerServices.patchStaffData(req, (err, data) => err ? next(err) : res.json({ status: 200, message: 'success' }))
  },
  createStaff: async (req, res, next) => {
    ownerServices.createStaff(req, (err, data) =>
      err ? next(err) : data.error?.length ? res.json({ status: 400, message: '該帳號已被使用' }) : res.json({ status: 200, message: 'success', data }))
  },
  deleteStaff: async (req, res, next) => {
    ownerServices.deleteStaff(req, (err, data) => err ? next(err) : res.json({ status: 200, message: 'success', data }))
  },
  getBeverages: async (req, res, next) => {
    ownerServices.getBeverages(req, (err, data) => err ? next(err) : res.json({ status: 200, message: 'success', data }))
  },
  getBeverageData: async (req, res, next) => {
    ownerServices.getBeverageData(req, (err, data) => err ? next(err) : res.json({ status: 200, message: 'success', data }))
  },
  patchBeverageData: async (req, res, next) => {
    ownerServices.patchBeverageData(req, (err, data) => err ? next(err) : res.json({ status: 200, message: 'success' }))
  },
  createBeverage: async (req, res, next) => {
    ownerServices.createBeverage(req, (err, data) => {
      err ? next(err) : data.error?.length ? res.json({ status: 400, message: `${data.error.message}` }) : res.json({ status: 200, message: 'success', data })
    })
  },
  deleteBeverage: async (req, res, next) => {
    ownerServices.deleteBeverage(req, (err, data) => err ? next(err) : res.json({ status: 200, message: 'success', data }))
  },
  getCategories: async (req, res, next) => {
    ownerServices.getCategories(req, (err, data) => err ? next(err) : res.json({ status: 200, message: 'success', data }))
  },
  getCategoryData: async (req, res, next) => {
    ownerServices.getCategoryData(req, (err, data) => err ? next(err) : res.json({ status: 200, message: 'success', data }))
  },
  patchCategoryData: async (req, res, next) => {
    ownerServices.patchCategoryData(req, (err, data) => err ? next(err) : res.json({ status: 200, message: 'success' }))
  },
  createCategory: async (req, res, next) => {
    ownerServices.createCategory(req, (err, data) => err ? next(err) : res.json({ status: 200, message: 'success', data }))
  },
  deleteCategory: async (req, res, next) => {
    ownerServices.deleteCategory(req, (err, data) => err ? next(err) : res.json({ status: 200, message: 'success', data }))
  }
}

module.exports = ownerController