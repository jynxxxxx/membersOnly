const express = require("express");
const path = require("path");
const session = require("express-session");
const passport = require("./passport-config");
const mongoose = require("mongoose");
require('dotenv').config()
const Message = require("./models/messages")

const mongoDb = process.env.MONGO_URI
mongoose.connect(mongoDb);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

var indexRouter = require('./routes/index')

const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + "/public/"));


app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

app.use('/', indexRouter);

app.get("/", (req, res) => {
  res.send("Express on Vercel");
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`app listening on port ${port}!`));


module.exports = app;