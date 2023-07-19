'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Orders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      shift_id: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      start_consume: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      end_consume: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      quantity: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      total_price: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Orders');
  }
};