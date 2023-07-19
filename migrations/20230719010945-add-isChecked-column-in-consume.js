'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.addColumn('Consumes', 'is_checked',
        {
          allowNull: false,
          type: Sequelize.BOOLEAN,
          defaultValue: false
        })
      console.log('Succeed in adding column isChecked!')
    } catch (err) {
      console.error(`Fail to adding column: ${err}`)
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.removeColumn('Consumes', 'is_checked')
      console.log('Succeed in removing column isChecked!')
    } catch (err) {
      console.error(`Fail to removing column: ${err}`)
    }
  }
};
