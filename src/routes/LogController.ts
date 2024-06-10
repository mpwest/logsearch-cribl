import LogSearch from '../logs/LogSearch'
import express from 'express'
import FileDoesNotExist from '../error/FileDoesNotExist'
import Logger from '../logger/Logger'

export var logRoutes = express.Router()

logRoutes.get('/logs/:filename', async function(req: express.Request, res: express.Response) {
    Logger.trace('new request')
    const { filename } = req.params
    if(!filename) {
        res.status(400).send()
    }
    let recordCount = parseInt(req.query.records?.toString() ?? process.env.DefaultRecordCount ?? '20')
    let searchTerms = req.query.keyword as string[] ?? {}
    let searchAny = req.query.searchAny === 'true'
    Logger.debug(`log request for ${filename} (${recordCount} records${searchTerms.length > 0 ? `search terms: ${searchTerms}`: ''})`)
    try {
        let response = await new LogSearch().getLogs(filename!, recordCount, searchTerms, searchAny)
        res.send(response)
    }
    catch (err: unknown){
        if (typeof err === typeof FileDoesNotExist) {
            res.status(400).send()
        }
    }
})
