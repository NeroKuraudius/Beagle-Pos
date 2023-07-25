'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const sugars = [
      {
        name: '無糖',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: '微糖',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: '半糖',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: '少糖',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: '正常',
        created_at: new Date(),
        updated_at: new Date()
      },
    ]
    try {
      await queryInterface.bulkInsert('Sugars', sugars, {})
      console.log('Sugars seed created successfully!')
    } catch (err) {
      console.error(`Sugars seed create error: ${err}`)
    }
  },
  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.bulkDelete('Sugars', {})
      console.log('Sugars seed removed!')
    } catch (err) {
      console.error(`Sugars seed delete error: ${err}`)
    }
  }
};
