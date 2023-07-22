'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Drink extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Drink.belongsTo(models.Category, { foreignKey: 'categoryId' })
      Drink.hasMany(models.Consume, { foreignKey: 'drinkName' })
    }
  }
  Drink.init({
    name: DataTypes.STRING,
    price: DataTypes.INTEGER,
    category_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Drink',
    tableName: 'Drinks',
    underscored: true,
  });
  return Drink;
};