"use strict";
const userUtils = require("../../libs/user_utils");

module.exports = (() => {

    this.getRoulette = async(req, res) => {
        let currentUser = await userUtils.getUser(req.user.steamId);
        res.render("pages/roulette.ejs", {
            currentUser,
            chat: true,
            roulette: true
        });
    }

    return this;
})();