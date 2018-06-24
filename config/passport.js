"use strict"
const OpenIDStrategy = require("passport-openid").Strategy;

module.exports = (passport) => {

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport.deserializeUser((id, done) => {
        done(null, {
            id: id,
            steamId: id.match(/\d+$/)[0]
        });
    });

    passport.use("steam-auth", new OpenIDStrategy({
        providerURL: "http://steamcommunity.com/openid",
        stateless: true,
        returnURL: "http://localhost:3000/auth/openid/return",
        realm: "http://localhost:3000/"
        }, (id, done) => {

            process.nextTick(() => {

                let user = {
                    id: id,
                    steamId: id.match(/\d+$/)[0]
                };
                return done(null, user);
            });
        }));
};