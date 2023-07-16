'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Topping extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Topping.belongsToMany(models.Consume,{
        through: models.Customization,
        foreignKey: ''
      })
    }
  }
  Topping.init({
    name: DataTypes.STRING,
    price: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Topping',
    tableName: 'Toppings',
    underscored: true,
  });
  return Topping;
};