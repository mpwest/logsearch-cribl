import LogSearch from '../logs/LogSearch'
import express from 'express'
import FileDoesNotExist from '../error/FileDoesNotExist'
import Logger from '../logger/Logger'

export var logRoutes = express.Router()

const secondaryServers: string[] = []

logRoutes.get('/logs/:filename', async function(req: express.Request, res: express.Response) {
    const logger = new Logger()

    const secondaryPromises = []
    logger.trace(req.url)
    for(const i in secondaryServers) {
        logger.trace(`fetch from ${secondaryServers[i]}`)
        const fetchRequest = fetch(new URL(`${secondaryServers[i]}${req.url}`))
        .then((responseBody) => responseBody.json())

        const timeout = new Promise(function(resolve, reject) {
            setTimeout(function() {
                reject([])
            }, 60000)
        })
        const race = Promise.race([fetchRequest, timeout])

        secondaryPromises.push(race)
    }
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
    let response: string[] = []
    logger.info(`log request for ${filename} (${recordCount} records${searchTerms.length > 0 ? `, search terms: ${searchTerms}${searchAny ? ' (Any)' : ' (All)'}`: ''})`)
    try {
        response = await new LogSearch(logger).getLogs(filename!, recordCount, searchTerms, searchAny, matchCase)
    }
    catch (err: unknown){
        if (err instanceof FileDoesNotExist) {
            // empty result to allow combining results from multiple servers
            response = []
        } else {
            // other error handling here as needed
            res.status(500).send()
        }
    }
    finally {
        await Promise.all(secondaryPromises)
        logger.trace(`Primary server results: ${response.length}`)
        for(const i in secondaryPromises) {
            const secondaryResult = await secondaryPromises[i]
            logger.trace(`Secondary server ${i} results: ${secondaryResult.length}`)
            response = response.concat(secondaryResult)
        }

        if (response.length == 0) {
            res.status(400).send('No matching files found')
        }

        res.send(response)
    }
})

logRoutes.get('/confirm', async function(_req: express.Request, res: express.Response) {
    const logger = new Logger()
    logger.trace('Confirming existence')
    res.send(true)
})

logRoutes.post('/register/:url', async function(req: express.Request, res: express.Response) {
    const logger = new Logger()
    let { url } = req.params
    url = decodeURIComponent(url)
    logger.trace(`Register secondary server at ${url}`)
    const fetchRequest: Promise<boolean> = fetch(new URL(`${url}/confirm`))
        .then(async (result) => result.ok)
        .catch((err) => {
            return false
        })

        const timeout: Promise<boolean> = new Promise(function(resolve, reject) {
            setTimeout(function() {
                reject(false)
            }, 1000)
        })
        const result = await Promise.race([fetchRequest, timeout])
        if(result){
            secondaryServers.push(url)
            res.send('')
        } else {
            res.status(400).send('Url is not valid, or not responding')
        }
})