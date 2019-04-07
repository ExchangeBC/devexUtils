
/* Main web application
 */

const express = require('express')
const asyncHandler = require('express-async-handler')
const scrubber = require('./scrubber')

async function handleDownload(req, res) {
  req.setTimeout(1000*60*15)
  const invalidKey = new Error('Invalid key provided')
  if (process.env['DOWNLOAD_KEY'] != req.query.key) throw invalidKey
  await scrubber()
  res.download('/tmp/export.gz')
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
app.get('/download', asyncHandler(handleDownload))
app.all('*', handleInvalidRequests)
app.use(handleError)

module.exports = app
