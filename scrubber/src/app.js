
/* Main web application
 */

const express = require('express')
const fileUpload = require('express-fileupload')
const asyncHandler = require('express-async-handler')
const mongoTools = require('./mongoTools')
const scrubber = require('./scrubber')

const files = 1
const abortOnLimit = true
const safeFileNames = true
const limits = { files }
const options = { safeFileNames, limits, abortOnLimit }

const notProvided = new Error('File not provided')
const invalidKey = new Error('Invalid key provided')

const outFile = '/tmp/scrubbed.gz'
const inFile = '/tmp/import.gz'

async function handleImport(req, res) {
  req.setTimeout(1000*60*15)
  if (!req.files || !req.files.data) throw notProvided
  if (process.env['KEY'] != req.query.key) throw invalidKey
  await req.files.data.mv(inFile)
  await mongoTools.restore(inFile, process.env['DB_URI'])
  console.log(`[${req.ip}] [201] Import successful`)
  res.status(201).send('Upload successful\n') 
}

async function handleExport(req, res) {
  req.setTimeout(1000*60*15)
  if (process.env['KEY'] != req.query.key) throw invalidKey
  await scrubber(process.env['DB_URI'], process.env['TMP_DB_URI'], outFile)
  console.log(`[${req.ip}] [200] Export successful`)
  res.download(outFile)
}

async function handleInvalidRequests(req, res) {
  throw new Error('That request is not supported')
}

function handleError(err, req, res, next) {
  const code = 
    err.message == 'File not provided' || 
    err.message == 'Invalid key provided' ||
    err.message == 'That request is not supported' ? 400 : 500
  const response = code == 400 ? err.message : 'Could not process request'
  console.log(`[${req.ip}] [${code}] Request failed with: ${err.message}`)
  res.status(code).send(response)
}

const app = express()
app.use(fileUpload(options))
app.post('/import', asyncHandler(handleImport))
app.get('/export', asyncHandler(handleExport))
app.all('*', asyncHandler(handleInvalidRequests))
app.use(handleError)

module.exports = app
