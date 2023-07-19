'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Consumes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      drink_name: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      drink_ice: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      drink_sugar: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      drink_price: {
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
    await queryInterface.dropTable('Consumes');
  }
};