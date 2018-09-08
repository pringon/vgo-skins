"use strict";
const db    = require("../app/database/models"),
      redis = require("redis");
const redisClient = (process.env.REDIS_URL ?
            redis.createClient(process.env.REDIS_URL) : redis.createClient());
            
const randomColor = require("randomcolor");

module.exports = {
  
    getRoundToken: function(tier, cb) {

        redisClient.get(`jackpot_round_ticket:${tier}`, cb);
    },

    setRoundToken: function(tier) {

        redisClient.set(`jackpot_round_ticket:${tier}`, Math.random());
    },

    setStake: function(tier, user, items, cb = null) {

        let totalDeposited = items.reduce((acc, currValue) => acc + parseFloat(currValue.suggested_price)/100, 0).toFixed(2);
        db.user.update({
            skinsWagered: db.Sequelize.literal(`skinsWagered + ${items.length}`),
            totalGambled: db.Sequelize.literal(`totalGambled + ${totalDeposited}`)
        }, {
            where: { steamId: user.id }
        });
        db.user.addExperience(user.id, totalDeposited);

        redisClient.hget(`jackpot_players:${tier}:${user.id}`, "total", (err, total) => {

            if(total == null) {
                
                let multiTask = redisClient.multi();

                multiTask.sadd(`jackpot_players:${tier}`, user.id);
                multiTask.hmset(`jackpot_players:${tier}:${user.id}`, {
                    "user": user.user,
                    "avatar": user.avatar,
                    "color": randomColor(),
                    "total": totalDeposited
                });
                items.forEach(item => {
                    multiTask.sadd(`jackpot_players:${tier}:${user.id}:items`, JSON.stringify(item))
                    multiTask.sadd(`jackpot_players:${tier}:${user.id}:items:ids`, item);
                });
                multiTask.exec((err, results) => {

                    if(err) {
                        throw new Error(err);
                    }
                    if(cb !== null) {
                        cb(results);
                    }
                    return;
                })
            } else {
                redisClient.smembers(`jackpot_players:${tier}:${user.id}:items`, (err, currentItems) => {

                    let insertedItems = [];
                    let multiTask = redisClient.multi();
                    items.forEach(item => {

                        if(!this.itemIsInSet(currentItems, item)) {
                            multiTask.sadd(`jackpot_players:${tier}:${user.id}:items`, JSON.stringify(item))
                            multiTask.sadd(`jackpot_players:${tier}:${user.id}:items:ids`, item);
                            insertedItems.push(item);
                        }
                    });
                    multiTask.exec((err, results) => {

                        if(err) {
                            throw new Error(err);
                        }

                        redisClient.hset(`jackpot_players:${tier}:${user.id}`, "total", parseFloat(parseFloat(total) + totalDeposited).toFixed(2));

                        if(cb !== null) {
                            cb(results);
                        }
                        return;
                    });
                });
            }
            items.forEach(item => {
                redisClient.sadd(`jackpot_players:${tier}:${user.id}:items`, JSON.stringify(item));
            });
        });
    },

    getPlayerCount: function(tier, cb = null) {

        redisClient.scard(`jackpot_players:${tier}`, (err, count) => {
            if(cb) {
                cb(count);
            }
        })
    },

    getStake: function(tier, userId, cb = null) {

        let multiTask = redisClient.multi();
        multiTask.hgetall(`jackpot_players:${tier}:${userId}`);
        multiTask.smembers(`jackpot_players:${tier}:${userId}:items`);
        multiTask.smembers(`jackpot_players:${tier}:${userId}:items:ids`);
        multiTask.exec((err, results) => {

            if(results[0] == null) {
                if(cb) {
                    cb(null);
                }
                return;
            }
            let stake = results[0];
            stake.id = userId;
            stake.items = []
            for(let item of results[1]) {
                stake.items.push(JSON.parse(item));
            }
            stake.itemIds = results[2];
            if(cb) {
                cb(stake);
            }
        });
    },

    getAllStakes: function(tier, cb) {

        redisClient.smembers(`jackpot_players:${tier}`, (err, playerList) => {

            if(playerList == null) {
                cb([]);
                return;
            }

            let multiTask = redisClient.multi();

            playerList.forEach((player) => {
                multiTask.hgetall(`jackpot_players:${tier}:${player}`);
                multiTask.smembers(`jackpot_players:${tier}:${player}:items`);
                multiTask.smembers(`jackpot_players:${tier}:${player}:items:ids`);
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

    wipeStakes: function(tier, cb = null) {

        redisClient.smembers(`jackpot_players:${tier}`, (err, playerList) => {

            if(playerList == null || playerList == []) {
                cb([]);
                return;
            }

            let multiTask = redisClient.multi();
            multiTask.del(`jackpot_players:${tier}`);
            playerList.forEach(player => {
                multiTask.del(`jackpot_players:${tier}:${player}`);
                multiTask.del(`jackpot_players:${tier}:${player}:items`);
                multiTask.del(`jackpot_players:${tier}:${player}:itemIds`);
            });

            multiTask.exec((err, results) => {

                if(cb !== null) {
                    cb(err, results);
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

    addOffer: function(offerId) {

        redisClient.sadd("jackpot_offers", offerId);
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