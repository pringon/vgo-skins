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
    }
  }, {});
  User.associate = function(models) {
    // associations can be defined here
  };
  return User;
};