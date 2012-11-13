var util = require('util');
var EventEmitter = require('events').EventEmitter;

Map = function() {

  // =====================
  // = Private Variables =
  // =====================
  var Zombie        = require('zombie'),
      config        = require('./config'),
      browser       = new Zombie(),
      child_process = require('child_process'),
      fs            = require('fs'),
      self          = this;

  // ====================
  // = Public Variables =
  // ====================
  this.browser = browser;

  // ========
  // = Init =
  // ========
  var png = fs.createWriteStream(config.map.local_image),
      convert = child_process.spawn('convert', ['svg:', 'png:-']);
      convert.stdout.pipe(png);

  // =============
  // = Listeners =
  // =============
  convert.on('close', function(code) {

    if(code != 0)
      return;

    self.emit('generated_image', config.map.local_image);

    self.upload_image();

  });

  // ==================
  // = Public Methods =
  // ==================
  this.generate = function() {

    return browser.visit(config.paths.map)
      .then(function() {
        return browser.query('#results_map').innerHTML;
      })
      .then(function(map) {
        convert.stdin.write(map);
        convert.stdin.end();
      });

  };

  this.upload_image = function() {

    var scp = child_process.spawn('scp', [config.map.local_image, config.map.scp_path]);

    scp.on('exit', function(code) {

      if(code === 0)
        self.emit('uploaded_image', config.map.remote_host);
      else
        self.emit('error', 'Image upload to ' + config.map.remote_host + ' failed.');

    });

  };

};

util.inherits(Map, EventEmitter);
module.exports = Map;
