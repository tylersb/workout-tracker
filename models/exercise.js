'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class exercise extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.exercise.belongsToMany(models.user, {
        through: 'users_exercises'
      })
    }
  }
  exercise.init({
    name: DataTypes.STRING,
    type: DataTypes.STRING,
    muscle: DataTypes.STRING,
    equipment: DataTypes.STRING,
    difficulty: DataTypes.STRING,
    instructions: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'exercise',
  });
  return exercise;
};