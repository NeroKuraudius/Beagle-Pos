const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const passportJWT = require('passport-jwt')
const bcrypt = require('bcryptjs')
const { User } = require('../models')

const JWTStrategy = passportJWT.Strategy
const ExtractJWT = passportJWT.ExtractJwt
const jwtOptions = {
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET
}

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
    console.error(`Passport staffLogin authenticated error: ${err}`)
    return cb(err)
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
    console.error(`Passport ownerLogin authenticated error: ${err}`)
    return cb(err)
  }
}
))

// JWT
passport.use(new JWTStrategy(jwtOptions, async (payload, cb) => {
  try {
    const user = await User.findByPk(payload.id)
    return cb(null, user)
  } catch (err) {
    return cb(err)
  }
}))

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