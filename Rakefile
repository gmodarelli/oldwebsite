require 'github/markup'

task :default => :html

task :html => %W[_posts/my-first-steps-in-erlang.html]

rule ".html" => ".md" do |t|
  File.open(t.name, "w") do |output_file|
    output_file.write GitHub::Markup.render(t.source)
  end
end
