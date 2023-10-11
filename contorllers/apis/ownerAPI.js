const { User, Shift, Income, Order, Consume,
  Drink, Ice, Sugar, Topping, Category } = require('../../models')
const bcrypt = require('bcryptjs')
const { Sequelize } = require('sequelize')
const sequelize = new Sequelize(process.env.DATABASE, process.env.USERNAME, process.env.PASSWORD, { host: process.env.HOST, dialect: 'mysql' })

const ownerController = {}

module.exports = ownerController