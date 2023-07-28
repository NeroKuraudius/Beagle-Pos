'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Category.hasMany(models.Drink, { foreignKey: 'categoryId', as: 'categoryDrinks' })
    }
  }
  Category.init({
    name: DataTypes.STRING,
    isRemoved: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Category',
    tableName: 'Categories',
    underscored: true,
  });
  return Category;
};