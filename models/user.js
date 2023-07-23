'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.belongsTo(models.Shift, { foreignKey: 'shiftId' })
      User.hasMany(models.Consume, { foreignKey: 'userId' })
      User.hasMany(models.Order, { foreignKey: 'userId' })
      User.hasMany(models.Income, { foreignKey: 'userId' })
    }
  }
  User.init({
    name: DataTypes.STRING,
    phone: DataTypes.STRING,
    account: DataTypes.STRING,
    password: DataTypes.STRING,
    role: DataTypes.STRING,
    shift_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users',
    underscored: true,
  });
  return User;
};