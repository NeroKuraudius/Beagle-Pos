const express = require('express')
const router = express.Router()

const operateController = {
  // 前台操作首頁
  getHomePage: (req,res,next)=>{
    return res.render('operate')
  }
}

module.exports = operateController