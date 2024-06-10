import express, { Application } from 'express'
import { logRoutes }  from './routes/LogController'
import Logger from './logger/Logger'

process.on('uncaughtException', function (err) {
    console.log(err)
  })

const app: Application = express()
const port = process.env.Port || 8080

app.use('/', logRoutes)

app.listen(port, ()=>{
    new Logger().log(`Application running on port ${port}`)
})
