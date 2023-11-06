const { User } = require('../../models')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userController = {
  signin: async (req, res, next) => {
    // const { account, password } = req.body
    try {
      // const user = await User.findOne({ where: { account }, raw: true })

      // const userMatch = await bcrypt.compare(password, user.password)
      // if (!userMatch) throw new Error('Incorrect account or password.')

      // delete user.password
      const loginUser = req.user.toJSON()
      const token = jwt.sign(req.user, process.env.SECRET, { expiresIn: '3d' })
      return res.json({
        status: 'success',
        data: { loginUser, token }
      })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = userController