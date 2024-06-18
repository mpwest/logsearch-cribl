function sleep(seconds: number): Promise<void> {
    return new Promise((res) => setTimeout(res, seconds*1000))
}

export = sleep