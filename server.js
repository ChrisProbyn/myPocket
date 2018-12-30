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



app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/login", (req, res) => {
  res.render("login");
});

//home request
app.get("/", (req, res) => {
  const urlsTable = knex.select('urls.id','title','description','image','users.name','categories.category','email','password')
  .from('urls')
  .leftJoin('categories','urls.category_id', 'categories.id')
  .leftJoin('users','urls.user_id', 'users.id')
  .then((event) => {
     return event;
  }).catch((err) => {
    console.log(err);
  });

  const likesTable = knex.select('url_id')
  .count('id')
  .from('likes')
  .groupBy('url_id')
  .then( (event) => {
    return event;
  }).catch((err) => {
    console.log(err);
  });

  const ratingsTable = knex.select('url_id')
  .avg('rating')
  .from('ratings')
  .groupBy('url_id')
  .then( (event) => {
    return event;
  }).catch((err) => {
    console.log(err);
  });

  const commentsTable = knex.select('*')
  .from('comments')
  .then( (event) => {
    return event;
  }).catch((err) => {
    console.log(err);
  });

  const everythingLoaded = Promise.all([likesTable, urlsTable,ratingsTable,commentsTable])
  .then((record) => {
    // console.log('likesTable' , record[0]);
    // console.log('userstable' , record[1]);
    // console.log('ratingsTable', record[2]);
    // console.log('commentsTable', record[3])
    let templatevars = {
      likes: record[0],
      urls: record[1],
      rates: record[2],
      comments: record[3]
    }
    res.render("index", templatevars);
  })
});

//create comment
app.post("/comment", (req, res) => {
  console.log(req.body);
  // const comment = req.body.text;
  // const url = req.body.data;
  // const user = req.cookies["userCookie"];
  // const urlID = document.getElementById('submit-comment');
  // console.log(urlID)
  // // console.log(req)
  // knex('comments').insert({
  //   url_id: url,
  //   user_id: user,
  //   text: comment,

  // }).then(() =>{
  //   res.redirect('/');
  // })
  // .catch((err) => {
  //   console.log(err);
  // });    
  res.redirect('/');
});

//create likes
app.post("/likes", (req, res) => {
  // const url = ;
  // const user = req.cookies["userCookie"];
  // knex('comments').insert({
  //   url_id: url,
  //   user_id: user,

  // }).then(() =>{
  //   res.redirect('/');
  // })
  // .catch((err) => {
  //   console.log(err);
  // });    
});

//create rating
app.post("/rating", (req, res) => {
  // const rating = req.body.rating;
  // const url = ;
  // const user = req.cookies["userCookie"];
  // knex('comments').insert({
  //   url_id: url,
  //   user_id: user,
  //   text: comment,

  // }).then(() =>{
  //   res.redirect('/');
  // })
  // .catch((err) => {
  //   console.log(err);
  // });    
});

// Search request
app.post("/search", (req, res) => {

  const searchText = req.body.search;

  const urlsTable = knex.select('urls.id','title','description','image','users.name','categories.category','email','password')
  .from('urls')
  .leftJoin('categories','urls.category_id', 'categories.id')
  .leftJoin('users','urls.user_id', 'users.id')
  .where('title', 'like', `%${searchText}%`)
  .orWhere('description', 'like', `%${searchText}%`)
  .then((event) => {
     return event;
  }).catch((err) => {
    console.log(err);
  });

  const likesTable = knex.select('url_id')
  .count('id')
  .from('likes')
  .groupBy('url_id')
  .then( (event) => {
    return event;
  }).catch((err) => {
    console.log(err);
  });

  const ratingsTable = knex.select('url_id')
  .avg('rating')
  .from('ratings')
  .groupBy('url_id')
  .then( (event) => {
    return event;
  }).catch((err) => {
    console.log(err);
  });

  const commentsTable = knex.select('*')
  .from('comments')
  .then( (event) => {
    return event;
  }).catch((err) => {
    console.log(err);
  });

  const everythingLoaded = Promise.all([likesTable, urlsTable,ratingsTable,commentsTable])
  .then((record) => {
    console.log('likesTable' , record[0]);
    console.log('userstable' , record[1]);
    console.log('ratingsTable', record[2]);
    console.log('commentsTable', record[3]);
    let templatevars = {
      likes: record[0],
      urls: record[1],
      rates: record[2],
      comments: record[3]
    }

    res.render("index", templatevars);
  })
});

//engineering category
app.get("/engineering", (req,res) => {

  const engTable = knex.select('urls.id','title','description','image','users.name','categories.category','email','password')
  .from('urls')
  .leftJoin('categories','urls.category_id', 'categories.id')
  .leftJoin('users','urls.user_id', 'users.id')
  .where('category', 'like', 'Engineering')
  .then((event) => {
    return event;
  }).catch((err) => {
    console.log(err);
  });
  const likesTable = knex.select('url_id')
  .count('id')
  .from('likes')
  .groupBy('url_id')
  .then( (event) => {
    return event;
  }).catch((err) => {
    console.log(err);
  });

  const ratingsTable = knex.select('url_id')
  .avg('rating')
  .from('ratings')
  .groupBy('url_id')
  .then( (event) => {
    return event;
  }).catch((err) => {
    console.log(err);
  });

  const commentsTable = knex.select('*')
  .from('comments')
  .then( (event) => {
    return event;
  }).catch((err) => {
    console.log(err);
  });

  const everythingLoaded = Promise.all([likesTable, engTable,ratingsTable,commentsTable])
  .then((record) => {
    console.log('likesTable' , record[0]);
    console.log('engTable' , record[1]);
    console.log('ratingsTable', record[2]);
    console.log('commentsTable', record[3]);
    let templatevars = {
      likes: record[0],
      urls: record[1],
      rates: record[2],
      comments: record[3]
    }
    res.render("engineering", templatevars);
  })

});

