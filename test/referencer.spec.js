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

  it('includes some lines', function(done) {
    const text = `2-3 is
    $$INCLUDE:./artifacts/123.js:2:3`
    expect(referencer(text)).eql(
`2-3 is
console.log('2')
console.log('3')`
    )
  })

  it('includes the first line', function(done) {
    const text = `1 is
    $$INCLUDE:./artifacts/123.js:1:1`
    expect(referencer(text)).eql(
`1 is
console.log('1')`
    )
  })

  it('includes the last line', function(done) {
    const text = `3 is
    $$INCLUDE:./artifacts/123.js:3:3`
    expect(referencer(text)).eql(
`3 is
console.log('3')`
    )
  })
})
