'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('CoinflipStakes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT.UNSIGNED
      },
      user: {
        type: Sequelize.BIGINT.UNSIGNED,
        references: {
          model: "users",
          key: "steamId"
        }
      },
      total: {
        type: Sequelize.INTEGER.UNSIGNED,
      },
      stake: {
        type: Sequelize.JSON,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('CoinflipStakes');
  }
};