'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    
    return [
      queryInterface.removeColumn("users", "opskinsTradeUrl"),
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
  },

  down: (queryInterface, Sequelize) => {
    
    return [
      queryInterface.removeColumn("users", "opskinsId"),
      queryInterface.removeColumn("users", "opskinsTradeToken"),
      queryInterface.addColumn(
        "users",
        "opskinsTradeUrl",
        {
          type: Sequelize.STRING
        }
      )];
  }
};
