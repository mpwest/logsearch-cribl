import express, { Application } from 'express'
import path from 'path'
import { logRoutes }  from './routes/LogController'
import Logger from './logger/Logger'

process.on('uncaughtException', function (err) {
    console.log(err)
  })

const app: Application = express()
const port = process.env.Port || 8080

app.use(express.static(path.resolve(__dirname, "frontend")))

app.get("/home", (req, res) => {
    res.sendFile(path.resolve(__dirname, 'frontend', 'index.html'))
});

app.use('/', logRoutes)

app.listen(port, ()=>{
    new Logger().log(`Application running on port ${port}`)
})
