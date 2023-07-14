const drinkController = {
  // 前台操作首頁
  getHomePage: (req,res,next)=>{
    return res.render('drinks')
  }
}

module.exports = drinkController