'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class workout extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.workout.belongsTo(models.user)
    }
  }
  workout.init({
    userId: DataTypes.INTEGER,
    date: DataTypes.DATE,
    exercise: DataTypes.STRING,
    weight: DataTypes.INTEGER,
    reps: DataTypes.INTEGER,
    duration: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'workout',
  });
  return workout;
};