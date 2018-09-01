"use strict";
const db    = require("../app/database/models"),
      redis = require("redis");
const redisClient = (process.env.REDIS_URL ? 
            redis.createClient(process.env.REDIS_URL) : redis.createClient());

module.exports = (() => {

    let lobbyCount = 0;

    const createLobby = (user, items, coinColor, cb = null) => {

        let totalDeposited = items.reduce((acc, currValue) => acc + parseFloat(currValue.suggested_value)/100, 0).toFixed(2);
        db.user.update({
            skinsWagered: db.Sequelize.literal(`skinsWagered + ${items.length}`),
            totalGambled: db.Sequelize.literal(`totalGambled + ${totalDeposited}`)
        }, {
            where: { steamId: user.id }
        });
        db.user.addExperience(user.id, totalDeposited);

        let multiTask = redisClient.multi();

        multiTask.sadd("coinflip_lobbies", lobbyCount);
        multiTask.hmset(`coinflip_lobbies:${lobbyCount}:host`, {
            "id": user.id,
            "user": user.user,
            "avatar": user.avatar,
            "total": totalDeposited,
            "coinColor": coinColor
        });
        items.forEach(item => {
            multiTask.sadd(`coinflip_lobbies:${lobbyCount}:host:items`, JSON.stringify(item));
            multiTask.sadd(`coinflip_lobbies:${lobbyCount}:host:items:ids`, item.id);
        });
        multiTask.exec((err, results) => {
            if(err) {
                throw new Error(err);
            }
            lobbyCount++;
            if(cb !== null) {
                cb(results);
                return
            }
        });
    };

    const setLobbyStake = (user, items, coinColor, lobbyId, cb = null) => {

        let totalDeposited = items.reduce((acc, currValue) => acc + parseFloat(currValue.suggested_value)/100, 0).toFixed(2);
        db.user.update({
            skinsWagered: db.Sequelize.literal(`skinsWagered + ${items.length}`),
            totalGambled: db.Sequelize.literal(`totalGambled + ${totalDeposited}`)
        }, {
            where: { steamId: user.id }
        });
        db.user.addExperience(user.id, totalDeposited);

        let multiTask = redisClient.multi();

        multiTask.hmset(`coinflip_lobbies:${lobbyId}:challenger`, {
            "id": user.id,
            "user": user.user,
            "avatar": user.avatar,
            "total": totalDeposited,
            "coinColor": coinColor
        });
        items.forEach(item => {
            multiTask.sadd(`coinflip_lobbies:${lobbyId}:challenger:items`, JSON.stringify(item));
            multiTask.sadd(`coinflip_lobbies:${lobbyId}:challenger:items:ids`, item.id);
        });

        multiTask.exec((err, results) => {

            if(err) {
                throw new Error(err);
            }
            if(cb !== null) {
                cb(results);
            }
            return;
        });
    };

    const getLobby = (lobbyId, cb) => {

        let multiTask = redisClient.multi();
        multiTask.hgetall(`coinflip_lobbies:${lobbyId}:host`);
        multiTask.smembers(`coinflip_lobbies:${lobbyId}:host:items`);
        multiTask.hgetall(`coinflip_lobbies:${lobbyId}:challenger`);
        multiTask.smembers(`coinflip_lobbies:${lobbyId}:challenger:items`);

        multiTask.exec((err, results) => {
            let lobby = { id: lobbdyId };
            lobby.host = results[0];
            lobby.host.items = [];
            for(let item of results[1]) {
                lobby.host.items.push(JSON.parse(item));
            }

            if(results[2] !== null) {
                lobby.challenger = results[2];
                lobby.challenger.items = [];
                for(let item of results[3]) {
                    lobby.challenger.items.push(JSON.parse(item));
                }
            }
            cb(lobby);
        });
    };

    const getLobbies = (cb) => {

        redisClient.smembers("coinflip_lobbies", (err, lobbyIds) => {

            if(lobbyIds == null) {
                cb([]);
                return;
            }
            
            let multiTask = redisClient.multi();

            lobbyIds.forEach(lobbyId => {
                multiTask.hgetall(`coinflip_lobbies:${lobbyId}:host`);
                multiTask.smembers(`coinflip_lobbies:${lobbyId}:host:items`);
                multiTask.hgetall(`coinflip_lobbies:${lobbyId}:challenger`);
                multiTask.smembers(`coinflip_lobbies:${lobbyId}:challenger:items`);
            });

            multiTask.exec((err, results) => {

                let lobbies = [];
                for(let index = 0, length = results.length; index < length; index += 4) {
                    lobbies.push({
                        id: lobbyIds[index/4]
                    });

                    lobbies[index/4].host = results[index];
                    lobbies[index/4].host.items = [];
                    for(let item of results[index+1]) {
                        lobbies[index/4].host.items.push(JSON.parse(item));
                    }

                    if(results[index+2] !== null) {
                        lobbies[index/4].challenger = results[index+2];
                        lobbies[index/4].challenger.items = [];
                        for(let item of results[index+3]) {
                            lobbies[index/4].challenger.items.push(JSON.parse(item));
                        }
                    }
                }
                cb(lobbies);
            });
        });
    };

    return ({
        createLobby,
        setLobbyStake,
        getLobby,
        getLobbies
    });
})();