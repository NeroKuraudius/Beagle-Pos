const { User, Shift } = require('../../models')
const bcrypt = require('bcryptjs')
const { Sequelize } = require('sequelize')
const sequelize = new Sequelize(process.env.DATABASE, process.env.DB_USERNAME, process.env.PASSWORD, { host: process.env.HOST, dialect: 'mysql' })

const personnelServices = {
  getStaffs: async (req, cb) => {
    try {
      const [ admin, users ] = await Promise.all([
        User.findOne({ where: { id: req.user.id }, attributes: ['name'], raw: true }),
        
        User.findAll({
          where: { role: 'staff' },
          attributes: ['id', 'name'],
          include: [{ model: Shift, attributes: ['name'] }],
          raw: true, nest: true
        })
      ])

      return cb(null, { admin, users })
    } catch (err) {
      return cb(err)
    }
  },

  putStaff: async (req, cb) => {
    const id = parseInt(req.params.Uid)
    try {
      const result = await sequelize.transaction(async(t)=>{
        const user = await User.findByPk(id, { transaction: t })
        if (!user) {
          const err = new Error('查無該員工資料')
          err.status = 404
          throw err
        }

        if (user.toJSON().shiftId === 1) {
          await user.update({ shiftId: 2 }, { transaction: t })
        } else {
          await user.update({ shiftId: 1 }, { transaction: t })
        }
      })
      
      return cb(null)
    } catch (err) {
      if (!err.status) err.status = 500
      return cb(err)
    }
  },

  getStaffData: async (req, cb) => {
    const id = parseInt(req.params.Uid)
    try {
      const staff = await User.findOne({ where: { id }, attributes: ['id', 'name', 'phone', 'account'], raw: true })
      if (!staff || staff.name.includes('(已離職)')) {
        const err = new Error('找不到該員工資料')
        err.status = 404
        throw err
      }

      const [ admin, users ] = await Promise.all([
        User.findOne({ where: { id: req.user.id }, attributes: ['name'], raw: true }),

        User.findAll({
          where: { role: 'staff' },
          attributes: ['id', 'name'],
          include: [{ model: Shift, attributes: ['name'] }],
          raw: true, nest: true
        })
      ])

      return cb(null, { admin, users, staff })
    } catch (err) {
      return cb(err)
    }
  },

  patchStaffData: async (req, cb) => {
    const { name, phone, account, password, checkPassword } = req.body
    const [ trimName, trimPhone, trimAccount, trimPwd, trimCheckPwd ] = [ name.trim(), phone.trim(), account.trim(), password.trim(), checkPassword.trim() ]
    const id = parseInt(req.params.Uid)
    try {
      if (!trimName || !trimPhone || !trimAccount) {
        const err = new Error('缺少必填資料')
        err.status = 400
        throw err
      }
      if (trimPwd !== trimCheckPwd) {
        const err = new Error('密碼不一致')
        err.status = 400
        throw err
      }

      const result = await sequelize.transaction(async(t)=>{
        const existingUserWithAccount = await User.findOne({
            where: {
                account: trimAccount,
                id: { [Op.ne]: id } // Op.ne: Not equal (不等於)
            },
            attributes: ['id'],
            transaction: t
        })
        if (existingUserWithAccount) {
          const err = new Error('該帳號已被使用')
          err.status = 400
          throw err
        }

        const hash = await bcrypt.hash(password, 12)
        await User.update({ name: trimName, phone: trimPhone, account: trimAccount, password: hash }, { where: { id }, transaction: t })
      })
      
      return cb(null)
    } catch (err) {
      if (!err.status) err.status = 500
      return cb(err)
    }
  },

  createStaff: async (req, cb) => {
    const { name, phone, account, password, checkPassword, shiftId } = req.body
    const [ trimName, trimPhone, trimAccount, trimPwd, trimCheckPsw ] = [ name.trim(), phone.trim(), account.trim(), password.trim(), checkPassword.trim() ]
    
    try {
      if (!trimName || !trimPhone || !trimAccount || !shiftId || !trimPwd || !trimCheckPsw) {
        const err = new Error('所有欄位皆為必填')
        err.status = 500
        throw err
      }
      if (trimPwd !== trimCheckPsw) {
        const err = new Error('兩次輸入的密碼不相符')
        err.status = 500
        throw err
      }

      const result = await sequelize.transaction(async(t)=>{
        const userdAccount = await User.findOne({ where: { account }, attributes: ['id'], transaction: t })

        const errorMsg = []
        if (userdAccount) {
          const users = await User.findAll({
            where: { role: 'staff' },
            attributes: ['id', 'name'],
            include: [{ model: Shift, attributes: ['name'] }],
            raw: true, nest: true, transaction: t
          })
          errorMsg.push('該帳號已被使用')
          const admin = await User.findOne({ where: { id: req.user.id }, attributes: ['name'], raw: true, transaction: t })
          return { errorMsg, admin, users, name, phone, account }
        }

        const hash = await bcrypt.hash(password, 12)
        let newUser = await User.create({ 
          name: trimName, phone: trimPhone, 
          account: trimAccount, shiftId, 
          password: hash, role: 'staff' 
        }, { transaction: t })
        
        newUser = newUser.toJSON()
        delete newUser.password

        return { newUser }
      })

      return cb(null, result)
    } catch (err) {
      if (!err.status) err.status = 500
      return cb(err)
    }
  },

  deleteStaff: async (req, cb) => {
    const id = parseInt(req.params.Uid)
    try {
      const result = await sequelize.transaction(async(t)=>{
        const user = await User.findByPk(id, { transaction: t })
        if (!user) {
          const err = new Error('查無該員工資料')
          err.status = 404
          throw err
        }
        if (user.toJSON().name.includes('(已離職)')) {
          const err = new Error('該員工已離職')
          err.status = 400
          throw err
        }

        const quittedName = user.toJSON().name + '(已離職)'
        let deletedUser = await user.update({ role: 'quitted', name: quittedName }, { transaction: t })
        deletedUser = deletedUser.toJSON()
        delete deletedUser.password

        return { deletedUser }
      })

      return cb(null, result)
    } catch (err) {
      if (!err.status) err.status = 500
      return cb(err)
    }
  }
}

module.exports = personnelServices