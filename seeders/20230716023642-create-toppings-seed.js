'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const toppings = [
      {
        name: '珍珠',
        price: 10,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: '寒天',
        price: 10,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: '奶蓋',
        price: 10,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: '蜂蜜凍',
        price: 10,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: '芋圓',
        price: 15,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: '布丁',
        price: 15,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: '冰淇淋',
        price: 15,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]
    
    try {
      const Topping = require('../models/topping')
      const toppingData1 = await Topping.findOne({ where: { name: '寒天' }})
      const toppingData2 = await Topping.findOne({ where: { name: '布丁' }})

      if(toppingData1 && toppingData2){
        console.log("Toppings seed skipped 'cause data exist.")
      }else{
        await queryInterface.bulkInsert('Toppings', toppings, {})
        console.log('Toppings seed created successfully!')
      }
    } catch (err) {
      console.error(`Toppings seed creat error: ${err}`)
    }
  },
  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.bulkDelete('Toppings', {})
      console.log('Toppings seed removed!')
    } catch (err) {
      console.error(`Toppings seed delete error: ${err}`)
    }
  }
};
