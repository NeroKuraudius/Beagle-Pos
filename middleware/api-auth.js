const passport = require('../config/passport')

const authenticated = [
  passport.authenticate('jwt', { session: false }),
  (err, user, req, res, next) => {
    if (err || !user) return res.json({
      status: 'error',
      message: 'Unauthorized'
    })
    if (user.role !== 'staff') return res.json({
      status: 'error',
      message: 'This account is non-existent'
    })
    req.user = user.toJSON()
    next()
  }
]

const authenticatedOwner = [
  passport.authenticate('jwt', { session: false }),
  (err, user, req, res, next) => {
    if (err || !user) return res.json({
      status: 'error',
      message: 'Unauthorized'
    })
    if (user.role !== 'owner') return res.json({
      status: 'error',
      message: 'This account is non-existent'
    })
    req.user = user.toJSON()
    next()
  }
]

module.exports = { authenticated, authenticatedOwner }