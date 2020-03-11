So, I like to write articles about software and post them to medium. In most cases they constains some code samples or references to github. Everything works well until you change one of the samples. The other thing: it requires a huge amount of manual work(which error prone by design).
There are also some conceptual problems:

- I want to have a way of checking the integrity of the document programmaticaly
- I want to use my favourite text editor
- I want to have everything inside of version-control system

and probably the main outcome: I want to be able to write the actual article and the code in the same time and in an iterative way. On the moment it often works like this: I start researching something, write some code and... have no motivation to write an article after.

I tried to find an already existed solution but found nothing except a tool which turns (markdown into medium posts)[https://markdowntomedium.com/]. It doesn't solve a problem of refencing the code but at least give me a way to store markdown in the repo and convert it after to the article.
So, we just need a tool to refence some code inside of markdown.

On high lever I want to have something which turning:

```
the simpest javascript code looks like:
$$INCLUDE:$$INCLUDE:hello.js
```
into:

```
the simpest javascript code looks like:
$$INCLUDE:hello.js
```

So, let's create a node.js package and write a small test with mocha.

```
$$INCLUDE:./test/referencer.spec.js
```
This tests perfectly serves the purpose of showing the idea and being a prototype, but we need somehow make a tool from it.
I really like the idea behing \*nix tools, they are small, addresed, easy to use and extend. So, let's try to distribute out solution in a form of command-line tool:

```
cat article.md | node index.js
```

Most of the command line tools
- handle stdin and produce stdout
- return 0 exit code in a case of success
- return non-0 exit code in a case of error
- write in strerr in a case of error

Let's add small integrational test to show our intentions:

```
$$INCLUDE:./test/referencer.spec.js
```

I like integrational tests because they:
- check the exact behaviour of the app
- easily cover large parts of codebase for small price

The actual implementation should like this now:
```
$$INCLUDE:./index.js
```

Works for now, but let's also cover a case when provide a broken reference:
```
$$INCLUDE:./test/referencer.spec.js
```

