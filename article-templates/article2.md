In the first part of our journey we implemented a tool to refence code somples from the article. It works well and from my perspective it is really important to have something working but it lacks some important features:

- There is no way to ignore substition
- As user I want to include only a part of the file instead of the whole file

So, the first feature can be easily described in code as a test:

```javascript
$$INCLUDE:./test/referencer.spec.js:15:22
```

and we can easily implement it with one more `else if`

```javascript
$$INCLUDE:./test/index.spec.js:12:15
```

On the momemt all of our tests should pass.

The second user story is a little bit more complex. Let's try to draft a possible solution. I should be able to write something like:

```
$$INCLUDE:$$INCLUDE:./test/referencer.spec.js:15:22
```

And include only the code between lines 15 and 22. Let's start with a simple test to illusrate the idea

```javascript
$$INCLUDE:./test/referencer.spec.js:44:52
```

and let's cover some edge cases

```javascript
$$INCLUDE:./test/referencer.spec.js:54:70
```

If you run the tests now they will brake(as expected). So, let's try to implement the actual logic with some quich and dirty solution:

```javascript
$$INCLUDE:./test/referencer.spec.js:19:40
```

now all the tests should be green.
