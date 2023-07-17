'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Shift extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Shift.hasMany(models.User, { foreignKey: 'userId' })
    }
  }
  Shift.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Shift',
    tableName: 'Shift',
    underscored: true,
  });
  return Shift;
};