'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Consume extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Consume.belongsTo(models.Drink, { foreignKey: 'drinkName' })
      Consume.belongsTo(models.Ice, { foreignKey: 'drinkIce' })
      Consume.belongsTo(models.Sugar, { foreignKey: 'drinkSugar' })
      Consume.belongsTo(models.User, { foreignKey: 'userId' })
      Consume.belongsTo(models.Order, { foreignKey: 'orderId' })
      Consume.hasMany(models.Customization, { foreignKey: 'consumeId' })
      Consume.belongsToMany(models.Topping, {
        through: models.Customization,
        foreignKey: 'consumeId',
        as: 'addToppings'
      })
    }
  }
  Consume.init({
    drink_name: DataTypes.STRING,
    drink_ice: DataTypes.INTEGER,
    drink_sugar: DataTypes.INTEGER,
    drink_price: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    order_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Consume',
    tableName: 'Consumes',
    underscored: true,
  });
  return Consume;
};