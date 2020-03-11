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
