var Post = require('./lib/post.js');
var publish = require('./lib/publish.js');
var unpublish = require('./lib/unpublish.js');
var updateFeed = require('./lib/updateFeed.js');

desc('Draft a post');
task('draft', function(post_name) {
  var draft = true;
  var post = Post.parse(post_name);
  var destination = Post.createDestination(post.link, draft);

  publish(post, destination, draft);
});

desc('Publish a post');
task('publish', function(post_name) {
  var post = Post.parse(post_name);
  var destination = Post.createDestination(post.link);

  console.log("Publishing \"" + post.title + "\" to \"" + post.link + "\"");

  publish(post, destination);
  jake.Task['home'].invoke();
});

desc('Unpublish a post');
task('unpublish', function(post_name) {
  unpublish(post_name);
});

desc('Update homepage');
task('home', function() {
  console.log("Updating the homepage feed.");
  updateFeed();
});

var read = require('fs').readFileSync;
var write = require('fs').writeFile;
var html2md = require('html-md');

desc('Convert html to markdown');
task('convert', function(path) {
  var html = read(path, 'utf8');
  var newPath = path + ".md";
  var markdown = htm2md(html);
  write(newPath, markdown);
});

