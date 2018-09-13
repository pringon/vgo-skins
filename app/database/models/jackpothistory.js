'use strict';

module.exports = (sequelize, DataTypes) => {
  var JackpotHistory = sequelize.define('JackpotHistory', {
    winner: {
      type: DataTypes.BIGINT.UNSIGNED,
      foreignKey: true
    },
    total: DataTypes.INTEGER.UNSIGNED,
    tier: DataTypes.TINYINT,
    stakes: DataTypes.JSON
  }, {});

  JackpotHistory.procedures = require("../procedures/jackpothistory")(JackpotHistory);

  JackpotHistory.associate = function(models) {
    JackpotHistory.belongsTo(models.user, {foreignKey: "winner", targetKey: "steamId"});
  };
  return JackpotHistory;
};