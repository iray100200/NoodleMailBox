import './src/com'
import Express from 'express'
import fs from 'fs'
import cors from 'cors'
import bodyParser from 'body-parser'
import http from 'http'
import compression from 'compression'
import cluster from 'express-cluster'
import logger from './src/com/logger'

const numCPUs = require('os').cpus().length
const corsOptions = {
  origin: [/localhost:[0-9]{2,5}/, /127.0.0.1:[0-9]{2,5}/],
  optionsSuccessStatus: 200,
  credentials: true
}

cluster(() => {
  const Router = Express.Router
  const app = Express()

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
            let register = ctrl.register();
            for (let path in register) {
              try {
                let [...r] = path.match(/^@(\w*)\-\>([\w\W]*)/)
                router[r[1]](r[2], register[r[0]])
              } catch (e) {
                console.log(e)
              }
            }
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
  app.use(compression())

  return http.createServer(app).listen(3000, () => {
    logger.info('Server is listening at port 3000')
  })
}, { count: numCPUs })
