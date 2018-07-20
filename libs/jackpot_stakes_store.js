"use strict";
let redisClient;
if(process.env.REDIS_URL) {
    redisClient = require("redis").createClient(process.env.REDIS_URL);
} else {
    redisClient = require("redis").createClient();
}
const randomColor = require("randomcolor");

module.exports = {
  
    setStake: function(user, items, color = randomColor()) {
        
        redisClient.sadd("jackpot_players", user.id);
        redisClient.hmset(`jackpot_stakes:${user.id}`, {
            "id": user.id,
            "user": user.user,
            "avatar": user.avatar,
            "color": color,
            "items": JSON.stringify(items),
            "total": items.reduce((acc, currValue) => acc + parseFloat(currValue.price), 0).toFixed(2)
        });
    },

    getStake: function(userId, cb) {

        redisClient.hgetall(`jackpot_stakes:${userId}`, (err, result) => {
            if(err) {
                throw err;
            }
            if(result === null) {
                cb(null);
                return;
            }
            result.items = JSON.parse(result.items);
            result.total = parseFloat(result.total);
            cb(result);
        });
    },

    getAllStakes: function(cb) {

        redisClient.smembers("jackpot_players", (err, playersList) => {

            if(playersList === null) {
                cb([]);
                return;
            }

            let multiTask = redisClient.multi();

            playersList.forEach(player => {
                multiTask.hgetall(`jackpot_stakes:${player}`)
            });

            multiTask.exec((err, results) => {
                results.forEach(result => {
                    result.items = JSON.parse(result.items);
                    result.total = parseFloat(result.total);
                });
                cb(results);
            });
        });
    },

    wipeStakes: function() {

        redisClient.smembers("jackpot_players", (err, playersList) => {

            redisClient.del("jackpot_players");

            let multiTask = redisClient.multi();

            playersList.forEach(player => multiTask.hdel(`jackpot_stakes:${player}`, "id", "user", "avatar", "color", "total", "items"));

            multiTask.exec();
        });
    }
};