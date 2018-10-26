'use strict'

const Api = require('./api.js')

class Client {
    constructor(credentials) {
        this.credentials = new Api.credentials(credentials)
        this.api = new Api.api(this.credentials)
    }

    async initialize() {
        await this.api.init()
    }

}

module.exports = Client