const express = require('express')
const router = express.Router()
const User = require('../models/user')

const userController = {
  // 登入
  signinPage:(req,res)=>{
    return res.render('front-login')
  },
  signin:(req,res)=>{
    return res.redirect('/operate')
  }
}

module.exports = userController