import fs from 'fs/promises'
import path from 'path'
import Logger from '../logger/Logger'
import FileDoesNotExist from '../error/FileDoesNotExist'

class LogSearch {
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

    async getLogs (filename: string, recordCount: number, searchTerms: string[], searchAny: boolean): Promise<string[]> {
        let fileHandle
        try {
            let filePath = await this.findFile(filename)
            Logger.trace(`Found file ${filePath}`)
            fileHandle = await fs.open(filePath)
            const fileSize = (await fs.stat(filePath)).size

            const batchSize = parseInt(process.env.BatchSize?.toString() ?? '') || 20000
            let offset = Math.max(0, fileSize - batchSize)

            let entries: string[] = []
            let blockStart = ''
            while (entries.length < recordCount)
            {
                let batch = await fileHandle.read(Buffer.alloc(batchSize), offset, batchSize) + blockStart
                const lines = batch.split(/[\r\n]+/)
                blockStart = lines[0]

                lines.shift()
                lines.forEach((line) => {
                    if(this.filter(line, searchTerms, searchAny)) {
                        entries.push(line)
                    }
                })

                if (offset === 0) break
                offset = Math.min(0, offset - batchSize)
            }
            return entries
        }
        finally
        {
            if(fileHandle) {
                await fileHandle.close()
            }
        }
    }
    private async findFile(filename: string): Promise<string> {
        const folder = this.getPath()
        const files = await fs.readdir(folder)
        Logger.trace(`findFile input: ${filename}`)

        let fileName = ''
        files.forEach((file) => {
            Logger.trace(`Check if ${file} matches input (${path.parse(file).name} or ${path.basename(file)})`)
            if(path.parse(file).name === filename || path.basename(file) === filename) {
                fileName = file
            }
        })
        if (fileName) {
            return fileName
        }
        throw new FileDoesNotExist()
    }

    private filter(line: string, searchTerms: string[], searchAny: boolean): boolean {
        if (!searchTerms) {
            return true
        }
        searchTerms.forEach((keyword) => {
            if(!line.search(keyword)) {
                if(!searchAny)
                return false
            }
            else if (searchAny) {
                return true
            }
        })
        return !searchAny
    }
}

export = LogSearch