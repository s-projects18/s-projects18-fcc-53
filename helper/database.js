// modules:
// https://adrianmejia.com/getting-started-with-node-js-modules-require-exports-imports-npm-and-beyond/

var mongo = require('mongodb');
var mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
var Schema = mongoose.Schema;

// use a promise
exports.connect = () => {

  // connect to database
  mongoose.connect(process.env.MONGOLAB_URI, {
      useNewUrlParser: true
    }).catch(err => {
      console.log(err);
    });
  
  /* mongoose.connection.once('open', function() { 
    app.emit('ready'); 
  }); */
}

exports.checkConnection = () => {
  /*
  0: disconnected
  1: connected
  2: connecting
  3: disconnecting
  */
  if(mongoose.connection.readyState==0 || mongoose.connection.readyState==3) {
    console.log("no-connection: "+mongoose.connection.readyState);
    return false;
  }  
  return true;
}

// schema
const urlsSchema = new Schema({
	url:  {type: String, unique:true},
	short_url: {type: Number}
});

// model
const Urls = mongoose.model('url', urlsSchema );

const createAndSaveUrl = (url, short_url) => {
  let urlObj = new Urls({
    url: url,
    short_url: 42
  });
  const pr = urlObj.save();
  pr.then(function (doc) {
  console.log(doc);
  }).catch(function(err){
    // err.code=11000 -> duplicate key
    console.log("error", err)
  });
};

// insert or update url
exports.updateURLs = url => {
  createAndSaveUrl(url, Math.floor(Math.random() * 100000));  
  return 24;
}

// ---------------- stubs -----------------------
// insert or update url
// returns shurtUrl
exports.updateURLsStub = (url) => {
  if(url.indexOf("https://www.freecodecamp.org")!=-1) return 3;
  return 2;
}

// get url by short_url-id
exports.getUrlStub = (short_url) => {
  if(short_url==3) return "https://www.freecodecamp.org";
  else if(short_url==99) throw "no url found";
  else return "http://www.google.de";
}