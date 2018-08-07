'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('JackpotHistories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      winner: {
        type: Sequelize.BIGINT.UNSIGNED,
        references: {
          model: "users",
          key: "steamId"
        }
      },
      total: {
        type: Sequelize.INTEGER.UNSIGNED
      },
      tier: {
        type: Sequelize.TINYINT
      },
      stakes: {
        type: Sequelize.JSON
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
    return queryInterface.dropTable('JackpotHistories');
  }
};