require 'erb'
require 'fileutils'
require 'tempfile'

class Post
  include ERB::Util
  attr_accessor :title, :slug, :date, :body

  def self.parse(markdown_path)
    date = Time.now
    title = ""
    slug = File.basename(markdown_path, ".md")
    body = ""
    body_reached = false

    File.readlines(markdown_path).each do |line|
      if !body_reached && line =~ /^date:\s(.*)/
        date = Time.parse($1)
        next
      end

      if !body_reached && line =~ /^title:\s(.*)/
        title = $1
        next
      end

      if line =~ /^---/
        body_reached = true
        next
      end

      body << line
    end

    file = Tempfile.new('body')
    file.write body
    file.rewind
    file.close

    body = `./node_modules/marked/bin/marked #{file.path} --gfm`

    file.unlink

    self.new(title, slug, body, date)
  end

  def initialize(title, slug, body, date = Time.now)
    @title = title
    @slug = slug
    @body = body
    @date = date
  end

  def publish
    FileUtils.mkdir_p publish_folder
    filename = "index.html"
    File.open(File.join(publish_folder, filename), "w") do |output|
      output.write render
    end
  end

  private

  def publish_folder
    File.join date.year.to_s, date.strftime("%m"), slug
  end

  def render
    ERB.new(template).result(binding)
  end

  def template
    File.read "templates/post.erb"
  end
end
