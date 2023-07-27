const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')
const { User } = require('../models')

// 前台登入
passport.use('staffLogin', new LocalStrategy({
  usernameField: 'account',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, res, next, cb) => {
  const { account, password } = req.body
  try {
    const user = await User.findOne({ where: { account } })
    if (!user) return cb(null, false, req.flash('danger_msg', '帳號或密碼錯誤'))
    if (user.role !== 'staff') return cb(null, false, req.flash('danger_msg', '帳號不存在'))

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) return cb(null, false, req.flash('danger_msg', '帳號或密碼錯誤'))

    return cb(null, user)
  } catch (err) {
    cb(`Passport authenticated error: ${err}`)
  }
}
)
)

// 後台登入
passport.use('ownerLogin', new LocalStrategy({
  usernameField: 'account',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, res, next, cb) => {
  const { account, password } = req.body
  try {
    const user = await User.findOne({ where: { account } })
    if (!user) return cb(null, false, req.flash('danger_msg', '帳號或密碼錯誤'))
    if (user.role !== 'owner') return cb(null, false, req.flash('danger_msg', '帳號不存在'))

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) return cb(null, false, req.flash('danger_msg', '帳號或密碼錯誤'))

    return cb(null, user)
  } catch (err) {
    cb(`Passport authenticated error: ${err}`)
  }
}
))

passport.serializeUser((user, cb) => {
  cb(null, user.id)
})
passport.deserializeUser(async (id, cb) => {
  try {
    const user = await User.findByPk(id)
    return cb(null, user.toJSON())
  } catch (err) {
    cb(err)
  }
})

module.exports = passport