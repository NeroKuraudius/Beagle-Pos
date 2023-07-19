'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.addColumn('Consumes', 'user_id',
        {
          allowNull: false,
          type: Sequelize.INTEGER,
        })
      console.log('Succeed in adding column userId!')
    } catch (err) {
      console.error(`Fail to adding column: ${err}`)
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.removeColumn('Consumes', 'user_id')
      console.log('Succeed in removing column userId!')
    } catch (err) {
      console.error(`Fail to removing column: ${err}`)
    }
  }
};