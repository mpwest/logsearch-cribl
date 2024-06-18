import { describe, it, before } from 'node:test'
import assert from 'node:assert'
import fs from 'fs'
import LogSearch from '../logs/LogSearch'
import path from 'path'
import Logger from '../logger/Logger'

describe('log search', async () => {
    let logSearch: LogSearch
    let folder: string

    const filename = 'syslog_short.log'
    const badFilename = 'gibberishNonexistentFilename.log'
    const textFirst = 'Text with blue'
    const textSecond = 'Text with red'
    const textBoth = 'Text with blue and red'
    const textNeither = 'Text with yellow'
    const searchTerms: string[] = ['blue', 'red']

    const lastLine = '<15>1 2022-10-17T23:47:54.807241Z habitat2721 alfredRadar.exe 84704 SupremeEpoxyMadonna [Yoga Screen="46962"] Scattering rhino food sources or time-compressing simulator clock'
    const fishLineUpper = '<141>1 2022-10-17T23:47:54.807193Z herbert4616 stateRondo.jar 92987 LotusOliverVertigo [Travel Delphi="double" Parole="44595" Archive="70144" Fish="50033"] Seeding architecture simulation parameters while breeding fauna'
    const fishLineLower = '<144>1 2022-10-17T23:47:54.806847Z amber1740 neuronLazarus.sh 66217 DecideBalletCity [Drama Benefit="38213"] Compressing fish files so increasing magmafacation'

    before(() => {
        logSearch = new LogSearch(new Logger())
        folder = logSearch.getPath()
    })

    it('confirm path is valid', () =>{
        const folderExists = fs.existsSync(folder)
        assert.equal(folderExists, true)
    })

    // findFile
    it('find file with extension', async () => {
        const result = await logSearch.findFile(filename)
        assert.equal(result, path.join(folder, filename))
    })

    it('find file with no extension', async (_t) => {
        const filenameNoExtension = 'syslog_short'
        const result = await logSearch.findFile(filenameNoExtension)
        assert.equal(result, path.join(folder, filename))
    })

    it('file does not exist', async (_t) => {
        const result = await logSearch.findFile(badFilename)
        assert.equal(result, '')
    })

    // filter
    it('filter with no keywords', (_t) => {
        const emptyKeywords: string[] = []
        const result = logSearch.filter(textFirst, emptyKeywords, false, false)
        assert.equal(result, true)
    })

    it('filter with one keyword, case independent, includes term', (_t) => {
        const searchTerms: string[] = ['blue']

        const resultAny = logSearch.filter(textFirst, searchTerms, true, false)
        assert.equal(resultAny, true, 'searchAny = true')

        const resultNotAny = logSearch.filter(textFirst, searchTerms, false, false)
        assert.equal(resultNotAny, true, 'searchAny = false')
    })

    it('filter with one keyword, case independent, does not include term', (_t) => {
        const searchTerms: string[] = ['blue']

        const resultAny = logSearch.filter(textSecond, searchTerms, true, false)
        assert.equal(resultAny, false, 'searchAny = true')

        const resultNotAny = logSearch.filter(textSecond, searchTerms, false, false)
        assert.equal(resultNotAny, false, 'searchAny = false')
    })

    it('filter with multiple keywords, require all, include both', (_t) => {
        const result = logSearch.filter(textBoth, searchTerms, false, false)
        assert.equal(result, true)
    })

    it('filter with multiple keywords, require all, include one', (_t) => {
        const result = logSearch.filter(textFirst, searchTerms, false, false)
        assert.equal(result, false)
    })
        
    it('filter with multiple keywords, require all, include neither', (_t) => {
        const resultNeither = logSearch.filter(textNeither, searchTerms, false, false)
        assert.equal(resultNeither, false)
    })

    it('filter with keywords, require any, include first', (_t) => {
        const result = logSearch.filter(textFirst, searchTerms, true, false)
        assert.equal(result, true)
    })

    it('filter with keywords, require any, include second', (_t) => {
        const result = logSearch.filter(textSecond, searchTerms, true, false)
        assert.equal(result, true)
    })

    it('filter with keywords, require any, include both', (_t) => {
        const resultBoth = logSearch.filter(textBoth, searchTerms, true, false)
        assert.equal(resultBoth, true)
    })

    it('filter with keywords, require any, include neither', (_t) => {
        const resultNeither = logSearch.filter(textNeither, searchTerms, true, false)
        assert.equal(resultNeither, false)
    })

    it('searches file for logs', async (_t) => {
        const response = await logSearch.getLogs(filename, 1, [], false, false)
        assert.equal(response.Results.length, 1)
        assert.equal(response.Results[0].trim(), lastLine)
    })

    // tests on filter() should handle complexities with filter
    it('searches file for logs with simple filter', async (_t) => {
        const response = await logSearch.getLogs(filename, 10, ['fish'], false, false)
        assert.equal(response.Results.length, 2)
        assert.equal(response.Results[0], fishLineUpper)
        assert.equal(response.Results[1], fishLineLower)
    })

    it('throws error on invalid filename', async (_t) => {
        assert.rejects(async () => {
            await logSearch.getLogs(badFilename, 10, [], false, false)
        })
    })
})