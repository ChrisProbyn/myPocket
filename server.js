"use strict";

require('dotenv').config();

const PORT        = process.env.PORT || 8080;
const ENV         = process.env.ENV || "development";
const express     = require("express");
const bodyParser  = require("body-parser");
const sass        = require("node-sass-middleware");
const app         = express();

const knexConfig  = require("./knexfile");
const knex        = require("knex")(knexConfig[ENV]);
const morgan      = require('morgan');
const knexLogger  = require('knex-logger');
const cookieSession = require('cookie-session');
const cookieParser = require('cookie-parser');

// Seperated Routes for each Resource
const usersRoutes = require("./routes/users");

app.use(cookieParser());

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));

// Log knex SQL queries to STDOUT as well
app.use(knexLogger(knex));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2', 'key3'],
  maxAge: 24 * 60 * 60 * 1000 //24 hour expiry..
}));


app.use("/styles", sass({
  src: __dirname + "/styles",
  dest: __dirname + "/public/styles",
  debug: true,
  outputStyle: 'expanded'
}));
app.use(express.static("public"));

// Mount all resource routes
app.use("/api/users", usersRoutes(knex));

// listen to port...
app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});

// Home page
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/register", (req, res) => {
  res.render("register");
});

function findUser(inputEmail, callback){
  knex.select('email')
  .from('users')
  .where('email', inputEmail)
  .then((resp) => {
    callback(null, resp);
  })
  .catch((err)=> {
    console.log('happening here');
    callback(err);
  });
}

app.post('/register', (req, res) => {
  let email = req.body.email;
  if (req.body.email === '' || req.body.password === '' || req.body.name === '') {
    res.send("Forms can't be left empty");
  } else {
    findUser(req.body.email, (err, goodUser) => {
      console.log("hjhh: ", goodUser);
      if (err) {
        res.send('there was an error', err);
      }
      if (goodUser.length >= 1) {
        res.status(403).send("Another user is already registered with this email ID");
      } else {
        knex('users')
          .insert({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
          })
          .asCallback((err) => {
            if (err) {
              console.log(err);
            }
            req.session.userCookie = email;
            res.redirect('/');
          })
      }
    });
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

// Search request
app.post("/search", (req, res) => {
  const searchText = req.body.search;
  console.log(searchText)
  knex.select('title','description','image','users.name','categories.category','email','password')
  .from('urls')
  .leftJoin('categories','urls.category_id', 'categories.id')
  .leftJoin('users','urls.user_id', 'users.id')
  .where('title', 'like', `%${searchText}%`)
  .orWhere('description', 'like', `%${searchText}%`)
  .asCallback((err,event) => {
    if (err) throw err; 
     console.log(event);
     res.render("index");
  })
});

//engineering category
app.get("/engineering", (req,res) => {
  knex.select('title','description','image','users.name','categories.category','email','password')
  .from('urls')
  .leftJoin('categories','urls.category_id', 'categories.id')
  .leftJoin('users','urls.user_id', 'users.id')
  .where('category', 'like', 'Engineering')
  .asCallback((err,event) => {
    if (err) throw err;
     console.log(event);

     res.render("engineering");
  })
});

//web development category
app.get("/webDev", (req,res) => {
  knex.select('title','description','image','users.name','categories.category','email','password')
  .from('urls')
  .leftJoin('categories','urls.category_id', 'categories.id')
  .leftJoin('users','urls.user_id', 'users.id')
  .where('category', 'like', 'Web Dev')
  .asCallback((err,event) => {
    if (err) throw err;
     console.log(event);
     res.render("webDev");
  })
});

//computer science category
app.get("/cs", (req,res) => {
  knex.select('title','description','image','users.name','categories.category','email','password')
  .from('urls')
  .leftJoin('categories','urls.category_id', 'categories.id')
  .leftJoin('users','urls.user_id', 'users.id')
  .where('category', 'like', 'CS')
  .asCallback((err,event) => {
    if (err) throw err;
     console.log(event);
     res.render("cs")

  })
});

// MyResource page
app.get("/myresource", (req, res) => {
  res.render("myresource");
})
