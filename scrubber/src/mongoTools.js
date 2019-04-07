
/* Restore
 * Spawns a subshell to run mongorestore
 */

const url = require('url')
const util = require('util')
const childProcess = require('child_process')

const exec = util.promisify(childProcess.exec)
const opts = { maxBuffer: 1024 * 1024 }

async function restore(loc, uri) {
  const db = url.parse(uri).pathname.substr(1)
  const command = `
    mongorestore \
      --uri ${uri} \
      --nsFrom '$db$.$col$' \
      --nsTo '${db}.$col$' \
      --archive=${loc} \
      --gzip
  `
  console.log('Restoring to', uri)
  const { stdout, stderr } = await exec(command, opts)
  if (stdout) console.log('== STDOUT ==', '\n' + stdout)
  if (stderr) console.error('== STDERR ==', '\n' + stderr)
  console.log('Restore complete')
}

async function dump(uri, loc) {
  const command = `
    mongodump \
      --uri ${uri} \
      --archive=${loc} \
      --gzip
  `
  console.log('Dumping', uri)
  const { stdout, stderr } = await exec(command, opts)
  if (stdout) console.log('== STDOUT ==', '\n' + stdout)
  if (stderr) console.error('== STDERR ==', '\n' + stderr)
  console.log('Dump complete')
}

module.exports = { restore, dump }
