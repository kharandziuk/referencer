So, I like to write articles about software and post them to medium. In most cases they constains some code samples or references to github. Everything works well until you change one of the samples. The other thing: it requires a huge amount of manual work(which error prone by design).
There are also some conceptual problems:

- I want to have a way of checking the integrity of the document programmaticaly
- I want to use my favourite text editor
- I want to have everything inside of version-control system

and probably the main outcome: I want to be able to write the actual article and the code in the same time and in an iterative way. On the moment it often works like this: I start researching something, write some code and... have no motivation to write an article after.

I tried to find an already existed solution but found nothing except a tool which turns (markdown into medium posts)[https://markdowntomedium.com/]. It doesn't solve a problem of refencing the code but at least give me a way to store markdown in the repo and convert it after to the article.
So, we just need a tool to refence some code inside of markdown.

On high lever I want to have something which turning:

```javscript
#the simpest javascript code looks like:
console.log('hello world!')

```
into:

```javascript
simpest javascript code looks like:
console.log('hello world!')

```

So, let's create a node.js package and write a small test with mocha.

```javascript
const { expect } = require('chai')
const { execSync } = require('child_process');

const referencer = require('../index')

describe('refencer', function() {
  it('should be able to include files', async function() {
    const text = `the simpest javascript code looks like:
    $$INCLUDE:./artifacts/hello.js`
    expect(referencer(text)).eql(
`the simpest javascript code looks like:
console.log('hello world!')`)
  })

  it('should be able to ignore include', async function() {
    const text = `I can ignore
    $$INCLUDE:$$INCLUDE:./artifacts/hello.js`
    expect(referencer(text)).eql(
      `I can ignore
    $$INCLUDE:./artifacts/hello.js`
    )
  })

  it('is a cmd line tool', async function() {
    const text = `the simpest javascript code looks like:
    $$INCLUDE:./artifacts/hello.js`
    const actual = execSync(`echo '${text}' | node index.js`).toString()
    expect(actual).to.include('hello world');
  })

  it('-1 in case of error', function(done) {
    try {
      const text = `$$INCLUDE:not-exist.js`
      execSync(`echo '${text}' | node index.js`).toString()
    } catch(e) {
      expect(e.status).eql(1)
      expect(e.stderr.toString()).eql(
        'file not-exist.js from $$INCLUDE:not-exist.js isn\'t exist'
      )
      done()
    }
  })
})

```
This tests perfectly serves the purpose of showing the idea and being a prototype, but we need somehow make a tool from it.
I really like the idea behing \*nix tools, they are small, addresed, easy to use and extend. So, let's try to distribute out solution in a form of command-line tool:

```sh
cat article.md | node index.js
```

Most of the command line tools
- handle stdin and produce stdout
- return 0 exit code in a case of success
- return non-0 exit code in a case of error
- write in strerr in a case of error

Let's add small integrational test to show our intentions:

```javascript
const { expect } = require('chai')
const { execSync } = require('child_process');

const referencer = require('../index')

describe('refencer', function() {
  it('should be able to include files', async function() {
    const text = `the simpest javascript code looks like:
    $$INCLUDE:./artifacts/hello.js`
    expect(referencer(text)).eql(
`the simpest javascript code looks like:
console.log('hello world!')`)
  })

  it('should be able to ignore include', async function() {
    const text = `I can ignore
    $$INCLUDE:$$INCLUDE:./artifacts/hello.js`
    expect(referencer(text)).eql(
      `I can ignore
    $$INCLUDE:./artifacts/hello.js`
    )
  })

  it('is a cmd line tool', async function() {
    const text = `the simpest javascript code looks like:
    $$INCLUDE:./artifacts/hello.js`
    const actual = execSync(`echo '${text}' | node index.js`).toString()
    expect(actual).to.include('hello world');
  })

  it('-1 in case of error', function(done) {
    try {
      const text = `$$INCLUDE:not-exist.js`
      execSync(`echo '${text}' | node index.js`).toString()
    } catch(e) {
      expect(e.status).eql(1)
      expect(e.stderr.toString()).eql(
        'file not-exist.js from $$INCLUDE:not-exist.js isn\'t exist'
      )
      done()
    }
  })
})

```

I like integrational tests because they:
- check the exact behaviour of the app
- easily cover large parts of codebase for small price

The actual implementation should like this now:
```javascript
const fs = require('fs')
const stream = require('stream')
const { promisify } = require('util')

const INCLUDE_TEMPLATE = '$$INCLUDE:'

const referencer = (text) => {
  return text.split('\n')
    .map(line => {
      if(!line.includes(INCLUDE_TEMPLATE)) {
        return line
      } else if(line.includes(INCLUDE_TEMPLATE+INCLUDE_TEMPLATE)) {
        return line.replace(INCLUDE_TEMPLATE, '')
      } else {
        const filename = line.split(INCLUDE_TEMPLATE)[1]
        let content
        try {
          content = fs.readFileSync(filename)
        } catch(err) {
          if (err.code !== 'ENOENT') { throw err }
          throw Error(`file ${filename} from ${line} isn't exist`)
        }
 
        return content
      }
    })
    .join('\n').trim()
}

const _finished = promisify(stream.finished)

const asPromise = (readable) => {
    // TODO: rewrite with _finished
    // TODO: what if it s not an array?
    const result = []
    const w = new stream.Writable({
      write(chunk, encoding, callback) {
        result.push(chunk)
        callback()
      }
    })
    readable.pipe(w)
    return new Promise((resolve, reject) => {
      _finished(w).then(resolve).catch(reject)
      readable.on('error', (err) => {
        reject(err)
      })
    }).then(() => result.join(''))
}

if (require.main === module) {
  asPromise(process.stdin)
    .then(txt => process.stdout.write(referencer(txt)))
    .catch(err => {
        process.stderr.write(err.message)
        process.exit(1)
    })
} else {
  module.exports = referencer
}

```

Works for now, but let's also cover a case when provide a broken reference:
```javascript
const { expect } = require('chai')
const { execSync } = require('child_process');

const referencer = require('../index')

describe('refencer', function() {
  it('should be able to include files', async function() {
    const text = `the simpest javascript code looks like:
    $$INCLUDE:./artifacts/hello.js`
    expect(referencer(text)).eql(
`the simpest javascript code looks like:
console.log('hello world!')`)
  })

  it('should be able to ignore include', async function() {
    const text = `I can ignore
    $$INCLUDE:$$INCLUDE:./artifacts/hello.js`
    expect(referencer(text)).eql(
      `I can ignore
    $$INCLUDE:./artifacts/hello.js`
    )
  })

  it('is a cmd line tool', async function() {
    const text = `the simpest javascript code looks like:
    $$INCLUDE:./artifacts/hello.js`
    const actual = execSync(`echo '${text}' | node index.js`).toString()
    expect(actual).to.include('hello world');
  })

  it('-1 in case of error', function(done) {
    try {
      const text = `$$INCLUDE:not-exist.js`
      execSync(`echo '${text}' | node index.js`).toString()
    } catch(e) {
      expect(e.status).eql(1)
      expect(e.stderr.toString()).eql(
        'file not-exist.js from $$INCLUDE:not-exist.js isn\'t exist'
      )
      done()
    }
  })
})

```

And now we should be able to run the tool over this article. Something like:
```
cat article.md | node index.js
```
and It works!

Except only one minor issue: we need to add a way to ignore the substitution for our first example.
But let's do it in the next article.