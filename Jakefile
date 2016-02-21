var read = require('fs').readFileSync;
var write = require('fs').writeFile;
var join = require('path').join;
var ejs = require('ejs');
var hljs = require('highlight.js');
var mkdirp = require('mkdirp');
var yaml = require('js-yaml');

var md = require('markdown-it')({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(lang, str).value;
      } catch(__) {}
    }

    return '';
  }
});

var createPostDestination = function(year, month, post_name, draft) {
  var destination = "";
  if (draft == true) { destination = join("_drafts"); }

  destination = join(destination, year, month, post_name);
  mkdirp.sync(destination);

  destination = join(destination, "index.html");
  return destination;
};

var publish = function(post, destination) {
  var template = read(join("templates", "post.ejs"), 'utf8');

  var data = {
    title: post.title,
    date: post.date,
    body: md.render(post.body)
  };

  var html = ejs.render(template, data, { filename: join("templates", "post.ejs") });

  write(destination, html);
};

var parsePost = function(post_name) {
  var body  = read(join("_posts", post_name + ".md"), 'utf8');
  var head = body.split("\n---\n")[0];
  var text = body.split("\n---\n")[1];

  var meta = yaml.safeLoad(head);

  return {
    slug: post_name,
    title: meta.title,
    date: meta.date,
    body: text
  };
}

desc('Publish a post');
task('publish', function(post_name) {
  var post = parsePost(post_name);
  var year = post.date.getFullYear() + "";
  var month = post.date.getMonth();

  if (month < 10) {
    month = "0" + month;
  }

  var destination = createPostDestination(year, month, post_name);
  publish(post, destination);
});

desc('Draft a post');
task('draft', function(year, month, post_name) {
  var post = parsePost(post_name);
  var year = post.date.getFullYear() + "";
  var month = post.date.getMonth();

  if (month < 10) {
    month = "0" + month;
  }

  var destination = createPostDestination(year, month, post_name, true);
  publish(post, destination);
});

desc('Update homepage');
task('home', function() {
  var template = read(join("templates", "index.ejs"), 'utf8');
  var destination = "index.html";

  var html = ejs.render(template, {}, { filename: join("templates", "index.ejs") });

  write(destination, html);
});
