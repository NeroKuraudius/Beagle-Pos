const helpers = require('../helpers/auth-helpers')

module.exports = {
  authenticated: (req, res, next) => {
    if (helpers.ensureAuthenticated(req)) {
      if (helpers.getUser(req).role === 'staff') {
        return next()
      } else {
        return res.redirect('/signin')
      }
    }
    req.flash('danger_msg', '使用前請先登入')
    return res.redirect('/signin')
  },
  authenticatedOwner: (req, res, next) => {
    if (helpers.ensureAuthenticated(req)) {
      if (helpers.getUser(req).role === 'owner') {
        return next()
      } else {
        return res.redirect('/owner/signin')
      }
    }
    req.flash('danger_msg', '使用前請先登入')
    return res.redirect('/owner/signin')
  }
}