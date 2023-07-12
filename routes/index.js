const express = require('express')
const router = express.Router()
const passport = require('../config/passport')
const {authenticated} = require('../middleware/auth')

router.get('/signin',(req,res)=>{
  res.render('login')
})
router.post('signin', passport.authenticate('staffLogin',{failureMessage:true,failureRedirect:'/signin'}),(req,res=>{
  return res.redirerct('/')
}))

router.get('/',authenticated,(req,res)=>{
  res.render('operate')
})

module.exports = router