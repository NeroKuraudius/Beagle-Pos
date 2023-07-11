if (process.env.NODE_ENV !== 'production'){
  require('dotenv').config()
}

// modules
const express = require('express')
const exphbs = require('express-handlebars')
const methodOverride = require('method-override')
const session = require('express-session')

const app = express()
const PORT = process.env.PORT || 3000

app.get('',(req,res)=>{
  return res.send('Succeed in listening.')
})

app.listen(PORT,()=>console.log(`App execute on port${PORT}.`))

module.exports = app