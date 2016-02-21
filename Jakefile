var read = require('fs').readFileSync;
var write = require('fs').writeFile;
var join = require('path').join;
var ejs = require('ejs');
var hljs = require('highlight.js');
var mkdirp = require('mkdirp');
var exec = require('child_process').exec;
var yaml = require('js-yaml');
var moment = require('moment');
var _ = require('lodash');

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
    date: moment(post.date).format('LL'),
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
    body: text,
    extract: meta.extract
  };
};

var allPosts = function() {
  var posts = JSON.parse(read('posts.json', 'utf8'));
  return posts;
};

var findPost = function(post_name) {
  return allPosts()[post_name];
};

var deletePost = function(post_name) {
  var posts = allPosts();
  delete posts[post_name];

  write('posts.json', JSON.stringify(posts));
};

var storePost = function(post) {
  var posts = allPosts();

  posts[post.slug] = {
    date: post.date,
    slug: post.slug,
    title: post.title,
    link: post.link,
    extract: post.extract
  };

  write('posts.json', JSON.stringify(posts));
};

desc('Publish a post');
task('publish', function(post_name) {
  var post = parsePost(post_name);
  var destination = createPostDestination(post.link);

  publish(post, destination);
});

desc('Unpublish a post');
task('unpublish', function(post_name) {
  var post = findPost(post_name);

  if(post != undefined) {
    deletePost(post_name);
    exec('rm -rf ' + post.link);
  }
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

  var sortedPosts = keys.map(function(v) {
    var post = posts[v];
    post.publishedOn = moment(post.date).format('LL');
    post.date = moment(post.date);

    if(post.extract != undefined) {
      post.extract = md.render(post.extract);
    }

    return post;
  });

  sortedPosts = _.reverse(_.sortBy(sortedPosts, function(p) { return p.date; }));

  var html = ejs.render(template, { posts: sortedPosts }, { filename: join("templates", "index.ejs") });

  write(destination, html);
});

