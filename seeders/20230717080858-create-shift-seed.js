'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const shifts = [
      {
        name: '早班',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: '晚班',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: '老闆',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]
    
    try {
      const Shift = require('../models/shift')
      const shiftData = await Shift.findOne({ where: { name: '老闆' }})

      if (shiftData){
        console.log("Shifts seed skipped 'cause data exist.")
      }else{
        await queryInterface.bulkInsert('Shifts', shifts, {})
        console.log('Shifts seed created successfully!')
      }
    } catch (err) {
      console.error(`Shifts seed creat error: ${err}`)
    }
  },
  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.bulkDelete('Shifts', {})
      console.log('Shifts seed removed!')
    } catch (err) {
      console.error(`Shifts seed delete error: ${err}`)
    }
  }
};
