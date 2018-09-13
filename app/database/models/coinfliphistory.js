'use strict';

module.exports = (sequelize, DataTypes) => {
  const CoinflipHistory = sequelize.define('CoinflipHistory', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true
    },
    winner: DataTypes.BIGINT,
    host: DataTypes.BIGINT,
    challenger: DataTypes.BIGINT,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {});

  CoinflipHistory.procedures = require("../procedures/coinfliphistory")(CoinflipHistory, sequelize);

  CoinflipHistory.associate = function(models) {
    
  };
  return CoinflipHistory;
};