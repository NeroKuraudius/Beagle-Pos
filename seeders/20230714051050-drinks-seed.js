'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const menu = [
      // 原葉茗茶
      { name: '熟成紅茶', price: 30, category_id: 1, created_at: new Date(), updated_at: new Date() },
      { name: '薰香綠茶', price: 30, category_id: 1, created_at: new Date(), updated_at: new Date() },
      { name: '四季青茶', price: 30, category_id: 1, created_at: new Date(), updated_at: new Date() },
      { name: '高山烏龍', price: 30, category_id: 1, created_at: new Date(), updated_at: new Date() },
      // 香濃醇乳
      { name: '熟成拿鐵', price: 45, category_id: 2, created_at: new Date(), updated_at: new Date() },
      { name: '薰香奶綠', price: 45, category_id: 2, created_at: new Date(), updated_at: new Date() },
      { name: '四季奶青', price: 45, category_id: 2, created_at: new Date(), updated_at: new Date() },
      { name: '烏龍拿鐵', price: 45, category_id: 2, created_at: new Date(), updated_at: new Date() },
      { name: '冷露拿鐵', price: 45, category_id: 2, created_at: new Date(), updated_at: new Date() },
      { name: '相思拿鐵', price: 50, category_id: 2, created_at: new Date(), updated_at: new Date() },
      { name: '抹茶拿鐵', price: 55, category_id: 2, created_at: new Date(), updated_at: new Date() },
      { name: '芋頭鮮奶', price: 55, category_id: 2, created_at: new Date(), updated_at: new Date() },
      // 風味特調
      { name: '桂花蜜茶', price: 35, category_id: 3, created_at: new Date(), updated_at: new Date() },
      { name: '仙草干茶', price: 35, category_id: 3, created_at: new Date(), updated_at: new Date() },
      { name: '檸檬冬瓜', price: 35, category_id: 3, created_at: new Date(), updated_at: new Date() },
      { name: '優多綠茶', price: 40, category_id: 3, created_at: new Date(), updated_at: new Date() },
      { name: '蜜香果醋', price: 40, category_id: 3, created_at: new Date(), updated_at: new Date() },
      { name: '黑糖可可', price: 45, category_id: 3, created_at: new Date(), updated_at: new Date() },
      // 現榨鮮果
      { name: '葡萄柚綠', price: 40, category_id: 4, created_at: new Date(), updated_at: new Date() },
      { name: '百香冰綠', price: 40, category_id: 4, created_at: new Date(), updated_at: new Date() },
      { name: '蜂蜜檸檬', price: 45, category_id: 4, created_at: new Date(), updated_at: new Date() },
      { name: '芭樂檸檬', price: 45, category_id: 4, created_at: new Date(), updated_at: new Date() },
      { name: '金桔檸檬', price: 45, category_id: 4, created_at: new Date(), updated_at: new Date() },
      { name: '番茄冰梅', price: 45, category_id: 4, created_at: new Date(), updated_at: new Date() },
      { name: '蘋果冰茶', price: 50, category_id: 4, created_at: new Date(), updated_at: new Date() },
    ]
    try {
      await queryInterface.bulkInsert('Drinks', menu, {})
      console.log('Drinks seed created successfully!')
    } catch (err) {
      console.error(`Drinks seed create error: ${err}`)
    }
  },
  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.bulkDelete('Drinks', {})
      console.log('Drinks seed removed!')
    } catch (err) {
      console.error(`Drinks seed delete error: ${err}`)
    }
  }
};
