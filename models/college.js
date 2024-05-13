const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  const College = sequelize.define('College', {
    name: Sequelize.STRING,
    state: Sequelize.STRING,
    city: Sequelize.STRING,
    campus: Sequelize.STRING,
  });
  return College;
};