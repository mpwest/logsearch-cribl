class FileDoesNotExist extends Error {
    constructor() {
        super('File cannot be accessed')
    }
}

export = FileDoesNotExist