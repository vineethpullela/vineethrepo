const Sequelize = require('sequelize');
const bcrypt = require('bcryptjs');

const College = require('./college');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    username: Sequelize.STRING,
    password: Sequelize.STRING,
    role: Sequelize.ENUM('super_admin', 'admin', 'teacher', 'student'),
    collegeId: {
      type: Sequelize.INTEGER,
      references: {
        model: College,
        key: 'id',
      },
    },
    section: Sequelize.STRING,
  });

  User.beforeCreate(async (user) => {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  });

  return User;
};