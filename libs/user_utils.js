"use strict";
const request = require("request-promise"),
      baseUri = "http://api.steampowered.com";

module.exports = (() => {

    this.getUser = async(userId) => {
        let jsonData = await request(`${baseUri}/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API_KEY}&steamids=${userId}`);
        let data = JSON.parse(jsonData);
        return data.response.players[0];
    };

    return this;
})();