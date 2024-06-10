import express, { Application } from 'express'
import { logRoutes }  from './routes/LogController'

process.on('uncaughtException', function (err) {
    console.log(err)
  })

const app: Application = express()
const port = process.env.Port || 8080

app.use('/', logRoutes)

app.listen(port, ()=>{
    console.log(`Application running on port ${port}`)
})