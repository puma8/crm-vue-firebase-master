import fs from 'fs'

const apis = {}

fs.readdirSync(__dirname).forEach(file => {
  if (file !== 'index.js') {
    apis[file.replace('.js', '')] = require(`${__dirname}/${file}`)
  }
})

export default apis
