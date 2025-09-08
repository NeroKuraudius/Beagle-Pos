const { User } = require('../../models')
const bcrypt = require('bcryptjs')
const { Sequelize } = require('sequelize')
const sequelize = new Sequelize(process.env.DATABASE, process.env.DB_USERNAME, process.env.PASSWORD, { host: process.env.HOST, dialect: 'mysql' })

const personnelServices = {
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
  }
}

module.exports = personnelServices