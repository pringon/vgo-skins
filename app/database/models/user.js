'use strict';
module.exports = (sequelize, DataTypes) => {
  var User = sequelize.define('user', {
    steamId: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true
    },
    level: {
      type: DataTypes.TINYINT.UNSIGNED,
      defaultValue: 0
    },
    experiencePoints: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0
    },
    totalGambled: {
      type: DataTypes.DECIMAL.UNSIGNED,
      defaultValue: 0
    },
    totalWon: {
      type: DataTypes.DECIMAL.UNSIGNED,
      defaultValue: 0
    },
    skinsWagered: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0
    },
    luckiestWin: {
      type: DataTypes.FLOAT,
      defaultValue: 100
    }
  }, {});

  User.addExperience = function(userId, pointsGained) {
    User.findOne({ 
      where: { steamId: userId }
    }).then(user => {
      console.log(user);
      pointsGained = parseInt(pointsGained*100);
      let experienceToNextLevel = 200 + Math.pow(this.level+1, 2.6);
      let level, experiencePoints;
      if(pointsGained + user.experiencePoints >= experienceToNextLevel) {
        level = user.level + 1;
        experiencePoints = pointsGained - (experienceToNextLevel - user.experiencePoints);
      } else {
        level = user.level;
        experiencePoints = pointsGained + user.experiencePoints;
      }
      User.update({
        level,
        experiencePoints
      }, {
        where: { steamId: userId }
      }).catch(err => {
        console.log(`Experience points not added because of error ${err}`);
      });
    });
  }

  User.associate = function(models) {
    User.hasMany(models.JackpotHistory, {foreignKey: "winner", targetKey: "steamId"});
  };
  return User;
};