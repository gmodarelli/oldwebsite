title: "Explaining Source Code: Dotenv part 2"
date: 2015-02-12
extract:
  >
    Last week we begun [a journey through the source code](/2015/02/esc_dotenv_pt1/) of the
    [Dotenv](https://github.com/bkeepers/dotenv) gem. Today we're gonna continue that journey.
    Last time we stopped right before jumping into the Environment class, so let's begin reading it.
---
Last week we begun [a journey through the source code](/2015/02/esc_dotenv_pt1/) of the
[Dotenv](https://github.com/bkeepers/dotenv) gem. Today we're gonna continue that journey.

Last time we stopped right before jumping into the Environment class, so let's begin reading it.

```ruby
module Dotenv
  class Environment < Hash
    attr_reader :filename

    def initialize(filename)
      @filename = filename
      load
    end

    def load
      update Parser.call(read)
    end

    def read
      File.read(@filename)
    end

    def apply
      each { |k,v| ENV[k] ||= v }
    end

    def apply!
      each { |k,v| ENV[k] = v }
    end
  end
end
```

This class inherits from the ruby `Hash` class. It does so because the environment is nothing but a
_key-value storage_ where we store, for instance, tokens and secrets to access external services,
and then we fetch them through the `ENV` hash.

We initialize an object of this class with a file (for example the default .env file) and then call the
`load` method. The `load` method, in turns, calls the `update` method passing in the result of the call
to `Parser.call(read)`.
For now just keep in mind that the `Parser.call` method takes in the content of the file and 
parses it into a hash. We won't read the `Parser` class together.
You can read it as an exercise and you will learn something useful about `regular expressions`!

The [`update`](http://ruby-doc.org/core-2.2.0/Hash.html#method-i-update) method is a method of the `Hash`
class and it merges two hashes together.
In fact it is an alias for `merge`. So the `load` method merges the hash returned by the `Parser`
into itself (remember, `Environment` is a `Hash`).

We have other two important methods defined in this class, the `apply` and `apply!` methods.

Inside these two methods is where the magic of Dotenv happens. Let's take a look at the `apply` method first,
and then we'll see how it differs from the `apply!` one.

```ruby
def apply
  each { |k,v| ENV[k] ||= v }
end
```

It's just one line of code. The method calls `each` -- and since there's no `each` method defined on this
class, it is calling the `each` defined on the `Hash` class -- passing it a block.

`each` iterates over all the key-value pairs of the hash and the block sets the value of a key inside the
`ENV` variable, only if it is not already set. It does so using the `||= (or equal) operator`.
And this is where `apply` differs from `apply!`. The latter overrides an existing key with the new value.

```ruby
def apply
  each { |k,v| ENV[k] = v }
end
```

To see how these two methods are used, let's go back to the `dotenv.rb` file. Here are the important bits:

```ruby
module Dotenv
  extend self

  attr_accessor :instrumenter

  def load(*filenames)
    with(*filenames) do |f|
      if File.exist?(f)
        env = Environment.new(f)
        instrument('dotenv.load', :env => env) { env.apply }
      end
    end
  end

  # ...

  def instrument(name, payload = {}, &block)
    if instrumenter
      instrumenter.instrument(name, payload, &block)
    else
      block.call
    end
  end
end
```

On line 10 we call the `instrument` method, and we provide a block. Inside this block we call the `apply`
method on the `env` variable (an instance of the `Environment` class). As you can see from the `instrument`
method we execute the block only if an `instrumenter` is not provided. It is using the block to provide
a default behaviour.

You will find this pattern everywhere in Ruby. For example it is used by the
[Hash#fetch](http://ruby-doc.org/core-2.2.0/Hash.html#method-i-fetch) method to provide a default value
when the key you are trying to access is missing.

In simple situations, like a simple ruby app, or even a Sinatra app, this default behaviour is all we need.

There are situations when we need to do more than just adding keys to the `ENV` variable. Dotenv provides 
an Instrumenter for Rails. Let's take a look at the code

```ruby
require 'dotenv'

Dotenv.instrumenter = ActiveSupport::Notifications

# Watch all loaded env files with Spring
begin
  require 'spring/watcher'
  ActiveSupport::Notifications.subscribe(/^dotenv/) do |*args|
    event = ActiveSupport::Notifications::Event.new(*args)
    Spring.watch event.payload[:env].filename if Rails.application
  end
rescue LoadError
  # Spring is not available
end

# ...
```

On line 3 it assigns [ActiveSupport::Notifications](http://edgeapi.rubyonrails.org/classes/ActiveSupport/Notifications.html)
to `Dotenv.instrumenter`. `ActiveSupport::Notifications` responds to `instrument```and takes a `name`,
a `payload` and a `block`.

I'm not 100% sure cause I didn't have the time to dive deeper, but here is what I think this file does.
It listens to all the events that starts with _dotenv. _When it captures an event, it  generates an
[ActiveSupport::Notifications::Event](http://edgeapi.rubyonrails.org/classes/ActiveSupport/Notifications/Event.html)
with the event informations (name, start, finish, id, payload). Then it takes the filename from the event
payload, and tells `Spring` to watch this file.

To better understand this last bit, let's take another look at the how the `instrument` method is invoked.

```ruby
instrument('dotenv.load', :env => env) { env.apply }
```

The name we pass to instrument is _dotenv.load_. It starts with _dotenv_ so the subscriber will capture 
this event. Then we pass a payload that is just an hash with a single key: env.
This key points to the `env` instance (remember, this is an instance of the `Environment` class).

The `Environment` class defines an `attr\_reader` called `filename` that returns the filename an `Environment`
object is initialized with.

That's why we can call `event.payload\[:env\].filename `and get in return the configuration filename.

Actually this instrumenter for Rails does other stuff. It creates a
[Railtie](http://edgeapi.rubyonrails.org/classes/Rails/Railtie.html) that is needed to setup a subscriber
with `ActiveSupport::Notifications`, but I won't go into the details this time.
Maybe in the future when I understand this stuff better!

Anyway the file is commented pretty well and you can get the big picture.

```ruby
module Dotenv
  class Railtie < Rails::Railtie
    config.before_configuration { load }

    # Public: Load dotenv
    #
    # This will get called during the `before_configuration` callback, but you
    # can manually call `Dotenv::Railtie.load` if you needed it sooner.
    def load
      Dotenv.load(
        root.join(".env.local"),
        root.join(".env.#{Rails.env}"),
        root.join('.env')
      )
    end

    # Internal: `Rails.root` is nil in Rails 4.1 before the application is
    # initialized, so this falls back to the `RAILS_ROOT` environment variable,
    # or the current working directory.
    def root
      Rails.root || Pathname.new(ENV["RAILS_ROOT"] || Dir.pwd)
    end

    # Rails uses `#method_missing` to delegate all class methods to the
    # instance, which means `Kernel#load` gets called here. We don't want that.
    def self.load
      instance.load
    end
  end
end
```

## What we've learned

1. `Hash\#update` -- it is an alias for `merge`. Merges two hashes and overrides existing keys with the ones found into the hash passed in.
2. `Blocks` can be used to provide default behaviour to a method. Kinda like when you provide a Policy or a Strategy object to change the behaviour of a process.
3. `ActiveSupport::Notifications` -- You can use them to subscribe to events fired by instrumenter (both from Rails or other gems).

I want to give a special thanks to my buddy Alex Pedini who proof reads these posts every week. Thank you!

P.S.: He is a terrific musician. Check out his [YouTube channel](https://www.youtube.com/user/gotenks82)

Happy coding!
