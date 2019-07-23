// modules-handling:
// https://adrianmejia.com/getting-started-with-node-js-modules-require-exports-imports-npm-and-beyond/

var mongo = require('mongodb');
var mongoose = require('mongoose');
// https://mongoosejs.com/docs/deprecations.html#-findandmodify-
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
var Schema = mongoose.Schema;

// connect --------------------------------
exports.connect = () => {
  // connect to database
  mongoose.connect(process.env.MONGOLAB_URI, {
      useNewUrlParser: true
    }).catch(err => { // Promise
      console.log(err);
    });
  
  /* mongoose.connection.once('open', function() { 
    app.emit('ready'); 
  }); */
}

// check connection -----------------------
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

// schema --------------------------------
const urlsSchema = new Schema({
	url:  {type: String, unique:true},
	short_url: {type: Number}
});
const counterSchema = new Schema({
	sequence_value: {type: Number}
});

// model --------------------------------
const Urls = mongoose.model('url', urlsSchema );
const Counter = mongoose.model('counter', counterSchema );


// debug
const tester = val=> {console.log('tester ', val); return val;}

// autoincremenmt ------------------------
// https://blog.eduonix.com/web-programming-tutorials/learn-auto-increment-sequences-mongodb/
// next(sequence_value)
const createSequenceValue = (next) => {
  Counter.findOneAndUpdate({sequence_value:{$gt:0}}, {$inc:{sequence_value:1}}, {}, function(err, docs){
    if(err) console.log(err);
    else {
      const short_url=docs.sequence_value;
      next(docs.sequence_value);
    }
  });
}

// update -----------------------------
// next(sequence_value)
const findAndUpdate = (url, next) => sequence_value => {
  let urlObj = new Urls({
    url: url,
    short_url: sequence_value
  });  

  Urls.findOne({url: url}, (err, docs)=>{ 
    if(docs==null) { // entry doesn't exist
      const pr = urlObj.save();
      pr.then(function (doc) {
        next(sequence_value); // new doc created
      }).catch(function(err){
        // we try to insert same url again: should not be possible
        // err.code=11000 -> duplicate key
        console.log("error", err);
        next(null);
      });         
    } else {
      // doc yet exists -> return existing short_url
      next(docs.short_url);  
    }
   
  });  
} 

// save url
// url
// next(sequence_value)
exports.createAndSaveUrl = (url, next) => {
  // findAndUpdate(...)(sequence_value)
  createSequenceValue(findAndUpdate(url, next));
};

// get url by short_url
// next(url|false)
exports.getUrl = (short_url, next) => {
  Urls.findOne({short_url: short_url}, (err, docs) => { 
    if(docs==null) { // entry doesn't exist
      next(false);      
    } else {
      next(docs.url);
    }
  });
}



// stubs -----------------------------------
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