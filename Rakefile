require 'github/markup'
require 'redcarpet'
require_relative 'lib/post'

task :default => :html

task :html => %W[_posts/my-first-steps-in-erlang.html]

rule ".html" => ".md" do |t|
  title = File.basename t.source, ".md"
  body = GitHub::Markup.render t.source

  post = Post.new title, body

  File.open(t.name, "w") do |output_file|
    output_file.write post.render
  end
end
