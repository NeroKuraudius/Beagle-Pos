'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.addColumn('Consumes', 'order_id',
        {
          allowNull: false,
          type: Sequelize.INTEGER,
          defaultValue: 0
        })
      console.log('Succeed in adding column orderId!')
    } catch (err) {
      console.error(`Fail to adding column: ${err}`)
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.removeColumn('Consumes', 'order_id')
      console.log('Succeed in removing column orderId!')
    } catch (err) {
      console.error(`Fail to removing column: ${err}`)
    }
  }
};
