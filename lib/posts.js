var fs = require('fs');

// Private Methods
var _databaseName = function() {
  return 'posts.json';
};

var _database = function() {
  return fs.readFileSync(_databaseName(), 'utf8');
};

var _save = function(posts) {
  fs.writeFile(_databaseName(), JSON.stringify(posts));
};

// API
var all = function() {
  var posts = JSON.parse(_database());

  return posts;
};

var store = function(post) {
  var posts = all();

  posts[post.slug] = {
    date: post.date,
    slug: post.slug,
    title: post.title,
    link: post.link,
    extract: post.extract
  };

  _save(posts);
};

var find = function(post_name) {
  return all()[post_name];
};

var destroy = function(post_name) {
  var posts = all();
  delete posts[post_name];

  _save(posts);
};

module.exports = {
  all: all,
  store: store,
  find: find,
  destroy: destroy
};
