
/* Main web application
 */

const express = require('express')
const scrubber = require('./scrubber/scrubber')

if (!process.env['DOWNLOAD_KEY']) {
  console.error('No DOWNLOAD_KEY set')
  process.exit(1)
}

function handleDownload(req, res) {
  const invalidKey = new Error('Invalid key provided')
  if (process.env['DOWNLOAD_KEY'] != req.query.key) throw invalidKey
  res.download('/tmp/export.tar.gz')
}

function handleInvalidRequests(req, res) {
  throw new Error('That request is not supported')
}

function handleError(err, req, res, next) {
  const code = 
    err.message == 'Invalid key provided' ||
    err.message == 'That request is not supported' ? 400 : 500
  const response = code == 400 ? err.message : 'Could not process request'
  console.log(`[${req.ip}] [${code}] Download failed with: ${err.message}`)
  res.status(code).send(response)
}

const app = express()
app.get('/download', handleDownload)
app.all('*', handleInvalidRequests)
app.use(handleError)

const threeHours = 3*60*60*1000
setInterval(threeHours, scrubber.scrub)

module.exports = app
