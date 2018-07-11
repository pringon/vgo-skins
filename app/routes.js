"use strict";

const UsersController = require("./controllers/users.controller"),
      GamesController = require("./controllers/games.controller"),
      userUtils       = require("../libs/user_utils");

module.exports = (app, passport) => {

    app.get('/', async(req, res) => {
        if(req.user) {
            let currentUser = await userUtils.getUser(req.user.steamId);
            res.render("pages/home.ejs", {
                currentUser: currentUser,
                chat: true
            });
        } else {
            res.render("pages/home.ejs");
        }
    });

    app.get("/user/profile/:id", UsersController.isLoggedIn, UsersController.getProfile);
    app.post("/user/tradeUrl", UsersController.isLoggedIn, UsersController.postTradeUrl);
    app.post("/user/auth/openid", passport.authenticate("steam-auth"));
    app.get("/user/auth/openid/return", passport.authenticate("steam-auth"), UsersController.handleOpenIDReturn);
    app.post("/user/logout", UsersController.isLoggedIn, UsersController.postLogout);

    app.get("/games/roulette", UsersController.isLoggedIn, GamesController.getRoulette);
    app.get("/games/headon", UsersController.isLoggedIn, GamesController.getHeadon);
};