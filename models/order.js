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
      // define association here
    }
  }
  Order.init({
    user_id: DataTypes.INTEGER,
    shift_id: DataTypes.INTEGER,
    start_consume: DataTypes.INTEGER,
    end_consume: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
    total_price: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Order',
    tableName: 'Orders',
    underscored: true
  });
  return Order;
};