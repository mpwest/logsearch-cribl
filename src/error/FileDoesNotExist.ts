class FileDoesNotExist extends Error {
    constructor() {
        super('File cannot be accessed')
    }
}

export default FileDoesNotExist