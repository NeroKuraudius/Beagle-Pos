const passport = require('passport')
const localPassport = require('passport-local')
const bcrypt = require('bcryptjs')
const User = require('../models/user')

passport.use('staffLogin',new localPassport({
  usernameField: 'account',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, res, next, cb) => {
  try {
    const user = await User.findOne({ where: { account } })
    if (!user) return cb(null,false,req.flash('danger_msg','Account or password incorrect.'))
  
    const passwordMatch= await bcrypt.compare(password,user.password)
    if (!passwordMatch) return cb(null,false,req.flash('danger_msg','Account or password incorrect.'))
  
    return cb(null,user)
  }catch(err){
    cb(err)
  }
}
))

passport.serializeUser((user,cb)=>{
  cb(null,user.id)
})
passport.deserializeUser(async(id,cb)=>{
  try{
  const user = await User.findById(id)
  return cb(null,user.toJSON())
  }catch(err){
    cb(err)
  }
})

module.exports = passport