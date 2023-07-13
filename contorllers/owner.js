const ownerController = {
  signinPage: (req, res) => {
    return res.render('back-login')
  },
  signin:(req,res)=>{
    return res.send('owner page')
  }
}


module.exports = ownerController