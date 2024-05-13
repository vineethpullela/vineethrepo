const Sequelize = require('sequelize');

const User = require('./user');

module.exports = (sequelize) => {
  const Student = sequelize.define('Student', {
    name: Sequelize.STRING,
  });

  Student.belongsTo(User);

  return Student;
};