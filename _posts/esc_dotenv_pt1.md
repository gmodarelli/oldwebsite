title: "Explaining Source Code: Dotenv part 1"
date: 2015-02-05
extract:
  >
    This is the first in a series of posts about "Explaining Source Code". Every week I will pick an interesting
    gem and I will try to explain each line of its source code, diving into interesting ruby code, patterns and
    techniques. Hopefully we'll learn together every week.

    The gem of the day is [Dotenv](https://github.com/bkeepers/dotenv).
---
This is the first in a series of posts about "Explaining Source Code". Every week I will pick an interesting
gem and I will try to explain each line of its source code, diving into interesting ruby code, patterns and
techniques. Hopefully we'll learn together every week.

The gem of the day is [Dotenv](https://github.com/bkeepers/dotenv).
As they say on the README, Dotenv is a:

> Shim to load environment variables from `.env` into `ENV` in _development_.

## How to use it

You create a .env file on the root of you app with your config keys and values, like this:

```bash
MY_SECRET_ID=jkdsa89jkldas8y9p21bjl
MY_SECRET_TOKEN=jdskalhiop12jldaskd
```

And than you load it in your app with:

```ruby
require 'dotenv'
Dotenv.load
```

## Let's read the code

I always begin from the gem entry point, it this case the `.load` method that is defined inside the
`lib/dotenv.rb` file.

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
end
```

This file defines the `Dotenv` module, and then it extends the module with the module itself.

This is a technique used to define class methods on the module, so that we can call `Dotenv.load`.

For those who don't know what the `extend` keyword does, here is a simple example.

```ruby
module Utils
  def something_useful string
    string.upcase
  end
end

class StringUtils
  extend Utils
end

StringUtils.respond_to? :something_useful #=> true
StringUtils.something_useful 'mystring' #=> 'MYSTRING'
```

By extending our `StringUtils` class with the `Utils` module, we've added the `something\_useful` method
as a class method to the `StringUtils` class.

Now let's take a look at the `load` method. It accepts a list of filename (0 or more) and it does something
`_with_` each file.
There are a bunch of things going on here. Let's begin with the method parameters list.

By using the `splat` (\*) operator in front of a parameter name we are telling ruby to take all the
arguments passed to the method and put them inside an `Array`.

We can see how this works with a simple example:

```ruby
def invite_people *people
  people.each do |person|
    send_invitation_to person
  end

  people.class #=> Array
  people.inspect #=> [ "Andrea", "Luca", "Pawel" ]
end

invite_people "Andrea", "Luca", "Pawel"
```

The first line of the `load` method takes all the filenames and passes them to a `with` method.
Let's see what this `with` method does.

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

  def with(*filenames, &block)
    filenames << '.env' if filenames.empty?

    {}.tap do |hash|
      filenames.each do |filename|
        hash.merge! block.call(File.expand_path(filename)) || {}
      end
    end
  end

  # ...
end
```

It accepts the same list of filenames as the `load` method does and it takes a block. The first line of the
method checks if the filenames list is empty. It true, it pushes a default file, the .env file, to the
filenames array. That's why we can call `Dotenv.load` without arguments.

Then it creates a hash, populates it with the results of the block execution for each file and returns it.
There's lots of stuff going on here in just three lines of code so let's try to break it down.

`Tap`. As the ruby doc says, the tap method _yields self to the block and returns self_.So, if we call `tap`
on a hash, we'll get the hash passed to the block and we'll get the hash back (as the return value) when the
block execution ends. It is very useful when you need to chain calls to an object.

Inside the `tap` block we then iterate over each filename, and we call the block that was originally passed
to the `with` method with each filename. The block execution will return an hash (we can infer this since the
code is calling the `hash.merge!` method with the result of the block) or a nil value (if the file does not
exist), that's why we have the `|| {}`.

Let's jump back to the `load` method and take a look at the block. It first checks if the file exists and
then it initializes an `Environment` object with the file and calls the `instrument` method. The `instrument`
method accepts 2 arguments and a block. Before jumping to the `Environment` class let's take a quick look at
the `instrument` method.

It checks if an `instrumenter` is defined. If it's defined it delegates the `instrument` call to it, passing
all the parameters. Otherwise it just calls the block. In a simple use case(a simple ruby or sinatra app, not
a Rails one) we won't need an `instrumenter`, so the block will be called. The block just calls the `apply`
method on the instance of the `Environment` class.

## `What we've learned`

I'm running out of time today, so we'll continue exploring the `Dotenv` gem next Thursday. Before ending this
post I'd like to recap what we learned reading this gem:

1. `extend` -- When you extend a class A with a module B you add all the module B methods as class methods to
the class A. You can extend a module with self, making all the defined methods available as class method on
the module.
2. `splat (\*) `- When used in a parameters list, it groups the parameters into an array
3. `tap` -- When called on an object, it yields self to the block, and returns self. It's useful when you need
to do stuff to the object (changing state and so on) and return it cause you need to chain other calls on the
object.

A special note on `blocks`. When dealing with (and writing) ruby code you will always encounter blocks. They
are so common that explaining them every time we encounter one in these series would be annoying, that's why
if you read my post it feels like I'm skipping over them. But I have a blog post on my todo list that will
deal only with blocks, lambdas and procs and all their use cases.

Happy coding!
