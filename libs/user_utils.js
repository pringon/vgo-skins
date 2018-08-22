"use strict";
const request = require("request-promise"),
      db      = require("../app/database/models"),
      baseUri = "http://api.steampowered.com";

module.exports = (() => {

    this.opskinsHeaders = { 
        Authorization: "Basic " + Buffer.from(process.env.OPSKINS_API_KEY + ":", "ascii").toString("base64")
    };

    this.getUser = (userId, cb = null) => {
        request(`${baseUri}/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API_KEY}&steamids=${userId}`)
            .then(data => JSON.parse(data))
            .then(data => {
                console.log(data);
                if(cb !== null) {
                    cb(null, data.response.players[0]);
                    return;
                }
            });
    };

    this.getAvailableItems = (userId, cb = null) => {
        
        console.log("Steam id is ", userId);
        request({
            method: "GET",
            uri: `https://api-trade.opskins.com/ITrade/GetUserInventoryFromSteamId/v1/?steam_id=${userId}&app_id=1`,
            headers: this.opskinsHeaders,
            json: true
        }).then(items => {
            cb(null, items.response.items);
        }).catch(err => {
            cb(err);
        });
    }

    return this;
})();