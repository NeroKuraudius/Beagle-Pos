const helpers = require('../helpers/auth-helpers')
const passport = require('../config/passport')

module.exports = {
  authenticated: (req, res, next) => {
    if (helpers.ensureAuthenticated(req)) {
      return passport.authenticate('apiLogin', { session: false })
    }
    else {
      return res.status(403).json({
        staus: 'error',
        message: 'permission denied'
      })
    }
  }
}