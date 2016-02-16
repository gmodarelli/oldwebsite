require 'github/markup'
require 'redcarpet'
require_relative 'lib/post'

task :publish do
  ARGV.each { |a| task a.to_sym do; end }
  ARGV.shift

  ARGV.each do |filename|
    post = Post.parse("_posts/#{filename}.md")
    post.publish
  end
end
