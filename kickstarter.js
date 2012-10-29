// =====================
// = Private Variables =
// =====================
var assert = require('assert'),
    Zombie = require('zombie'),
    os = require('os'),
    config = require('./config'),
    browser = new Zombie()

browser.site = config.paths.root;
browser.userAgent = config.agent;

// ====================
// = Public Variables =
// ====================
exports.browser = browser;

// ==================
// = Public Methods =
// ==================
exports.login = function() {

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
      console.log('PASSED: Logged in');
    });

};

exports.get_pledges = function() {
  return get_pledge_page(1);
};

exports.send_message = function(pledge, message) {

  return browser.visit(config.paths.message(pledge.user), {runScripts: false})
    .then(function() {
      //TODO: kill this test message
      browser.fill('#message_body', pledge.name + "\n\n" + message + "\n\nTesting new lines.\n\n-Todd");
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
      console.log('PASSED: Sent test message');
    }).fail(function(error) {
      console.log(error);
    });

};

// ===================
// = Private Methods =
// ===================
function get_pledge_page(page, pledges) {

  if(typeof pledges == 'undefined')
    pledges = [];

  //TODO: kill
  console.log('GETTING PAGE: ' + page);

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

}

function parse_pledges() {

  var backers = browser.queryAll('li.backing'),
      pledges = [];

  for(var i=0; i < backers.length; i++) {

    var amount = browser.text('p', backers[i]).match(config.patterns.amount);

    pledges.push({
      name: browser.text('div.header a', backers[i]),
      user: browser.query('div.header a', backers[i]).href.match(config.patterns.id)[1],
      pledge: amount[1],
      reward: amount[6],
      date: browser.query('div.footer span.time', backers[i]).title
    });

  }

  return pledges;

}
