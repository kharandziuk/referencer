const fs = require('fs')

const referencer = (text) => {
  return text.split('\n')
    .map(line => {
      if(!line.includes('$$INCLUDE:')) {
        return line
      } else {
        const filename = line.split('$$INCLUDE:')[1]
        const content = fs.readFileSync(filename)
        return content
      }
    })
    .join('\n').trim()
}

module.exports = referencer
