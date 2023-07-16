'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Ice extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Ice.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Ice',
    tableName:'Ices',
    underscored: true,
  });
  return Ice;
};