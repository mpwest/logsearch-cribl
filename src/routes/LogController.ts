import LogSearch from '../logs/LogSearch'
import express from 'express'
import FileDoesNotExist from '../error/FileDoesNotExist'
import Logger from '../logger/Logger'

export var logRoutes = express.Router()

logRoutes.get('/logs/:filename', async function(req: express.Request, res: express.Response) {
    const logger = new Logger()
    const { filename } = req.params
    if(!filename) {
        res.status(400).send()
    }

    const recordCount = parseInt(req.query.records?.toString() ?? process.env.DefaultRecordCount ?? '20')
    const searchAny = req.query.searchAny === 'true'
    const matchCase = req.query.matchCase === 'true'

    let keywords = req.query.keyword
    let searchTerms: string[] = []
    if(typeof keywords === 'string') {
        searchTerms.push(keywords)
    }
    else if (Array.isArray(keywords)) {
        for(let i = 0; i < keywords.length; i++) {
            // handling if keywords is ParsedQ[]
            searchTerms.push(keywords[i] as string)
        }
    }
    else if(keywords != undefined) {
        // handling if keywords is ParsedQ
        searchTerms.push(keywords.toString())
    }

    logger.info(`log request for ${filename} (${recordCount} records${searchTerms.length > 0 ? `, search terms: ${searchTerms}${searchAny ? ' (Any)' : ' (All)'}`: ''})`)
    try {
        let response = await new LogSearch(logger).getLogs(filename!, recordCount, searchTerms, searchAny, matchCase)
        res.send(response)
    }
    catch (err: unknown){
        if (typeof err === typeof FileDoesNotExist) {
            res.status(400).send()
        }
    }
})
