'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Order.belongsTo(models.User, { foreignKey: 'userId' })
      Order.belongsTo(models.Income, { foreignKey: 'incomeId' })
      Order.hasMany(models.Consume, { foreignKey: 'orderId' })

    }
  }
  Order.init({
    userId: DataTypes.INTEGER,
    shiftId: DataTypes.INTEGER,
    incomeId:DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
    totalPrice: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Order',
    tableName: 'Orders',
    underscored: true
  });
  return Order;
};