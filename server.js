"use strict";
require("dotenv").config();
const express        = require("express"),
      app            = express(),
      expressLayouts = require("express-ejs-layouts"),
      logger         = require("morgan"),
      flash          = require("connect-flash"),
      passport       = require("passport"),
      session        = require("express-session"),
      cookieParser   = require("cookie-parser"),
      bodyParser     = require("body-parser");

app.set("port", process.env.PORT || 3000);

require("./config/passport")(passport);

app.use(logger("dev"));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('view options', { layout: 'layout.ejs' });
app.use('/', express.static(__dirname + '/assets'));
app.use(expressLayouts);

app.use(session({
    secret: (process.env.SECRET || "drowssap"),
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require("./app/routes")(app, passport);

app.listen(app.get("port"), () => console.log(`App is listening on port ${app.get("port")}`));