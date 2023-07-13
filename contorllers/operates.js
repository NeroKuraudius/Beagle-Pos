const operateController = {
  // 前台操作首頁
  getHomePage: (req,res,next)=>{
    return res.render('operate')
  }
}

module.exports = operateController