if (process.env.NODE_ENV !== 'production'){
  require('dotenv').config()
}

// modules
const express = require('express')
const exphbs = require('express-handlebars')
const methodOverride = require('method-override')
const session = require('express-session')

// routes
const routes = require('./routes')

const app = express()
const PORT = process.env.PORT || 3000

app.engine('hbs',exphbs.engine({extname:'.hbs',defaultLayout:'main'}))
app.set('view engine','hbs')

app.use(routes)

app.listen(PORT,()=>console.log(`App execute on port${PORT}.`))

module.exports = app