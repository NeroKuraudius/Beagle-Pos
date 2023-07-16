'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Sugar extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Sugar.hasMany(models.Consume, { foreignKey: 'drinkSugar', as: 'drinkSugar' })
    }
  }
  Sugar.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Sugar',
    tableName:'Sugars',
    underscored: true,
  });
  return Sugar;
};