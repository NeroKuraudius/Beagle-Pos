'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.addColumn('Categories', 'is_removed',
        {
          allowNull: false,
          type: Sequelize.BOOLEAN,
          defaultValue: false
        }
      )
      console.log('Succeed in adding column isRemoved')
    } catch (err) {
      console.error(`Fail to adding column: ${err}`)
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.removeColumn('Categories', 'is_removed')
      console.log('Succeed in removing column isRemoved')
    } catch (err) {
      console.error(`Fail to removing column: ${err}`)
    }
  }
};
