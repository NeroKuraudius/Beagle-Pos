'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Customization extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Customization.belongsTo(models.Consume, {
        foreignKey: 'consumeId'
      })
      Customization.belongsTo(models.Topping, {
        foreignKey: 'toppingId'
      })
    }
  }
  Customization.init({
    consumeId: DataTypes.INTEGER,
    toppingId: DataTypes.INTEGER,
    toppingPrice: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Customization',
    tableName: 'Customizations',
    underscored: true,
  });
  return Customization;
};