exports.log = {
  out: 'kickscraper.log',
  err: 'kickerror.log'
};

exports.timers = {
  pledges: 5000 * 60,
  message: 3000 * 60,
  map: 10000 * 60
};

exports.mongo = {
  host: 'mongodb-test',
  port: 27017,
  db: 'kickstarter',
  collection: 'backers'
};

exports.salt = 'correcthorsebatterystaple';

exports.map = {
  local_image: 'map',
  extension: '.png',
  live_path: '/mnt/www-static/ks/map.png'
};

exports.account = {
  email: 'drspengler@ghostbusters.com',
  pass: 'printisdead',
  user: 'egonspengler',
  project: 'tobins-spirit-guide'
};

exports.agent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.4 (KHTML, like Gecko) Chrome/22.0.1229.94 Safari/537.4';

exports.paths = {
  vote_root: 'http://www.ghostbusters.com/kickstarter/',
  root: 'https://www.kickstarter.com',
  login: '/login',
  logout: '/logout',
  messages: '/messages',
  profile: '/profile/' + exports.account.user,
  project: '/projects/' + exports.account.user + '/' + exports.account.project
};

exports.paths.dashboard = exports.paths.project + '/dashboard';
exports.paths.activity = exports.paths.project + '/activity';
exports.paths.map = exports.paths.vote_root + 'png_map';
exports.paths.pledges = function(page) {
  return exports.paths.activity + '?cat=pledges&page=' + page;
};
exports.paths.message = function(user) {
  return exports.paths.project + '/messages/new?message%5Bto%5D=' + user;
};
exports.paths.vote = function(hash) {
  return exports.paths.vote_root + hash;
};

exports.templates = {};
exports.templates.vote_message = function(backer) {
  var message  = "Hi " + backer.name + ",\n\n";
      message += "Thank you for your pledge of $" + parseFloat(backer.pledge).toFixed(2) + " to our campaign!  ";
      message += "Please visit the link below to cast your vote.\n\n";
      message += exports.paths.vote(backer.hash);
      message += "\n\n";
      message += "Keep an eye on the KickStarter campaign page for updates.\n\nThanks!\n";
      message += '-Egon';

  return message;
};

// I'm bad at regex :(
exports.patterns = {
  id: /\/profile\/(.*)/,
  amount: /pledged (\$(\d{1,3}(\,\d{3})*|(\d+))(\.\d{2})?) for .*((\$(\d{1,3}(\,\d{3})*|(\d+))(\.\d{2})?)|(no reward))/i
};

exports.timestamp = function() {

  var date = new Date();

  var timestamp = (date.getMonth() + 1) + '.' + date.getDay() + '.' + date.getFullYear();
      timestamp += ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();

  return timestamp;

};
