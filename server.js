'use strict';

// -------------------- require ------------------------
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


// ------------------ configure app ------------------
var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

app.use(cors());

// make POST data available in myApp.js, must be placed before all routes
app.use(bodyParser.urlencoded({extended: false}));

app.use((req, res, next)=>{
  console.log(database.checkConnection())
  if(database.checkConnection()) next();
  else res.render('error.pug', {title: 'No database connection'});
});

// make assets public, eg /public/style.css
app.use('/public', express.static(process.cwd() + '/public'));


// homepage
app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});


// GET /api/shorturl/3 -> redirect
// -> with POST also post data must be redirected...
app.get("/api/shorturl/:short_url",
  function(req, res) {
    try {
      const url = database.getUrlStub(req.params.short_url);  
      res.redirect(url);
    } catch(e) {
      console.log(e);
      res.json({"url-not-found-error":e});  
      // ??? how to stop further execution ???
    }
  }
);

// POST /api/shorturl/new-url
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
  function(req, res, next) { // database-update
    // stub
    res.locals.urlNoProtocol = res.locals.url.host + res.locals.url.pathname + res.locals.url.search+ res.locals.url.hash;
    res.locals.shortUrl = database.updateURLs(res.locals.url.toString());
    next();
  },
  function(req, res) { // all done
    res.json({"original_url":res.locals.urlNoProtocol,"short_url":res.locals.shortUrl}); 
  }
);

// handle 'remaining' routes
// (1) simple, text-based
//app.use(function(req,res){res.status(404).end('not found error');});

// (2) https://www.hacksparrow.com/webdev/express/custom-error-pages-404-and-500.html
app.use(function(req, res) {
  res.status(400);
  res.render('error.pug', {title: '404: File Not Found'});
});


// ------------------- connect to database and start listening ----------------------------
// start listening - no matter what db-status is
app.listen(port, function () {
  console.log('Node.js listening ...');
});

// app will only listen if db-connection is established
// https://blog.cloudboost.io/waiting-for-db-connections-before-app-listen-in-node-f568af8b9ec9
/* app.on('ready', function() { 
    app.listen(port, function(){ 
        console.log("app is ready"); 
    }); 
}); */ 
//database.connect(app); // calls app -> ready