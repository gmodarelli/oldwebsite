date: 2015-02-19
title: My First Steps in Erlang
---
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

```xml
<x xmlns='jabber:x:delay' from='capulet.com' stamp='20020910T23:08:25'>Offline Storage</x>
```

The server adds this line to a message stanza when re-submitting messages to previously offline clients.
Searching on the XMPP website (the protocol implemented by MongooseIM) I found that that line is added
by the XEP-0091 extension that has been obsoleted by now. So the solution was simply to find where
MongooseIM implemented that extension and take it out.

A quick search pointed me to the right spots and I was really surprised by how clean and understandable
the code was. It was mind blowing. I mean. I’m not saying that I could understand everything that was
going on, but I was able to remove the functions on the module that generated the offending xml tag.

I was so happy that I decided to make a pull request to remove the obsolete XEP-0091 extension from MongooseIM.
Needless to say I was afraid to make a pull request on such a big project, written in a language
I don’t understand. But I did it anyway, and I’m really happy now!

The maintainer of the gem Michał Piotrowski was really kind. He replied my questions and gave me advice
on how to test my pull request. So thanks again Michał!

My story tells that you don’t have to be an expert to contribute to open source projects.
You don’t have to be afraid of making pull requests. Chances are they will be rejected, but who cares!
It’s a great way to become a better developer! And helping others in the process :)

Oh! It goes without saying that I’ll definitely buy the Learn You Some Erlang book and you should
do it too if you want to start with this awesome language.

Happy coding!
