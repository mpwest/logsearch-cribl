import SearchCriteria from '../util/SearchCriteria'
import fs from 'fs/promises'

class LogSearch {
    async getLogs (filename: string, recordCount: number, searchTerms: string[], searchAny: boolean): Promise<string[]> {
        let fileHandle
        try {
            fileHandle = await fs.open(filename)
            const fileSize = (await fs.stat(filename)).size

            const batchSize = parseInt(process.env.batchSize?.toString() ?? '') || 20000
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