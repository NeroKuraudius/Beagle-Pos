'use strict';
const bcrypt = require('bcryptjs')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const users = [
        {
          name: 'Nero',
          phone: '0988888888',
          account: 'nerodrinkshop',
          password: await bcrypt.hash('20230712', 12),
          role: 'owner',
          shift_id: 3,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          name: 'Stella',
          phone: '09xx1xx3xx',
          account: 'superstar',
          password: await bcrypt.hash('hoshimachi', 12),
          role: 'staff',
          shift_id: 1,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          name: 'Musk',
          phone: '0953xxxxxx',
          account: 'toprichman',
          password: await bcrypt.hash('greencar', 12),
          role: 'staff',
          shift_id: 2,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          name: 'Albert',
          phone: '0901010101',
          account: 'einstein',
          password: await bcrypt.hash('relativity', 12),
          role: 'staff',
          shift_id: 2,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          name: 'Tony',
          phone: '0917613595',
          account: 'stark',
          password: await bcrypt.hash('iamironman', 12),
          role: 'staff',
          shift_id: 1,
          created_at: new Date(),
          updated_at: new Date()
        }
      ]

      const User = require('../models/user')
      const userData1 = await User.findOne({ where: { name: 'Stella' } })
      const userData2 = await User.findOne({ where: { account: 'einstein' } })
      const userData3 = await User.findOne({ where: { role: 'owner' } })

      if(userData1 && userData2 && userData3){
        console.log("Users seed skipped 'cause data exist.")
      }else{
        await queryInterface.bulkInsert('Users', users, {})
        console.log('Users seed created successfully!')
      }
    } catch (err) {
      console.error('Users seed error:', err)
    }
  },
  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.bulkDelete('Users', {})
      console.log('Users seed removed!')
    } catch (err) {
      console.error('Error on removing users table:', err)
    }
  }
};
