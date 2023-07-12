if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

// modules
const express = require('express')
const exphbs = require('express-handlebars')
const methodOverride = require('method-override')
const session = require('express-session')
const flash = require('connect-flash')

// routes
const routes = require('./routes')

const app = express()
const PORT = process.env.PORT || 3000

// set templates
app.engine('hbs', exphbs.engine({ extname: '.hbs', defaultLayout: 'main' }))
app.set('view engine', 'hbs')

// import CSS
app.use(express.static('public'))

// set session
app.use(session({ secret: process.env.SECRET, resave: false, saveUninitialized: false }))

// use body-parser
app.use(express.urlencoded({ extended: true }))


// set middleware
app.use(flash())
app.use(methodOverride('_method'))
app.use((req,res,next)=>{
  res.locals.danger_msg = req.flash('danger_msg')
  res.locals.success_msg = req.flash('success_msg')
  // res.locals.loginUser = helpers.getUser(req)
})

app.use(routes)

app.listen(PORT, () => console.log(`App execute on port:${PORT}!`))

module.exports = app