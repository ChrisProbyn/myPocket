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

// Seperated Routes for each Resource
const usersRoutes = require("./routes/users");

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));

// Log knex SQL queries to STDOUT as well
app.use(knexLogger(knex));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));


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
