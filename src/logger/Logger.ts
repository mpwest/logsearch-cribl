class Logger
{
    static defaultLogLevel = 0

    static error(message: string) {
        this.log(message)
    }

    static warn(message: string) {
        if (this.getLogLevel() <= LogLevel.warning) {
            this.log(message)
        }
    }

    static info(message: string) {
        if (this.getLogLevel() <= LogLevel.info) {
            this.log(message)
        }
    } 

    static debug(message: string) {
        if (this.getLogLevel() <= LogLevel.debug) {
            this.log(message)
        }
    }
    
    static trace(message: string) {
        if (this.getLogLevel() <= LogLevel.trace) {
            this.log(message)
        }
    } 

    static log(message: string) {
        console.log(message)
    }

    static getLogLevel(): number {
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