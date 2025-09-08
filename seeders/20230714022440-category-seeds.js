'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const menuNav = [
      {
        name: '原葉茗茶',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: '香濃醇乳',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: '風味特調',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: '現榨鮮果',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]
    
    try {
      const Category = require('../models/category')
      const categoryData1 = await Category.findOne({ where: { name: '香濃醇乳' }})
      const categoryData2 = await Category.findOne({ where: { name: '現榨鮮果' }})

      if(categoryData1 && categoryData2){
        console.log("Categories seed skipped 'cause data exist.")
      }else{
        await queryInterface.bulkInsert('Categories', menuNav, {})
        console.log(`Categories seed created successfully!`)
      }
    } catch (err) {
      console.error(`Categories seed error: ${err}`)
    }
  },
  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.bulkDelete('Categories', {})
      console.log('Categories seed removed!')
    } catch (err) {
      console.error(`Error on removing categories seed: ${err}`)
    }
  }
};
