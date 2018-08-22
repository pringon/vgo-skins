'use strict';
const request = require("request-promise"),
      baseUri = "http://api.steampowered.com";

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

  JackpotHistory.getHistory = function(query = {}, cb = null) {
    JackpotHistory.findAll({
      limit: 5,
      where: query,
      order: [[ "id", "DESC" ]]
    }).then(history => {
      let requestedUsers = {};
      let userArray = [];
      history.forEach(round => {
        if(!requestedUsers[round.winner]) {
          requestedUsers[round.winner] = {};
          userArray.push(round.winner);
        }
        round.stakes = JSON.parse(round.stakes);
        round.stakes.forEach(player => {
          if(!requestedUsers[player.userId]) {
            requestedUsers[player.userId] = {};
            userArray.push(player.userId);
          }
          if(player.userId == round.winner) {
            round.winner = {
              id: round.winner,
              total: player.total
            }
          }
        });
      });
      request({
        uri: `${baseUri}/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API_KEY}&steamids=${userArray.join(',')}`,
        json: true
      }).then(body => {
        body.response.players.forEach(profile => {
          requestedUsers[profile.steamid] = {
            name: profile.personaname,
            avatar: profile.avatarfull
          };
        });
        history.forEach(round => {
          round.winner = {
            ...round.winner,
            ...requestedUsers[round.winner.id]
          };
          round.stakes.forEach((player) => {
            player.userData = {
              id: player.userId,
              ...requestedUsers[player.userId]
            };
          });
        });
        if(cb) {
          cb(history);
        }
      });
    });
  };

  JackpotHistory.associate = function(models) {
    JackpotHistory.belongsTo(models.user, {foreignKey: "winner", targetKey: "steamId"});
  };
  return JackpotHistory;
};