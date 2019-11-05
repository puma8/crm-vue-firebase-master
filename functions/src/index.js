const admin = require('firebase-admin')
admin.initializeApp({
  credential: admin.credential.applicationDefault()
})
if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
  require('dotenv').config()
}
const apis = require('./apis')
const triggers = require('./triggers')

var key

for (key in apis.default) {
  exports[key] = apis.default[key].default
}

for (key in triggers.default) {
  exports[key] = triggers.default[key]
}
