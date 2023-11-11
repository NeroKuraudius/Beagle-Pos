const ownerServices = require('../../services/owner-services')

const { User } = require('../../models')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const ownerController = {
  signin: async (req, res) => {
    const { account, password } = req.body
    try {
      const user = await User.findOne({ where: { account }, raw: true })
      if (!user) throw new Error('Incorrect account or password.')
      const userMatch = await bcrypt.compare(password, user.password)
      if (!userMatch) throw new Error('Incorrect account or password.')

      delete user.password

      const token = jwt.sign(user, process.env.SECRET, { expiresIn: '3d' })
      return res.json({
        status: 'success',
        data: {
          token,
          loginUser: user
        }
      })
    } catch (err) {
      next(err)
    }
  },
  getIncomes: async (req, res) => {
    ownerServices.getIncomes(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  getOrders: async (req, res) => {
    ownerServices.getOrders(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  getConsumes: async (req, res) => {
    ownerServices.getConsumes(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  getStaffs: async (req, res) => {
    ownerServices.getStaffs(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  putStaff: async (req, res) => {
    ownerServices.putStaff(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  getStaffData: async (req, res) => {
    ownerServices.getStaffData(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  patchStaffData: async (req, res) => {
    ownerServices.patchStaffData(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  deleteStaff: async (req, res) => {
    ownerServices.deleteStaff(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  createStaff: async (req, res) => {
    ownerServices.createStaff(req, (err, data) =>
      err ? next(err) : data.error.length ? res.json({ status: 'error', message: '該帳號已被使用' }) : res.json({ status: 'success', data }))
  },
  getBeverages: async (req, res) => {
    ownerServices.getBeverages(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  getBeverageData: async (req, res) => {
    ownerServices.getBeverageData(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  patchBeverageData: async (req, res) => {
    ownerServices.patchBeverageData(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  createBeverage: async (req, res) => {
    ownerServices.createBeverage(req, (err, data) => {
      err ? next(err) : data.error.length ? res.json({ status: 'error', message: '該餐點已登錄' }) : res.json({ status: 'success', data })
    })
  },
  deleteBeverage: async (req, res) => {
    ownerServices.deleteBeverage(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  getCategories: async (req, res) => {
    ownerServices.getCategories(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  getCategoryData: async (req, res) => {
    ownerServices.getCategoryData(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  patchCategoryData: async (req, res) => {
    ownerServices.patchCategoryData(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  createCategory: async (req, res) => {
    ownerServices.createCategory(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  deleteCategory: async (req, res) => {
    ownerServices.deleteCategory(req, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  }
}

module.exports = ownerController