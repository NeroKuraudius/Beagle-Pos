'use strict';

const { QueryError } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.addColumn('Drinks', 'category_id',
        {
          allowNull: true,
          type: Sequelize.INTEGER,
          references: {
            model: 'Categories',
            key: 'id'
          }
        })
      console.log('Succeed in adding column categoryId!')
    } catch (err) {
      console.error(`Fail to adding column: ${err}`)
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.removeColumn('Drinks', 'category_id')
      console.log('Succeed in removing column categoryId!')
    } catch (err) {
      console.error(`Fail to removing column: ${err}`)
    }
  }
};
