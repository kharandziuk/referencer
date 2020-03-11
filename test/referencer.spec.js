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
})
