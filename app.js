import './src/com'
import Express from 'express'
import fs from 'fs'
import path from 'path'
import cors from 'cors'
import bodyParser from 'body-parser'
import http from 'http'

const Router = Express.Router
const app = Express()

const corsOptions = {
  origin: [/localhost:[0-9]{2,5}/, /127.0.0.1:[0-9]{2,5}/],
  optionsSuccessStatus: 200,
  credentials: true
}

fs.readdir('./src/controllers', (err, p) => {
  if (err) {
    console.error(err)
    return
  }
  p.forEach(f => {
    try {
      fs.stat(`./src/controllers/${f}`, (err, stat) => {
        if (err) {
          console.error(err)
          return
        }
        if (stat.isDirectory()) {
          const router = Router()
          const _ctrl = require(`./src/controllers/${f}/index`)
          if (!_ctrl.hasOwnProperty('default')) {
            console.error(`Module should have a default exported class.`)
            return
          }
          const ctrl = new _ctrl.default(router)
          ctrl.register()
          app.use(`/${f}`, router)
        }
      })
    } catch (e) {
      console.log(e)
    }
  })
})

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors(corsOptions))

http.createServer(app).listen(3000, () => {
  console.log('Server is listening at port 3000')
})
