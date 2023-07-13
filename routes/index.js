const express = require('express')
const router = express.Router()
const passport = require('../config/passport')
const { authenticated } = require('../middleware/auth')
const operateController = require('../contorllers/operates')


router.get('/signin', (req, res) => {
  res.render('login')
})
router.post('/signin', passport.authenticate('staffLogin', { failureMessage: true, failureRedirect: '/signin' }), (req, res => {
  return res.redirerct('/operate')
}))

router.get('/operate', authenticated, operateController.getHomePage)

router.get('', (req, res) => res.redirect('/operate'))

module.exports = router