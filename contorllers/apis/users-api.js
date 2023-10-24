const { User } = require('../../models')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userController = {
  signin: async (req, res, next) => {
    const { account, password } = req.body
    try {
      const user = await User.findOne({ where: { account }, raw: true })

      const userMatch = await bcrypt.compare(password, user.password)
      if (!userMatch) throw new Error('Incorrect account or password.')

      delete user.password
      const token = jwt.sign(user, process.env.SECRET, { expiresIn: '3d' })
      return res.json({ status: 'success', loginUser: user, token })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = userController