"use strict";

const db        = require("../database/models"),
      userUtils = require("../../libs/user_utils");

module.exports = (() => {

    this.isLoggedIn = (req, res, next) => {
        if(req.isAuthenticated()) {
          return next();
        }
      
        res.redirect('/');
    };

    this.getProfile = async(req, res) => {

        let currentUser = await userUtils.getUser(req.user.steamId);
        if(req.params.id == req.user.steamId) {
            res.render("pages/profile.ejs", {
                currentUser: currentUser,
                queriedUser: currentUser
            });
        } else {
            let queriedUser = await userUtils.getUser(req.params.id);
            if(typeof queriedUser === 'undefined') {
                queriedUser = currentUser;
            }
            res.render("pages/profile.ejs", {
                currentUser: currentUser,
                queriedUser: queriedUser
            });
        }
    };

    this.handleOpenIDReturn = (req, res) => {

        if(req.user) {
            res.redirect('/');
        } else {
            res.redirect("/?failed");
        }
    };

    this.postTradeUrl = (req, res) => {

        if(req.body.tradeUrl.indexOf("https://trade.opskins.com/t/") == 0) {
            db.user.update({
                opskinsTradeUrl: req.body.tradeUrl
            }, {
                where: { steamId: req.user.steamId }
            });
            
            res.status(204);
            res.send();
        }
    },

    this.postLogout = (req, res) => {

        req.logout();
        res.redirect('/');
    };

    return this;
})();