import fs from 'fs/promises'
import { EOL } from 'os'

class Logger
{
    location: string
    logLevel: number
    defaultLogLevel = 0
    application: string

    constructor(){
        this.location = process.env.Output ?? ''
        this.logLevel = this.getLogLevel()
        this.application = process.env.Port ?? ''
    }

    error(message: string): boolean {
        this.log(message)
        return true
    }

    warn(message: string): boolean {
        if (this.logLevel <= LogLevel.warning) {
            this.log(message)
            return true
        }
        return false
    }

    info(message: string): boolean {
        if (this.logLevel <= LogLevel.info) {
            this.log(message)
            return true
        }
        return false
    } 

    debug(message: string): boolean {
        if (this.logLevel <= LogLevel.debug) {
            this.log(message)
            return true
        }
        return false
    }
    
    trace(message: string): boolean {
        if (this.logLevel <= LogLevel.trace) {
            this.log(message)
            return true
        }
        return false
    } 

    log(message: string) {
        message = this.application == '' ? message : `${message} (${this.application})`
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