//web development category
app.get("/webDev", (req,res) => {
  const webTable = knex.select('urls.id','title','description','image','users.name','categories.category','email','password')
  .from('urls')
  .leftJoin('categories','urls.category_id', 'categories.id')
  .leftJoin('users','urls.user_id', 'users.id')
  .where('category', 'like', 'Web Dev')
  .then((event) => {
    return event;
  }).catch((err) => {
    console.log(err);
  });
  const likesTable = knex.select('url_id')
  .count('id')
  .from('likes')
  .groupBy('url_id')
  .then( (event) => {
    return event;
  }).catch((err) => {
    console.log(err);
  });

  const ratingsTable = knex.select('url_id')
  .avg('rating')
  .from('ratings')
  .groupBy('url_id')
  .then( (event) => {
    return event;
  }).catch((err) => {
    console.log(err);
  });

  const commentsTable = knex.select('*')
  .from('comments')
  .then( (event) => {
    return event;
  }).catch((err) => {
    console.log(err);
  });

  const everythingLoaded = Promise.all([likesTable, webTable,ratingsTable,commentsTable])
  .then((record) => {
    console.log('likesTable' , record[0]);
    console.log('webTable' , record[1]);
    console.log('ratingsTable', record[2]);
    console.log('commentsTable', record[3]);
    let templatevars = {
      likes: record[0],
      urls: record[1],
      rates: record[2],
      comments: record[3]
    }
    res.render("webDev", templatevars);
  })
  
});

//computer science category
app.get("/cs", (req,res) => {
  const csTable = knex.select('urls.id','title','description','image','users.name','categories.category','email','password')
  .from('urls')
  .leftJoin('categories','urls.category_id', 'categories.id')
  .leftJoin('users','urls.user_id', 'users.id')
  .where('category', 'like', 'CS')
  .then((event) => {
    return event;
  }).catch((err) => {
    console.log(err);
  });
  const likesTable = knex.select('url_id')
  .count('id')
  .from('likes')
  .groupBy('url_id')
  .then( (event) => {
    return event;
  }).catch((err) => {
    console.log(err);
  });

  const ratingsTable = knex.select('url_id')
  .avg('rating')
  .from('ratings')
  .groupBy('url_id')
  .then( (event) => {
    return event;
  }).catch((err) => {
    console.log(err);
  });

  const commentsTable = knex.select('*')
  .from('comments')
  .then( (event) => {
    return event;
  }).catch((err) => {
    console.log(err);
  });

  const everythingLoaded = Promise.all([likesTable, csTable,ratingsTable,commentsTable])
  .then((record) => {
    console.log('likesTable' , record[0]);
    console.log('csTable' , record[1]);
    console.log('ratingsTable', record[2]);
    console.log('commentsTable', record[3]);
    let templatevars = {
      likes: record[0],
      urls: record[1],
      rates: record[2],
      comments: record[3]
    }
    res.render("cs", templatevars);
  })
});

// MyResource page
app.get("/myresource", (req, res) => {

  const user = 'Bob';
  const myReasourceTable = knex.select('urls.id','title','description','image','users.name','categories.category','email','password')
  .from('urls')
  .leftJoin('categories','urls.category_id', 'categories.id')
  .leftJoin('users','urls.user_id', 'users.id')
  .where('name', 'like', `${user}`)
  .then((event) => {
    return event;
  }).catch((err) => {
    console.log(err);
  });
  const likesTable = knex.select('url_id')
  .count('id')
  .from('likes')
  .groupBy('url_id')
  .then( (event) => {
    return event;
  }).catch((err) => {
    console.log(err);
  });

  const ratingsTable = knex.select('url_id')
  .avg('rating')
  .from('ratings')
  .groupBy('url_id')
  .then( (event) => {
    return event;
  }).catch((err) => {
    console.log(err);
  });

  const commentsTable = knex.select('*')
  .from('comments')
  .then( (event) => {
    return event;
  }).catch((err) => {
    console.log(err);
  });

  const everythingLoaded = Promise.all([likesTable, myReasourceTable,ratingsTable,commentsTable])
  .then((record) => {
    console.log('likesTable' , record[0]);
    console.log('myReasourceTable' , record[1]);
    console.log('ratingsTable', record[2]);
    console.log('commentsTable', record[3]);
    let templatevars = {
      likes: record[0],
      urls: record[1],
      rates: record[2],
      comments: record[3]
    }
    res.render("myresource", templatevars);
  })
})
