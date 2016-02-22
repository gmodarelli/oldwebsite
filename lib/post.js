var read = require('fs').readFileSync;
var yaml = require('js-yaml');
var join = require('path').join;
var mkdirp = require('mkdirp');

var _generateLink = function(post_name, date) {
  var year = date.getFullYear() + "";
  var month = date.getMonth();

  if (month < 10) {
    month = "0" + month;
  }

  return year + "/" + month + "/" + post_name;
};

var parse = function(post_name) {
  var body  = read(join("_posts", post_name + ".md"), 'utf8');
  var head = body.split("\n---\n")[0];
  var text = body.split("\n---\n")[1];

  var meta = yaml.safeLoad(head);
  var link = _generateLink(post_name, meta.date);

  return {
    slug: post_name,
    title: meta.title,
    date: meta.date,
    link: link,
    body: text,
    extract: meta.extract
  };
};

var createDestination = function(path, draft) {
  var destination = "";
  if (draft == true) { destination = join("_drafts"); }

  destination = join(destination, path);
  mkdirp.sync(destination);

  destination = join(destination, "index.html");
  return destination;
};

module.exports = {
  parse: parse,
  createDestination: createDestination
};
