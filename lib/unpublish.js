var posts = require('./posts.js');
var exec = require('child_process').exec;

var unpublish = function(post_name) {
  var post = posts.find(post_name);

  if(post != undefined) {
    posts.destroy(post_name);
    exec('rm -rf ' + post.link);
  }
};

module.exports = unpublish;
