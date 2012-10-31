var util = require('util');
var EventEmitter = require('events').EventEmitter;

var KickStarter = function() {

  // =====================
  // = Private Variables =
  // =====================
  var assert      = require('assert'),
      Zombie      = require('zombie'),
      config      = require('./config'),
      browser     = new Zombie(),
      self        = this;

  // ========
  // = Init =
  // ========
  browser.site = config.paths.root;
  browser.userAgent = config.agent;

  // ====================
  // = Public Variables =
  // ====================
  this.browser = browser;

  // =============
  // = Listeners =
  // =============
  this.on('test_message', function(backer) {

    var message  = "Hi " + backer.name + ",\n\n";
        message += "Thank you for your pledge of " + backer.pledge + "!  ";
        message += "Please visit the link below to cast your vote.\n\n";
        message += config.paths.vote(backer.hash);
        message += "\n\n";
        message += '-SparkFun Electronics';

    // locked to chris c.
    self.send_message('1126679084', message);

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

    var b = fork_browser();

    b.visit(config.paths.message(user), {runScripts: false})
      .then(function() {
        b.fill('#message_body', message);
      })
      .then(function() {
        return b.pressButton('form.messages-new-box input.submit');
      })
      .then(function() {
        assert.equal(
          b.location.pathname,
          config.paths.messages,
          'Not directed to the messages page after sending message.'
        );
      })
      .then(function() {
        b.close();
        self.emit('sent_message', user, message);
      }).fail(function(error) {
        self.emit('error', error);
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

      pledges.push({
        name: browser.text('div.header a', backers[i]),
        user: browser.query('div.header a', backers[i]).href.match(config.patterns.id)[1],
        pledge: amount[1],
        reward: amount[6],
        date_backed: browser.query('div.footer span.time', backers[i]).title
      });

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
