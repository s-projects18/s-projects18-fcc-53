'use strict';

// ======================== [1] require ===========================
var express = require('express');
var cors = require('cors');

// mount core url module
// https://nodejs.org/api/url.html
const url = require('url');

// mount core dns module
// https://nodejs.org/api/dns.html
const dns = require('dns');

// mount database-helper lib
var database = require('./helper/database.js');

// mount the body-parser here
var bodyParser = require('body-parser');


// ================= [2] create + configure app =====================
var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;


// ----------------- middleware functions ----------------------- 
app.use(cors());

// make POST data available in myApp.js, must be placed before all routes
app.use(bodyParser.urlencoded({extended: false}));

// show error page if there is no database-connection
app.use((req, res, next)=>{
  if(database.checkConnection()) next();
  else res.render('error-db.pug', {title: 'No database connection'});
});

// make assets public, eg /public/style.css
app.use('/public', express.static(process.cwd() + '/public'));


// ----------------- get/post functions -----------------------
// homepage --------------------------------------------------
app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});


// GET /api/shorturl/3 -> redirect ---------------------------
// -> with POST also post data must be redirected... so we leave it
app.get("/api/shorturl/:short_url",
  function(req, res) {
      const url = database.getUrl(req.params.short_url, redirect(res));  
  }
);

// redirect(res)(url)
const redirect = (res) => (url) => {
  if(url) {
    res.redirect(url);  
  }
  res.render('error.pug', {title: 'redirect url not found'});
}


// POST /api/shorturl/new-url ------------------------------
// chaining and passing variables:
// - https://davidburgos.blog/how-to-pass-parameters-between-middleware-in-expressjs/
app.post("/api/shorturl/new", 
  function(req, res, next) { // check url-syntax
    let url=false;

    try {
      url = new URL(req.body.url);
      //url = new URL('asdhdjask');
      res.locals.url = url;
      next();
    } catch(e) {
      res.json({"url-syntax-error":req.body.url});  
      console.log(e);
    }
  },
  function(req, res, next) { // dns-lookup   
    dns.lookup(res.locals.url.host, (err, address, family) => {
      if(err) {
        // eg: https://www.sdfsjksfjksdsdkjf.org
        res.json({"url-dns-error":err.errno, "url":res.locals.host});  
        console.log(err);
      } else {
        //console.log('address: %j family: IPv%s', address, family);
        next();
      }
    }); 
  },
  function(req, res) { // database-update
    // we're not using next() here because of async character of database-stuff
    database.createAndSaveUrl(res.locals.url.toString(), sendJson(req, res));
  }      
);

// can this be chained in app.post("/api/shorturl/new"... with next ??? 
const sendJson = (req, res) => (sequence_value) =>{
  const urlNoProtocol = res.locals.url.host + res.locals.url.pathname + res.locals.url.search+ res.locals.url.hash;
  res.json({"original_url":urlNoProtocol,"short_url":sequence_value});   
}


// handle 'remaining' routes -----------------
// (1) simple, text-based
//app.use(function(req,res){res.status(404).end('not found error');});

// (2) https://www.hacksparrow.com/webdev/express/custom-error-pages-404-and-500.html
app.use(function(req, res) {
  res.status(400);
  res.render('error.pug', {title: '404: File Not Found'});
});


// ================= [3] connect to database and start listening ================
// start listening - no matter what db-status is
// checking connection in middleware
database.connect();
app.listen(port, function () {
  console.log('Node.js listening ...');
});


// app will only listen if db-connection is established
// https://blog.cloudboost.io/waiting-for-db-connections-before-app-listen-in-node-f568af8b9ec9
// problem: users sees nothing if there is no db-connection
/* app.on('ready', function() { 
    app.listen(port, function(){ 
        console.log("app is ready"); 
    }); 
}); */ 
//database.connect(app); // calls app -> ready