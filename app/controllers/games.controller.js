"use strict";
const userUtils = require("../../libs/user_utils");

module.exports = (() => {

    this.getRoulette = (req, res) => {
        let currentUser = userUtils.getUser(req.user.steamId);
        res.render("pages/roulette.ejs", {
            currentUser,
            chat: true
        });
    }

    return this;
})();