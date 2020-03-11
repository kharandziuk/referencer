const { expect } = require('chai')

const referencer = require('../index')

describe('refencer', function() {
  it('should be able to include files', async function() {
    const text = `the simpest javascript code looks like:
    $$INCLUDE:./artifacts/hello.js`
    expect(referencer(text)).eql(
`the simpest javascript code looks like:
console.log('hello world!')`)
  })
})
