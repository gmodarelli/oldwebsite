var fs = require('fs');
var join = require('path').join;
var Posts = require('./posts.js');
var _ = require('lodash');
var moment = require('moment');
var md2html = require('./md2html.js');
var ejs = require('ejs');

var _sortedPosts = function() {
  var posts = Posts.all();
  var keys = Object.keys(posts);

  posts = keys.map(function(v) {
    var post = posts[v];
    post.publishedOn = moment(post.date).format('LL');
    post.date = moment(post.date);

    if(post.extract != undefined)
      post.extract = md2html(post.extract);

    return post;
  });

  return _.reverse(_.sortBy(posts, function(p) { return p.date; }));
};

var updateFeed = function() {
  var templateFile = join("templates", "index.ejs")
  var template = fs.readFileSync(templateFile, 'utf8');
  var destination = "index.html";

  var data = { posts: _sortedPosts() };
  var options = { filename: templateFile };

  var html = ejs.render(template, data, options);

  fs.writeFile(destination, html);
};

module.exports = updateFeed;
