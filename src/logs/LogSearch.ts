import fs from 'fs/promises'
import path from 'path'
import Logger from '../logger/Logger'
import FileDoesNotExist from '../error/FileDoesNotExist'
import LogStats from './LogStats'

class LogSearch {
    logger: Logger

    constructor(logger: Logger) {
        this.logger = logger
    }
    getPath(): string {
        var configPath = process.env.LogPath
        if (configPath !== undefined) {
            return configPath
        }

        const platform = process.platform
        
        switch(platform) {
            case 'win32':
                return 'C:\\WINDOWS\\system32\\config\\'
            // Other platforms as needed
            default:
                return '/var/log'
        }
    }

    async getLogs (filename: string, recordCount: number, searchTerms: string[], searchAny: boolean, matchCase: boolean): Promise<LogStats> {
        this.logger.trace('getLogs')
        let fileHandle
        try {
            let filePath = await this.findFile(filename)
            if (filePath == '') {
                this.logger.trace('file does not exist')
                throw new FileDoesNotExist()
            }
            this.logger.trace(`Filepath: ${filePath}`)
            const fileSize = (await fs.stat(filePath)).size
            this.logger.trace(`fileSize: ${fileSize}`)

            fileHandle = await fs.open(filePath)
            let batchSize = Math.min(parseInt(process.env.BatchSize?.toString() ?? '20000'), fileSize)
            let readStart = fileSize - batchSize
            let blockStart = '' // end of an incomplete line read in. Ignore during first iteration, append to what's read subsequently

            let entries: string[] = []

            while (entries.length < recordCount)
            {
                this.logger.trace(`Batch size: ${batchSize}, start at: ${readStart}, recordCount: ${recordCount}, found: ${entries.length}`)
                const readResult = await fileHandle.read(Buffer.alloc(batchSize), 0, batchSize, readStart)
                const batch = readResult.buffer.toString() + blockStart

                const lines = batch.split(/[\r\n]+/)
                blockStart = lines[0]
                this.logger.trace(`blockStart: ${blockStart}`)

                // ignore first line, assuming it's a partial line, unless line spans multiple chunks, or beginning of file reached
                if (readStart > 0 && lines.length > 1) {
                    lines.shift()
                }
                for(let i = lines.length - 1; i >=0; i--) {
                    // May wish to filter out whitespace, but seems not worth the processing, given the record source rarely includes non-empty whitespace lines
                    if(entries.length < recordCount && lines[i].length > 0 && this.filter(lines[i], searchTerms, searchAny, matchCase)) {
                        if (entries.length < 2) {
                            this.logger.debug(`Found line: ${lines[i]}`)
                        } else if (entries.length == 2) {
                            this.logger.debug('Additional output not shown') || this.logger.trace(`Found line: ${lines[i]}`)
                        } else {
                            this.logger.trace(`Found line: ${lines[i]}`)
                        }
                        entries.push(lines[i])
                    }
                }

                if (readStart === 0)
                {
                    this.logger.trace('reached beginning of file')
                    break
                }
                if (readStart < batchSize)
                {
                    batchSize = readStart
                    readStart = 0
                } else {
                    readStart -= batchSize
                }
            }
            return {
                Source: process.env.ServerName || 'Unknown Server',
                Count: entries.length,
                Results: entries
            }
        }
        finally
        {
            if(fileHandle) {
                await fileHandle.close()
            }
        }
    }

    async findFile(filename: string): Promise<string> {
        const folder = this.getPath()
        this.logger.trace(folder)
        const files = await fs.readdir(folder)
        this.logger.trace(`findFile input: ${filename}`)

        let fileName = ''
        files.forEach((file) => {
            this.logger.trace(`Check if ${file} matches input (${path.parse(file).name} or ${path.basename(file)})`)
            if(path.parse(file).name === filename || path.basename(file) === filename) {
                fileName = file
            }
        })
        if (fileName != '') {
            return path.join(folder, fileName)
        }
        this.logger.trace(`${filename} not found`)
        // Returning empty string allows using this function in other scenarios where it may not require the file to exist, without handling errors as part of program flow
        return ''
    }

    filter(line: string, searchTerms: string[], searchAny: boolean, matchCase: boolean): boolean {
        if (!searchTerms || searchTerms.length == 0) {
            this.logger.trace('No search terms')
            return true
        }
        const lineSearch = matchCase ? line : line.toLowerCase()
        this.logger.trace(searchTerms.toString())
        for (let i = 0; i < searchTerms.length; i++){
            let found = lineSearch.search(matchCase ? searchTerms[i] :searchTerms[i].toLowerCase())
            this.logger.trace(`Searching ${searchTerms[i]} in ${line}: ${found} (SearchAny: ${searchAny})`)
            if(found == -1) {
                if(!searchAny) {
                    return false
                }
            }
            else if (searchAny) {
                return true
            }
        }
        return !searchAny
    }
}

export default LogSearch