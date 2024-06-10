import fs from 'fs/promises'
import { EOL } from 'os'

class Logger
{
    location: string
    logLevel: number
    defaultLogLevel = 0

    constructor(){
        this.location = process.env.Output ?? ''
        this.logLevel = this.getLogLevel()
    }

    error(message: string) {
        this.log(message)
    }

    warn(message: string) {
        if (this.logLevel <= LogLevel.warning) {
            this.log(message)
        }
    }

    info(message: string) {
        if (this.logLevel <= LogLevel.info) {
            this.log(message)
        }
    } 

    debug(message: string) {
        if (this.logLevel <= LogLevel.debug) {
            this.log(message)
        }
    }
    
    trace(message: string) {
        if (this.logLevel <= LogLevel.trace) {
            this.log(message)
        }
    } 

    log(message: string) {
        if(this.location == '') {
            console.log(message)
        } else {
            message = message.concat(EOL)
            fs.appendFile(this.location, message)
        }
    }

    getLogLevel(): number {
        return parseInt(process.env.LogLevel || '') ?? this.defaultLogLevel
    }
}

enum LogLevel {
    error = 4,
    warning = 3,
    info = 2,
    debug = 1,
    trace = 0
}

export = Logger