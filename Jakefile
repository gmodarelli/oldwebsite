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

var createPostDestination = function(path, draft) {
  var destination = "";
  if (draft == true) { destination = join("_drafts"); }

  destination = join(destination, path);
  mkdirp.sync(destination);

  destination = join(destination, "index.html");
  return destination;
};

var publish = function(post, destination) {
  var template = read(join("templates", "post.ejs"), 'utf8');

  var data = {
    title: post.title,
    date: post.date,
    link: post.link,
    body: md.render(post.body)
  };

  var html = ejs.render(template, data, { filename: join("templates", "post.ejs") });

  write(destination, html);
  storePost(post);
};

var parsePost = function(post_name) {
  var body  = read(join("_posts", post_name + ".md"), 'utf8');
  var head = body.split("\n---\n")[0];
  var text = body.split("\n---\n")[1];

  var meta = yaml.safeLoad(head);
  var year = meta.date.getFullYear() + "";
  var month = meta.date.getMonth();

  if (month < 10) {
    month = "0" + month;
  }

  var link = year + "/" + month + "/" + post_name;

  return {
    slug: post_name,
    title: meta.title,
    date: meta.date,
    link: link,
    body: text
  };
};

var allPosts = function() {
  return JSON.parse(read('posts.json', 'utf8'));
};

var storePost = function(post) {
  var posts = allPosts();

  posts[post.slug] = {
    date: post.date,
    slug: post.slug,
    title: post.title,
    link: post.link
  };

  write('posts.json', JSON.stringify(posts));
};

desc('Publish a post');
task('publish', function(post_name) {
  var post = parsePost(post_name);
  var destination = createPostDestination(post.link);

  publish(post, destination);
});

desc('Draft a post');
task('draft', function(year, month, post_name) {
  var post = parsePost(post_name);
  var destination = createPostDestination(post.link, true);

  publish(post, destination);
});

desc('Update homepage');
task('home', function() {
  var template = read(join("templates", "index.ejs"), 'utf8');
  var destination = "index.html";

  var posts = allPosts();
  var keys = Object.keys(posts);
  var withoutKeys = keys.map(function(v) { return posts[v]; });

  var html = ejs.render(template, { posts: withoutKeys }, { filename: join("templates", "index.ejs") });

  write(destination, html);
});
