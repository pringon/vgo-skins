'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    
    return queryInterface.addColumn(
      "users",
      "level",
      {
        type: Sequelize.TINYINT.UNSIGNED,
        defaultValue: 0
      }
    );
  },

  down: (queryInterface, Sequelize) => {
    
    return queryInterface.removeColumn(
      "users",
      "level"
    );
  }
};
