'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.addColumn('Drinks', 'is_deleted',
        {
          allowNull: false,
          type: Sequelize.BOOLEAN,
          defaultValue: false
        }
      )
      console.log('Succeed in adding column isDeleted')
    } catch (err) {
      console.error(`Fail to adding column: ${err}`)
    }
  },
  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.removeColumn('Drinks', 'is_deleted')
      console.log('Succeed in removing column isDeleted')
    } catch (err) {
      console.error(`Fail to removing column: ${err}`)
    }
  }
}