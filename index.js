var fs = require('fs');
var read = require('fs').readFileSync;
var path = require('path');
var join = require('path').join;
var ejs = require('ejs');
var hljs = require('highlight.js')

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

var filePath = path.join("_posts", "test-ruby.md");

fs.readFile(filePath, { encoding: 'utf-8' }, function(err, data) {
  if (!err) {
    var outputPath = "test-ruby.html";
    var str = read(join("templates", "post.ejs"), 'utf8');
    var outputBody = ejs.compile(str)({
      title: "My Ruby",
      body: md.render(data)
    });

    fs.writeFile(outputPath, outputBody);
  }
});
