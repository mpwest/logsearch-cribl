Instructions

	Build: 'npm run build'
	Configure in .env, if defaults need to change
		Port = 8080
		BatchSize = 50000 (bytes read from file each loop)
		DefaultRecordCount = 100 (lines returned to client)
		LogLevel = 2 (Info)
		LogPath = var\log
		Output = (default not present, write to console; set to output location to write application logs to file)
	Run: npm run start (= 'node --env-file=.env dist/index.js')
	
    GET /logs/:filename
        where filename can include file extension or not
        Query params:
            records (override DefaultRecordCount)
            keyword (search terms, can include multiple)
            searchAny (if true: include lines with at least one keyword, if false: all keywords must match; default false)
            matchCase (set keyword matching to be case sensitive; default false)

Enhancements:

	Add security
	Improve input checks, and error handling
	Determine usage level, and implement caching if warranted?
 		I assume not, since logs are likely to change more often than retrieving logs
	Improve imports: allow importing multiple types from containing folder/index file,
 		ex consolidate multiple error types into one export
	Change structure of response to include array of results and statistics
		ex:
			[
				{
					Results:
					[
						"<64>1 2024-06-18T10:28:17.453204Z rumble9801 lagoonFrame.txt 45786 CarpoolFracturePivot ..."
						...
					],
					Stats:
					{
						Source: "PrimaryServerName",
						Count: 138
					}
				},
				{
					Results:
					[],
					Stats:
					{
						Source: "SecondaryServer1Name",
						Count: 0
					}
				},
				...
			]
