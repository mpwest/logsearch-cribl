Instructions
    Build: 'npm run build'
    Run: 'node --env-file=.env dist/index.js'


Enhancements:
    Add security
    Determine usage level, and implement caching if warranted? I assume not, since logs are likely to change more often than retrieving logs.
    Improve logger: instantiate, store log level (different per instance), output to file/store
    Improve imports: allow importing multiple types from containing folder/index file
