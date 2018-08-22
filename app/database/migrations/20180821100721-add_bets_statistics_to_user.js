'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return [
      queryInterface.addColumn(
        "users",
        "totalGambled",
        {
          type: Sequelize.DECIMAL(10, 2).UNSIGNED,
          defaultValue: 0.0
        }
      ),
      queryInterface.addColumn(
        "users",
        "totalWon",
        {
          type: Sequelize.DECIMAL(10, 2).UNSIGNED,
          defaultValue: 0.0
        }
      ),
      queryInterface.addColumn(
        "users",
        "skinsWagered",
        {
          type: Sequelize.INTEGER.UNSIGNED,
          defaultValue: 0
        }
      ),
      queryInterface.addColumn(
        "users",
        "luckiestWin",
        {
          type: Sequelize.DECIMAL(5, 2).UNSIGNED,
          defaultValue: 100.0
        }
      )
    ];
  },

  down: (queryInterface, Sequelize) => {
    return [
      queryInterface.removeColumn("users", "totalGambled"),
      queryInterface.removeColumn("users", "totalWon"),
      queryInterface.removeColumn("users", "skinsWagered"),
      queryInterface.removeColumn("users", "luckiestWin")
    ];
  }
};
