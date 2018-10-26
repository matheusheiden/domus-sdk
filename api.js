const Request = require('./request.js')

class Api {
    /**
     * 
     * @param {Credentials} credentials 
     */
    constructor(credentials) {
        this.credentials = credentials
        this.middleware = null
    }

    async init() {
        try {
            await this.credentials.login()
            await this.credentials.setSession()
        }
        catch (err) {
            console.log(err)
        }
    }

    async getProduct(id=null) {
        try {
            let product = new Request.product(this.credentials)
            let productObject = await product.get(id)

            if (this.middleware) {
                productObject = this.middleware.parse('product', 'import', productObject)
            }

            return productObject
        }
        catch (err) {
            console.log(err)
            return false
        }
    }

    async createCustomer(data) {
        
        try {
            if (this.middleware) {
                data = this.middleware.parse('customer', 'export', data)
            }
    
            let customerApi = new Request.person(this.credentials)
            let result = await  customerApi.create(data)
    
            return result
        }
        catch (err) {
            console.log(err)
            return false
        }
    }
    /**
     * 
     * @param {*} id 
     */
    async getInventory(id = null) {
        try {
            let inventoryApi = new Request.inventory(this.credentials)
            
            let result = await inventoryApi.get(id)
            
            if (this.middleware) {
                result = this.middleware.parse('inventory', 'import', result)
            }

            return result
        }
        catch (err) {
            console.log(err)
        }
    }
}

class Credentials {
    constructor(cred) {
        this.username = cred['username']
        this.password = cred['password']
        this.filial = cred['filial']
        this.server = cred['server'],
        this.company_id = cred['company_id']
        this.auth = new Request.auth(this)
    }

    async login() {

        let result = await this.auth.login()

        this.data = result 

        return this
    }

    async setSession() {
        if (!this.data) {
            throw new Error('No session id was defined, did you login?')
        }
        let result = await this.auth.setSessionId(this.company_id)
        
        return result
    }
}

module.exports = {
    api : Api,
    credentials : Credentials 
}