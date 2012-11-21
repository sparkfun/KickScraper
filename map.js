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
      color         = require('cli-color'),
      self          = this;

  // ====================
  // = Public Variables =
  // ====================
  this.browser = browser;
  this.debug = false;

  // ========
  // = Init =
  // ========
  var convert = child_process.spawn('convert', ['svg:', 'png:-']),
      image_path = config.map.local_image + config.map.extension,
      png = fs.createWriteStream(image_path);

  convert.stdout.pipe(png);

  // =============
  // = Listeners =
  // =============
  this.on('generated_image', function() {
    console.log(color.green('Generated map image: ' + image_path));
  });

  this.on('copy_image', function(path) {
    console.log(color.green('Copied map image to: ' + path));
  });

  this.on('error', function(error) {
    console.error(color.red.bold('Map Error: ') + color.red(error));
  });

  convert.on('close', function(code) {

    if(code !== 0) {
      self.emit('error', 'Generating ' + image_path + ' failed.');
      return;
    }

    self.copy_image();

    self.emit('generated_image');

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

  this.copy_image = function() {

    var cp = child_process.spawn('cp', [image_path, config.map.live_path]);

    cp.on('exit', function(code) {

      if(code !== 0) {
        self.emit('error', 'Image copy to ' + config.map.live_path + ' failed.');
        return;
      }

      self.emit('copy_image', config.map.live_path);

    });

  };

};

util.inherits(Map, EventEmitter);
module.exports = Map;
