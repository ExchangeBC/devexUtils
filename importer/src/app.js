
/* Application server
 */

const express = require('express')
const fileUpload = require('express-fileupload')

const fileSize = process.env.FILESIZE || Infinity

const files = 1
const abortOnLimit = true
const safeFileNames = true
const limits = { fileSize, files }
const options = { safeFileNames, limits, abortOnLimit }

if (!process.env['UPLOAD_KEY']) {
  console.error('No UPLOAD_KEY set')
  process.exit(1)
}

function handleUpload(req, res, next) {
  const notProvided = new Error('File not provided')
  const invalidKey = new Error('Invalid key provided')
  if (!req.files || !req.files.data) throw notProvided
  if (process.env['UPLOAD_KEY'] != req.query.key) throw invalidKey
  req.files.data.mv('/tmp/target.tar.gz', next)
}

function handleSuccess(req, res, next) {
  console.log(`[${req.ip}] [201] Upload successful for ${req.query.key}`)
  res.status(201).send('Upload successful') 
}

function handleInvalidRequests(req, res) {
  throw new Error('That request is not supported')
}

function handleError(err, req, res, next) {
  const code = 
    err.message == 'File not provided' || 
    err.message == 'Invalid key provided' ||
    err.message == 'That request is not supported' ? 400 : 500
  const response = code == 400 ? err.message : 'Could not process upload'
  console.log(`[${req.ip}] [${code}] Upload failed with: ${err.message}`)
  res.status(code).send(response)
}

const app = express()
app.use(fileUpload(options))
app.post('/upload', handleUpload)
app.post('/upload', handleSuccess)
app.all('*', handleInvalidRequests)
app.use(handleError)

module.exports = app
