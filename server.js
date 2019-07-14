'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);

app.use(cors());

// handle POST-data
// mount the body-parser here
var bodyParser = require('body-parser');
// make POST data available in myApp.js, must be placed before all routes
app.use(bodyParser.urlencoded({extended: false}));

// mount core url module
// https://nodejs.org/api/url.html
const url = require('url');

// mount core dns module
// https://nodejs.org/api/dns.html
const dns = require('dns');

// make assets public, eg /public/style.css
app.use('/public', express.static(process.cwd() + '/public'));

// homepage
app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});


// POST /api/shorturl/new - url
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
    res.locals.shortUrl = updateURLs(res.locals.urlNoProtocol);
    next();
  },
  function(req, res) { // all done
    res.json({"original_url":res.locals.urlNoProtocol,"short_url":res.locals.shortUrl}); 
  }
);

// insert or update url
// returns shurtUrl
function updateURLs(url) {
  if(url.indexOf("www.freecodecamp.org")!=-1) return 3;
  return 2;
}
  

  
  // check if url exists ? seems not necessary
  
  
  
  // check if url exists in db -> use existing short_url
  
  // write url in db -> get new short_url
  
  // remove protocol
  //res.json({"original_url":req.body.url,"short_url":1});

// start listening for requests
app.listen(port, function () {
  console.log('Node.js listening ...');
});