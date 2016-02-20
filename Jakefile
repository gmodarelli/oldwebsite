var read = require('fs').readFileSync;
var write = require('fs').writeFile;
var join = require('path').join;
var ejs = require('ejs');
var hljs = require('highlight.js');
var mkdirp = require('mkdirp');

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

var publish = function(source, destination) {
  var post = read(join("_posts", source + ".md"), 'utf8');
  var template = read(join("templates", "post.ejs"), 'utf8');

  var html = ejs.compile(template)({
    title: "My Ruby",
    body: md.render(markdown)
  });

  write(destination, html);
};

var parsePost = function(post_name) {
  var title = "Placeholder Title";
  var date  = new Date();
  var body  = read(join("_posts", post_name + ".md"), 'utf8');

  return {
    slug: post_name,
    title: title,
    date: date,
    body: body
  };
}

desc('Publish a post');
task('publish', function(year, month, post_name) {
  var destination = createPostDestination(year, month, post_name);
  publish(post_name, destination);
});

desc('Draft a post');
task('draft', function(year, month, post_name) {
  var destination = createPostDestination(year, month, post_name, true);
  publish(post_name, destination);
});
