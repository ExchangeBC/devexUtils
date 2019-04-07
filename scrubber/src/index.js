
/* Application entry point
 */

const app = require('./app')
const port = process.env.PORT || 3000

const requiredVars = [ 'KEY', 'DB_URI', 'TMP_DB_URI' ]

for (const requiredVar of requiredVars) {
  if (!process.env[requiredVar]) throw new Error(`No ${requiredVar} set`)
}

app.listen(3000, () => {
  console.log('Application started on port', port)
})
