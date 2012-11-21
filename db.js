var util = require('util');
var EventEmitter = require('events').EventEmitter;

var DB = function() {

  // =====================
  // = Private Variables =
  // =====================
  var mongo               = require('mongodb'),
      crypto              = require('crypto'),
      color               = require('cli-color'),
      config              = require('./config'),
      server              = new mongo.Server(config.mongo.host, config.mongo.port),
      connector           = new mongo.Db(config.mongo.db, server, {safe: true}),
      database            = false,
      backers_collection  = false,
      self                = this;

  // ====================
  // = Public Variables =
  // ====================
  this.debug = false;

  // ========
  // = Init =
  // ========
  connector.open(function(err, db) {

    if(err) {
      self.emit('error', err);
      return;
    }

    self.emit('connected', db);

  });

  // =============
  // = Listeners =
  // =============
  this.on('connected', function(db) {

    console.log(color.green('Connected to MongoDB'));

    db.collection(config.mongo.collection, function(err, collection) {

      if(err) {
        self.emit('error', err);
        return;
      }

      backers_collection = collection;
      database = db;

      self.emit('ready', collection);

    });

  });

  this.on('ready', function(collection) {
    console.log(color.green('MongoDB ready'));
  });

  this.on('processing_backers', function(count) {
    console.log(color.green.bold('Processing ' + count + ' backers'));
  });

  this.on('skipping_backer', function(backer) {
    console.log(color.yellow('Skipping processing: ' + backer.name));
  });

  this.on('added_backer', function(backer) {
    console.log(color.green('Added: ' + backer.name));
  });

  this.on('disconnected', function() {
    console.log('Connection to MongoDB closed');
  });

  this.on('error', function(error) {
    console.error(color.red.bold('MongoDB Error: ') + color.red(error));
  });

  // ==================
  // = Public Methods =
  // ==================
  this.process_backers = function(backers) {

    if(! backers_collection) {
      self.emit('error', 'Could not access the KickStarter backer collection');
      return;
    }

    self.emit('processing_backers', backers.length);

    for(var i = 0; i < backers.length; i++) {
      process_backer(backers[i]);
    }

  };

  this.check_new = function() {

    if(! backers_collection) {
      self.emit('error', 'Could not access the KickStarter backer collection');
      return;
    }

    backers_collection.findOne({'messaged': {'$exists': false}}, function(err, backer) {

      if(backer != null)
        self.emit('found_new', backer);
      else
        self.emit('no_new');

    });

  };

  this.messaged = function(user) {

    if(! backers_collection) {
      self.emit('error', 'Could not access the KickStarter backer collection');
      return;
    }

    backers_collection.update({user: user}, {$set: {messaged: true}}, {safe: true}, function(err, result) {
      if(err != null)
        self.emit('error', 'Could not save message status in MongoDB');
      else
        self.emit('message_marked');
    });

  };

  this.close = function() {
    database.close();
    self.emit('disconnected');
  };

  // ===================
  // = Private Methods =
  // ===================
  var process_backer = function(backer) {

    if(! backers_collection) {
      self.emit('error', 'Could not access the KickStarter backer collection');
      return;
    }

    backers_collection.findOne({user: backer.user}, function(err, b) {

      if(b == null)
        add_backer(backer);
      else
        self.emit('skipping_backer', backer);

    });

  };

  var add_backer = function(backer) {

    if(! backers_collection) {
      self.emit('error', 'Could not access the KickStarter backer collection');
      return;
    }

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
