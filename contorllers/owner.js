

const ownerController = {
  signinPage: (req, res) => {
    return res.render('back-login')
  },
  signin:(req,res)=>{
    return res.redirect('/owner/operate')
  }
}


module.exports = ownerController