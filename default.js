exports.debug = true;

exports.agent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.4 (KHTML, like Gecko) Chrome/22.0.1229.94 Safari/537.4';

exports.mongo = {
  host: 'mongodb',
  port: 27017,
  db: 'kickstarter'
};

exports.salt = 'correcthorsebatterystaple';

exports.map = {
  local_image: 'map.png',
  remote_image: '/var/www-static/images/map.png',
  remote_user: 'egon',
  remote_host: 'static.ghostbusters.com'
};

exports.map.scp_path = exports.map.remote_user + '@' + exports.map.remote_host + ':' + exports.map.remote_image;

exports.account = {
  email: 'drspengler@gmail.com',
  pass: 'printisdead',
  user: 'egonspengler',
  project: 'tobins-spirit-guide'
};

exports.paths = {
  vote_root: 'http://todd-dev.internal.sparkfun.com/vote_tour/',
  root: 'https://www.kickstarter.com',
  login: '/login',
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

// I'm bad at regex :(
exports.patterns = {
  id: /\/profile\/(.*)/,
  amount: /pledged (\$(\d{1,3}(\,\d{3})*|(\d+))(\.\d{2})?) for .*((\$(\d{1,3}(\,\d{3})*|(\d+))(\.\d{2})?)|(no reward))/i
};
