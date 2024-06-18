import express, { Application } from 'express'
import path from 'path'
import fs from 'fs'

import { logRoutes }  from './routes/LogController'
import Logger from './logger/Logger'
import sleep from './util/sleep'

process.on('uncaughtException', function (err) {
    console.log(err)
  })

const app: Application = express()
const port = process.env.Port || 8080

app.use(express.static(path.resolve(__dirname, 'frontend')))

app.get('/home', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'frontend', 'index.html'))
})

app.get('/favicon.ico', (req, res) => {
  res.setHeader('Content-Type', 'image/x-icon')
  const logger = new Logger()
  logger.debug('Send favicon')
  const imgLocation = path.join(__dirname, 'frontend', 'favicon.ico')
  fs.createReadStream(imgLocation).pipe(res)
  return
})

app.use('/', logRoutes)

const listener = app.listen(port, ()=>{
  const logger = new Logger()
  logger.log(`Application running on port ${port}`)

  const address = listener.address()
  if (address) {
    if(typeof address == 'string') {
      registerWithPrimary(logger, address)
    } else {
      registerWithPrimary(logger, address.address, address.port.toString())
    }
  }
})

process.on('SIGINT', function() {
  process.exit(0)
})

async function registerWithPrimary(logger: Logger, address: string, port?: string) {
  await sleep(3) // primary server should be started first, or simultaneously
  const primaryAddress = process.env.PrimaryAddress

  if (primaryAddress) {
    if(address == '::'){
      address = `http://localhost${port ? `:${port}` : ''}`
    }
    address = encodeURIComponent(address)
    const url = `${primaryAddress}/register/${address}`
    logger.debug(`Register at ${url}`)

    fetch(url, {
      method: 'post'
    })
  }
}
