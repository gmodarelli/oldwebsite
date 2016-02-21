date: 2015-02-16
title: Code Reviews with Rubocop and Git pre-commit hook
extract:
  >
    We are different. We have different coding styles and even preferences and this is not a problem.
    Until of course you start to work in team. The most annoying thing during code reviews is to check and fix styling errors.
    Or even worse someone asks you to fix your code because it does not meet the style guidelines.
---
We are different. We have different coding styles and even preferences and this is not a problem.
Until of course you start to work in team. The most annoying thing during code reviews is to check and fix styling errors.
Or even worse someone asks you to fix your code because it does not meet the style guidelines.

There’s no official style guide for Ruby but fortunately we have
[a community-driven Ruby coding style guide](https://github.com/bbatsov/ruby-style-guide).
Still, checking every time if your code adheres to the standard is painful.

But again Ruby has a great community and a great set of tools to help us with this problem.
My favourite is [RuboCop](https://github.com/bbatsov/rubocop):

> RuboCop is a Ruby static code analyzer.
> Out of the box it will enforce many of the guidelines outlined in the community [Ruby Style Guide](https://github.com/bbatsov/ruby-style-guide).

## Rubocop

Using RuboCop is really easy. You add it to your Gemfile and run rubocop from the root of your application.
It will show a list of offences in your source code.

RuboCop provides a set of [default configuration options](https://github.com/bbatsov/rubocop/blob/master/config/default.yml)
that you can tweak to fit your team style.

Until you get familiar with all the Style Guides you will need to run rubocop on your code multiple times.
But as with anything that is not automated you will end up forgetting to run it manually (I did).

## Git Pre Commit Hook

I used a simple git pre-commit hook that runs rubocop for me everytime I commit some code. And it does more.

It runs rubocop only against the staged files and it will not commit if it finds offences.

The pre-commit is a simple bash script


```bash
#!/bin/sh
#
# Check for ruby style errors

red='\033[0;31m'
green='\033[0;32m'
yellow='\033[0;33m'
NC='\033[0m'

if git rev-parse --verify HEAD >/dev/null 2>&1
then
	against=HEAD
else
	# Initial commit: diff against an empty tree object
	# Change it to match your initial commit sha
	against=123acdac4c698f24f2352cf34c3b12e246b48af1
fi

# Check if rubocop is installed for the current project
bin/bundle exec rubocop -v >/dev/null 2>&1 || { echo >&2 "${red}[Ruby Style][Fatal]: Add rubocop to your Gemfile"; exit 1; }

# Get only the staged files
FILES="$(git diff --cached --name-only --diff-filter=AMC | grep "\.rb$" | tr '\n' ' ')"

echo "${green}[Ruby Style][Info]: Checking Ruby Style${NC}"

if [ -n "$FILES" ]
then
	echo "${green}[Ruby Style][Info]: ${FILES}${NC}"
	
	if [ ! -f '.rubocop.yml' ]; then
	  echo "${yellow}[Ruby Style][Warning]: No .rubocop.yml config file.${NC}"
	fi
	
	# Run rubocop on the staged files
	bin/bundle exec rubocop ${FILES}
	
	if [ $? -ne 0 ]; then
	  echo "${red}[Ruby Style][Error]: Fix the issues and commit again${NC}"
	  exit 1
	fi
else
	echo "${green}[Ruby Style][Info]: No files to check${NC}"
fi

exit 0
```

## Put everything together

If you want to try it on your ruby projects follow these simple steps:

1. Add `rubocop` to your `Gemfile`
```ruby
gem 'rubocop', '~> 0.29.0', require: false
```

2. Run `bundle install`

3. Create a `.rubocop.yml` file with your configurations. If you don’t, RuboCop will use the default settings.

4. Copy my gist above and paste it in your project’s hook directory. Save the file as __pre-commit__ (your-project/.git/hooks/pre-commit)

5. Change the pre-commit permissions with `chmod +x your-project/.git/hooks/pre-commit`

Every time you run git commit rubocop will check all the staged files for you and will prevent you
from committing code that does not adhere to your team standard.

Happy coding!
