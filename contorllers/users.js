const userController = {
  // 登入
  signinPage: (req, res) => {
    return res.render('front-login')
  },
  signin: (req, res) => {
    req.flash('success_msg', '登入成功')
    return res.redirect('/drinks')
  },
  // 登出
  signout: (req, res, next) => {
    if (req.user.role === 'staff') {
      req.logout((err) => {
        if (err) return next(err)
        req.flash('success_msg', '您已成功登出')
        return res.redirect('/signin')
      })
    } else {
      req.logout((err) => {
        if (err) return next(err)
        req.flash('success_msg', '您已成功登出')
        return res.redirect('/owner/signin')
      })
    }
  }
}

module.exports = userController