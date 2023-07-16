'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const ices = [
      {
        name: '去冰',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: '微冰',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: '少冰',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: '正常',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: '熱飲',
        created_at: new Date(),
        updated_at: new Date()
      },
    ]
    try {
      await queryInterface.bulkInsert('Ices', ices, {})
      console.log('Ices seed created successfully!')
    } catch (err) {
      console.error(`Ices seed create error: ${err}`)
    }
  },
  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.bulkDelete('Ices', {})
      console.log('Ices seed deleted successfully!')
    } catch (err) {
      console.error(`Ices seed delete error: ${err}`)
    }
  }
};
