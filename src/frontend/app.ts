function addSearchTerm(): void {
    const limit = 10
    const keywords = document.getElementsByClassName('searchTerm')
    const nextId = `keyword${keywords.length}`

    const container = document.getElementById('searchTermList')
    const newSearchTerm = document.createElement('input')
    newSearchTerm.type='text'
    newSearchTerm.className='searchTerm'
    newSearchTerm.id=nextId

    const removeButton = document.createElement('button')
    removeButton.id = `${nextId}remove`
    removeButton.onclick = function(){
        removeSearchTerm(nextId)
    }
    removeButton.textContent = '-'

    const br = document.createElement('br')
    br.id = `${nextId}br`
    if (container) {
        container.appendChild(br)
        container.appendChild(newSearchTerm)
        container.append(removeButton)
    }

    if (keywords.length + 1 >= limit) {
        const addbutton = document.getElementById('addSearchTerm') as HTMLButtonElement
        addbutton.disabled = true
    }
}

function removeSearchTerm(id: string) {
    const textField = document.getElementById(id)
    textField?.remove()
    const removeButton = document.getElementById(`${id}remove`)
    removeButton?.remove()
    const breakLine = document.getElementById(`${id}br`)
    breakLine?.remove()

    const addbutton = document.getElementById('addSearchTerm') as HTMLButtonElement
    addbutton.disabled = false
}

function sendRequest() {
    const baseEndpoint='/logs/'
    const filenameInput = document.getElementById('filename')
    if (!filenameInput) {
        alert('Filename is required')
        return
    }
    const filename = (filenameInput as HTMLInputElement).value
    const searchAny = (document.getElementById('includeAny') as HTMLInputElement).checked.toString()
    const matchCase = (document.getElementById('matchCase') as HTMLInputElement).checked.toString()
    const records = parseInt((document.getElementById('recordCount') as HTMLInputElement).value)

    const params = new URLSearchParams({
        searchAny,
        matchCase,
    })

    if(!Number.isNaN(records) && records != 0) {
        params.append('records', records.toString())
    }

    const inputs = document.getElementsByClassName('searchTerm')
    for (const input in inputs) {
        const term = (inputs[input] as HTMLInputElement).value
        if (term) {
            params.append('keyword', (inputs[input] as HTMLInputElement).value)
        }
    }

    const endpoint = `${baseEndpoint}${filename}?${params}`

    fetch(endpoint).then(function(response) {
        return response.json();
      }).then(function(data) {
        display(data)
      })
}

function display(data: LogStats[]) {
    let container = document.getElementById('results')
    if (container) {
        container.innerHTML = ''
        for(const i in data) {
            const sectionTitle = document.createElement('div')
            sectionTitle.className = 'serverName'
            const sectionText = document.createTextNode(`${data[i].Source}: ${data[i].Count} records`)
            sectionTitle.appendChild(sectionText)
            container.appendChild(sectionTitle)

            let bg = true
            for(const line in data[i].Results) {
                const element = document.createElement('div')
                element.className = bg ? 'oddLine' : 'evenLine'
                const text = document.createTextNode(data[i].Results[line])
                element.appendChild(text)
                container.appendChild(element)
                bg = !bg
            }
        }
    }
}

function setListeners() {
    const addButton = document.getElementById('addSearchTerm')
    if (addButton) {
        addButton.addEventListener('click', addSearchTerm)
    }

    const sendButton = document.getElementById('sendRequest')
    if (sendButton) {
        sendButton.addEventListener('click', sendRequest)
    }
}

var tid = setInterval( function () {
    if (document.readyState !== 'complete') {
        return
    }
    clearInterval(tid)
    setListeners()
}, 100 )

interface LogStats {
    Source: string
    Count: number
    Results: string[]
}