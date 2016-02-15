Today I will not publish a post about explaining source code because I want to share with you my experience 
with Erlang.

If you want to know more about my series on Explaining Source Code you can out
check my previous posts where we read the Dotenv gem.

This Monday I’ve begun to study Erlang on the awesome Learn you some erlang website.
It was in my todo list since forever and finally I had the chance to begin toying with it.

I’ve recently setup a MongooseIM server at work to build a mobile chat application.
MongooseIM is written in Erlang but in order to have a working server you need no Erlang
knowledge or experience.

The project has a great documentation and having a server setup and running it’s just a matter of
cloning the repository and running make rel. Of course you need a running Erlang VM, but that’s easy as well.

But today we ran into a problem. The framework we use on our Android app has a problem parsing dates
in a format that the MongooseIM server is sending. Unfortunately we couldn’t modify the framework
so the only solution was to dive deep into the server and try to find the offending date format.

Thanks to the android app log we were able to identify the source of the problem, this xml tag:
