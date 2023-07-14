'use strict';
const bcrypt = require('bcryptjs')

/** @type {import('sequelize-cli').Migration} */
module.exports =  {
  async up(queryInterface, Sequelize) {
    try {
      const users = [
        {
          name: 'Nero',
          account: 'nerodrinkshop',
          password: await bcrypt.hash('20230712', 12),
          role: 'owner',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          name: 'Stella',
          account: 'superstar',
          password: await bcrypt.hash('hoshimachi', 12),
          role: 'staff',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          name: 'Musk',
          account: 'toprichman',
          password: await bcrypt.hash('greencar', 12),
          role: 'staff',
          created_at: new Date(),
          updated_at: new Date()
        }
      ]
      await queryInterface.bulkInsert('Users', users, {})
      console.log('Users seed created successfully!')
    } catch (err) {
      console.error('Users seed error:', err)
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.bulkDelete('Users', {})
      console.log('Users seed removed.')
    } catch (err) {
      console.error('Error on removing users table:', err)
    }
  }
};
