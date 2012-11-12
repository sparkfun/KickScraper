var util = require('util');
var EventEmitter = require('events').EventEmitter;

var DB = function() {

  // =====================
  // = Private Variables =
  // =====================
  var mongo               = require('mongodb'),
      crypto              = require('crypto'),
      config              = require('./config'),
      server              = new mongo.Server(config.mongo.host, config.mongo.port),
      connector           = new mongo.Db(config.mongo.db, server, {safe: true}),
      db                  = false,
      backers_collection  = false,
      self                = this;


  // ========
  // = Init =
  // ========
  connector.open(function(err, d) {

    if(err)
      throw err;

    db = d;

    db.collection('ks_backers', function(err, collection) {

      if(err)
        throw err;

      backers_collection = collection;

    });

  });

  // ==================
  // = Public Methods =
  // ==================
  this.process_backers = function(backers) {

    for(var i = 0; i < backers.length; i++) {
      process_backer(backers[i]);
    }

  };

  // ===================
  // = Private Methods =
  // ===================
  var process_backer = function(backer) {

    backers_collection.findOne({user: backer.user}, function(err, b) {

      if(b == null)
        add_backer(backer);

    });

  };

  var add_backer = function(backer) {

    backer.hash = create_hash(backer);
    backer.created = new Date();

    backers_collection.insert(backer, function(err) {
      if(!err)
        self.emit('added_backer', backer);
    });

  };

  var create_hash = function(backer) {

    var sha = crypto.createHash('sha1');
        sha.update(backer.user);
        sha.update(backer.name);
        sha.update(config.salt);
        sha.update(backer.date_backed);

    return sha.digest('hex').slice(-24);

  };

};

util.inherits(DB, EventEmitter);
module.exports = DB;
