const getUser = req => {
  return req.user || null
}

const ensureAuthenticated = req => {
  return req.isAuthemticated()
}

module.exports = { getUser, ensureAuthenticated }