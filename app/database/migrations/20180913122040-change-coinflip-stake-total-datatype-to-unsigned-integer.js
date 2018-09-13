'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    
    return queryInterface.changeColumn(
      "CoinflipStakes",
      "total",
      {
        type: Sequelize.INTEGER.UNSIGNED
      }
    );
  },

  down: (queryInterface, Sequelize) => {
    
    return queryInterface.changeColumn(
      "CoinflipStakes",
      "total",
      {
        type: Sequelize.INTEGER
      }
    );
  }
};
