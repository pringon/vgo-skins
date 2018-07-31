"use strict";
const redis = require("redis");
const redisClient = (process.env.REDIS_URL ?
            redis.createClient(process.env.REDIS_URL) : redis.createClient());
            
const randomColor = require("randomcolor");

module.exports = {
  
    setStake: function(user, items, cb = null) {

        redisClient.hget(`jackpot_players:${user.id}`, "total", (err, total) => {

            if(total == null) {
                
                let multiTask = redisClient.multi();

                multiTask.sadd("jackpot_players", user.id);
                multiTask.hmset(`jackpot_players:${user.id}`, {
                    "user": user.user,
                    "avatar": user.avatar,
                    "color": randomColor(),
                    "total": items.reduce((acc, currValue) => acc + parseFloat(currValue.suggested_price)/100, 0).toFixed(2)
                });
                items.forEach(item => {
                    multiTask.sadd(`jackpot_players:${user.id}:items`, JSON.stringify(item))
                    multiTask.sadd(`jackpot_players:${user.id}:items:ids`, item.id);
                });
                multiTask.exec((err, results) => {

                    if(err) {
                        throw new Error(err);
                    }
                    if(cb !== null) {
                        cb(results);  
                    }
                    
                })
            } else {
                redisClient.smembers(`jackpot_players:${user.id}:items`, (err, currentItems) => {

                    let addedTotal = 0;
                    let insertedItems = [];
                    let multiTask = redisClient.multi();
                    items.forEach(item => {

                        if(!this.itemIsInSet(currentItems, item.id.toString())) {
                            addedTotal += parseFloat(item.suggested_price)/100;
                            multiTask.sadd(`jackpot_players:${user.id}:items`, JSON.stringify(item))
                            multiTask.sadd(`jackpot_players:${user.id}:items:ids`, item.id);
                            insertedItems.push(item);
                        }
                    });
                    multiTask.exec((err, results) => {

                        if(err) {
                            throw new Error(err);
                        }

                        redisClient.hset(`jackpot_players:${user.id}`, "total", (parseFloat(total) + addedTotal).toFixed(2));

                        if(cb !== null) {
                            cb(results);
                        }
                    });
                });
            }
            items.forEach(item => {
                redisClient.sadd(`jackpot_players:${user.id}:items`, JSON.stringify(item));
            });
        });
    },

    addOffer: function(offerId) {

        redisClient.sadd("jackpot_offers", offerId);
    },

    getPlayerCount: function(cb) {

        redisClient.scard("jackpot_plaers", (count) => {
            cb(count);
        })
    },

    getStake: function(userId, cb) {

        let multiTask = redisClient.multi();
        multiTask.hgetall(`jackpot_players:${userId}`);
        multiTask.smembers(`jackpot_players:${userId}:items`);
        multiTask.smembers(`jackpot_players:${userId}:items:ids`);
        multiTask.exec((err, results) => {

            if(results[0] == null) {
                cb(null);
                return;
            }
            let stake = results[0];
            stake.id = userId;
            stake.items = []
            for(let item of results[1]) {
                stake.items.push(JSON.parse(item));
            }
            stake.itemIds = results[2];
            cb(stake);
        });
    },

    getAllStakes: function(cb) {

        redisClient.smembers("jackpot_players", (err, playerList) => {

            if(playerList == null) {
                cb([]);
                return;
            }

            let multiTask = redisClient.multi();

            playerList.forEach((player) => {
                multiTask.hgetall(`jackpot_players:${player}`);
                multiTask.smembers(`jackpot_players:${player}:items`);
                multiTask.smembers(`jackpot_players:${player}:items:ids`);
            });

            multiTask.exec((err, results) => {
                
                let stakes = [];
                for(let index = 0, length = results.length; index < length; index += 3) {
                    stakes.push(results[index]);
                    stakes[index/3].id = playerList[index/3];
                    stakes[index/3].items = [];
                    for(let item of results[index+1]) {
                        stakes[index/3].items.push(JSON.parse(item));
                    }
                    stakes[index/3].itemIds = results[index+2];
                }

                cb(stakes);
            });

        });
    },

    wipeStakes: function(cb = null) {

        redisClient.smembers("jackpot_players", (err, playerList) => {

            let multiTask = redisClient.multi();
            multiTask.del("jackpot_players");
            playerList.forEach(player => {
                multiTask.del(`jackpot_players:${player}`);
                multiTask.del(`jackpot_players:${player}:items`);
            });

            multiTask.exec((err, results) => {

                if(cb !== null) {
                    cb(results);
                }
            });
        });
    },

    itemIsInSet: function(set, itemId) {

        for(let currentItem of set) {
            if(itemId == JSON.parse(currentItem).id) {
                return true;
            }
        }
        return false;
    },

    offerExists: function(offerId, cb) {

        redisClient.smembers("jackpot_offers", (err, offers) => {
            if(err) {
                throw new Error(err);
            }
            if(offers == null) {
                cb(false);
                return;
            }
            if(offers.indexOf(offerId.toString()) !== -1) {
                cb(true);
                return;
            }
            cb(false);
        })
    }
};