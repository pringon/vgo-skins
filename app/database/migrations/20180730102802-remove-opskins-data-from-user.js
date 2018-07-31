'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    
    return [
      queryInterface.removeColumn("users", "opskinsId"),
      queryInterface.removeColumn("users", "opskinsTradeToken")
    ];
  },

  down: (queryInterface, Sequelize) => {
    
    return [
      queryInterface.addColumn(
        "users",
        "opskinsId",
        {
          type: Sequelize.INTEGER.UNSIGNED
        }
      ),
      queryInterface.addColumn(
        "users",
        "opskinsTradeToken",
        {
          type: Sequelize.STRING
        }
    )];
  }
};
