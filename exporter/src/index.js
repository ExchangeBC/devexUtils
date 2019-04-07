
/* Application entry point
 */

const app = require('./app')
const port = process.env.PORT || 3000

const requiredVars = [ 'DOWNLOAD_KEY', 'SRC_URI', 'TMP_URI' ]

for (const requiredVar of requiredVars) {
  if (!process.env[requiredVar]) throw new Error(`No ${requiredVar} set`)
}

app.listen(3000, () => {
  console.log('Download application started on port', port)
})
