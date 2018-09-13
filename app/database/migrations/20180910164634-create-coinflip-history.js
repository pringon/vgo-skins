'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('CoinflipHistories', {
      id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: Sequelize.BIGINT.UNSIGNED
      },
      winner: {
        type: Sequelize.BIGINT.UNSIGNED,
        references: {
          model: "users",
          key: "steamId"
        }
      },
      host: {
        type: Sequelize.BIGINT.UNSIGNED,
        references: {
          model: "CoinflipStakes",
          key: "id"
        }
      },
      challenger: {
        type: Sequelize.BIGINT.UNSIGNED,
        references: {
          model: "CoinflipStakes",
          key: "id"
        }
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
    return queryInterface.dropTable('CoinflipHistories');
  }
};