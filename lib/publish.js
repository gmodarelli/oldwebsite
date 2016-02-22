var fs = require('fs');
var join = require('path').join;
var moment = require('moment');
var md2html = require('./md2html.js');
var ejs = require('ejs');
var posts = require('./posts.js');

var publish = function(post, destination, draft) {
  var postTemplate = join("templates", "post.ejs")
  var template = fs.readFileSync(postTemplate, 'utf8');

  var data = {
    title: post.title,
    date: moment(post.date).format('LL'),
    link: post.link,
    body: md2html(post.body)
  };

  var options = { filename: postTemplate };

  var html = ejs.render(template, data, options);

  fs.writeFile(destination, html);
  if (draft != undefined) {
    posts.store(post);
  }
};

module.exports = publish;
