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
