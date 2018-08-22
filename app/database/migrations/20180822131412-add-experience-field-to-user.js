'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    
    return queryInterface.addColumn(
      "users",
      "experiencePoints",
      {
        type: Sequelize.INTEGER.UNSIGNED,
        defaultValue: 0
      }
    );
  },

  down: (queryInterface, Sequelize) => {
    
    return queryInterface.removeColumn("users", "experiencePoints");
  }
};
