const express = require('express')
const router = express.Router()
const User = require('../models/user')

const staffController = {
  // 登入
  signinPage:(req,res,next)=>{
    return res.render('login')
  },
  signin:async(req,res,next)=>{
    return res.redirect('/operate')
  }
}

module.exports = userController