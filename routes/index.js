const express = require('express')
const router = express.Router()
const passport = require('../config/passport')
const { authenticated } = require('../middleware/auth')
const userController = require('../contorllers/users')
const operateController = require('../contorllers/operates')


router.get('/signin', userController.signinPage)
router.post('/signin', passport.authenticate('staffLogin', { failureMessage: true, failureRedirect: '/signin' }), userController.signin)

router.get('/operate', authenticated, operateController.getHomePage)

router.get('', (req, res) => res.redirect('/operate'))

module.exports = router