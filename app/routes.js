"use strict";

const UsersController = require("./controllers/users.controller"),
      GamesController = require("./controllers/games.controller");

module.exports = (app, passport) => {

    app.get('/', async(req, res) => {
        if(req.user) {
            res.redirect("/games/roulette/diamond");
        } else {
            res.render("pages/home.ejs");
        }
    });

    app.get("/user/profile/:id", UsersController.isLoggedIn, UsersController.getProfile);
    app.get("/user/items", UsersController.isLoggedIn, UsersController.getAvailableItems);
    app.post("/user/tradeUrl", UsersController.isLoggedIn, UsersController.postTradeUrl);
    app.post("/user/auth/openid", passport.authenticate("steam-auth"));
    app.get("/user/auth/openid/return", passport.authenticate("steam-auth"), UsersController.handleOpenIDReturn);
    app.post("/user/logout", UsersController.isLoggedIn, UsersController.postLogout);

    app.get("/games/roulette/:rouletteType", UsersController.isLoggedIn, GamesController.getRoulette);
    app.get("/games/roulette/:rouletteType/items", UsersController.isLoggedIn, GamesController.getRouletteStake);
    app.post("/games/roulette/:rouletteType/:itemsGambled/:depositedAmount", UsersController.isLoggedIn, GamesController.postRouletteStake);
    app.get("/games/coinflip", UsersController.isLoggedIn, GamesController.getCoinflip);
    app.get("/games/coinflip/history", UsersController.isLoggedIn, GamesController.getCoinflipHistory);
    app.get("/games/coinflip/:lobbyId", UsersController.isLoggedIn, GamesController.getCoinflipLobby);
    app.get("/games/coinflip/history/:lobbyId", UsersController.isLoggedIn, GamesController.getCoinflipLobbyFromHistory);
    app.post("/games/coinflip/:itemsGambled/:depositedAmount/:coinColor", UsersController.isLoggedIn, GamesController.postCoinflipLobby);
    app.post("/games/coinflip/challenge/:lobbyId/:itemsGambled/:depositedAmount", UsersController.isLoggedIn, GamesController.postCoinflipDeposit);
};