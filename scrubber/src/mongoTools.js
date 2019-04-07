
/* Restore
 * Spawns a subshell to run mongorestore
 */

const util = require('util')
const config = require('./config')
const childProcess = require('child_process')

const exec = util.promisify(childProcess.exec)

async function restore(uri, loc) {
  const command = `
    mongorestore \
      --uri ${uri} \
      --nsFrom '${config.src.db.name}.*' \
      --nsTo '${dest.db.name}.*' \
      --authenticationDatabase admin \
      --archive=${loc} \
      --gzip
  `
  console.log(`Restoring to ${uri}`)
  const { stdout, stderr } = await exec(command)
  if (stdout) console.log('== STDOUT ==', '\n', stdout)
  if (stderr) console.err('== STDERR ==', '\n', stderr)
  console.log('Restore complete')
}

async function dump(uri, loc) {
  const command = `
    mongodump \
      --uri ${uri} \
      --archive=${loc} \
      --gzip
  `
  console.log(`Dumping ${uri}`)
  const { stdout, stderr } = await exec(command)
  if (stdout) console.log('== STDOUT ==', '\n', stdout)
  if (stderr) console.err('== STDERR ==', '\n', stderr)
  console.log('Restore complete')
}

module.exports = { restore, dump }
