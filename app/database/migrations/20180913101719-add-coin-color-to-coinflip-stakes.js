'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      "CoinflipStakes",
      "coinColor",
      {
        type: Sequelize.STRING
      }
    );
  },

  down: (queryInterface, Sequelize) => {
    
    return queryInterface.addColumn("CoinflipStakes", "coinColor");
  }
};
