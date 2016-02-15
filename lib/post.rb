require 'erb'

class Post
  include ERB::Util
  attr_accessor :title, :date, :body

  def initialize(title, body, date = Time.now)
    @title = title
    @body = body
    @date = date
  end

  def render
    ERB.new(template).result(binding)
  end

  def template
    File.read "templates/post.erb"
  end
end
