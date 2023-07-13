const express = require('express')
const router = express.Router()
const passport = require('../../config/passport')
const { authenticatedOwner } = require('../../middleware/auth')
const ownerController = require('../../contorllers/owner')


router.get('/signin', ownerController.signinPage)
router.post('/signin', passport.authenticate('ownerLogin', { failureMessage: true, failureRedirect: '/owner/signin' }), ownerController.signin)

module.exports = router