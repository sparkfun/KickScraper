var util = require('util');
var EventEmitter = require('events').EventEmitter;

var KickStarter = function() {

  // =====================
  // = Private Variables =
  // =====================
  var assert      = require('assert'),
      Zombie      = require('zombie'),
      color       = require('cli-color'),
      config      = require('./config'),
      browser     = new Zombie(),
      self        = this;

  // ====================
  // = Public Variables =
  // ====================
  this.browser = browser;
  this.debug = false;

  // ========
  // = Init =
  // ========
  browser.site = config.paths.root;
  browser.userAgent = config.agent;

  // =============
  // = Listeners =
  // =============
  this.on('sent_message', function(user, message) {
    console.log(color.green.bold.underline('Sent message to: ' + user));
    console.log(color.white(message));
  });

  this.on('logged_in', function(user, message) {
    console.log(color.green('Logged in to KickStarter'));
  });

  this.on('logged_out', function(user, message) {
    console.log(color.green('Logged out of KickStarter'));
  });

  this.on('get_pledge_page', function(page) {
    console.log(color.green('Retrieved pledge page: ' + page));
  });

  this.on('error', function(error) {
    console.error(color.red.bold('Scraper Error: ') + color.red(error));
  });

  // ==================
  // = Public Methods =
  // ==================
  this.login = function() {

    return browser.visit(config.paths.login, { runScripts: false })
      .then(function() {
        browser.fill('#email', config.account.email);
        browser.fill('#password', config.account.pass);
      })
      .then(function() {
        return browser.pressButton('#login input.submit');
      })
      .then(function() {
        assert.equal(
          browser.location.pathname,
          config.paths.profile,
          'Not directed to the profile page after login.'
        );
      })
      .then(function() {
        self.emit('logged_in');
      });

  };

  this.get_backers = function() {
    return get_pledge_page(1);
  };

  this.send_message = function(user, message) {

    return browser.visit(config.paths.message(user), {runScripts: false})
      .then(function() {
        browser.fill('#message_body', message);
      })
      .then(function() {
        return browser.pressButton('form.messages-new-box input.submit');
      })
      .then(function() {
        assert.equal(
          browser.location.pathname,
          config.paths.messages,
          'Not directed to the messages page after sending message.'
        );
      })
      .then(function() {
        self.emit('sent_message', user, message);
      });

  };

  this.logout = function() {

    return browser.visit(config.paths.logout, {runScripts: false})
      .then(function() {
        self.emit('logged_out');
        browser.close();
      });

  };

  // ===================
  // = Private Methods =
  // ===================
  var get_pledge_page = function(page, pledges) {

    if(typeof pledges == 'undefined')
      pledges = [];

    return browser.visit(config.paths.pledges(page),
      {
        runScripts: false,
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      }
    )
    .then(function() {
      self.emit('get_pledge_page', page);
      return parse_pledges();
    })
    .then(function(p){

      if(p.length == 0)
        return pledges;

      pledges = pledges.concat(p);
      return get_pledge_page(page + 1, pledges);
 
    });

  };

  var parse_pledges = function() {

    var backers = browser.queryAll('li.backing'),
        pledges = [];

    for(var i=0; i < backers.length; i++) {

      var amount = browser.text('p', backers[i]).match(config.patterns.amount);

      if(typeof browser.query('div.header a', backers[i]) != 'undefined') {
 
        pledges.push({
          name: browser.text('div.header a', backers[i]),
          user: browser.query('div.header a', backers[i]).href.match(config.patterns.id)[1],
          pledge: parseFloat(amount[1].replace(/[\$,\,]/g, '')),
          reward: amount[6],
          date_backed: browser.query('div.footer span.time', backers[i]).title
        });

      }

    }

    return pledges;

  };

  var fork_browser = function() {

    var forked = new Zombie();
        forked.loadCookies(browser.saveCookies());
        forked.loadStorage(browser.saveStorage());
        forked.site = config.paths.root;
        forked.userAgent = config.agent;

    return forked;

  };

};

util.inherits(KickStarter, EventEmitter);
module.exports = KickStarter;
