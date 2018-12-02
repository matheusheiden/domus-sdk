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

    prepareException(err) {
        return {
            'statusCode' : err.statusCode,
            'error' : err.error,
            'options' : err.options
        }
    }

    async init() {
        try {
            await this.credentials.login()
            await this.credentials.setSession()
        }
        catch (err) {
            throw this.prepareException(err)
        }
    }

    async getProduct(id=null) {
        try {
            let product = new Request.product(this.credentials)
            let productObject = await product.get(id)

            if (this.middleware) {
                productObject = await this.middleware.parse('product', 'import', productObject)
            }

            return productObject
        }
        catch (err) {
            throw this.prepareException(err)
        }
    }
    /**
     * 
     * @param {*} id 
     */
    async getOrder(id = null) {
        try {
            let orderApi = new Request.order(this.credentials)
            
            let result = await orderApi.get(id)
            
            if (this.middleware) {
                result = await this.middleware.parse('order', 'import', result)
            }

            return result
        }
        catch (err) {
            throw this.prepareException(err)
        }
    }
    async createCustomer(data) {
        
        try {
            if (this.middleware) {
                data = await this.middleware.parse('customer', 'export', data)
            }
    
            let customerApi = new Request.person(this.credentials)
            let result = await  customerApi.create(data)
    
            return result
        }
        catch (err) {
            throw this.prepareException(err)
        }
    }
    /**
     * 
     * @param {*} id 
     */
    async getInventory(id = null) {
        try {
            let inventoryApi = new Request.inventory(this.credentials)
            
            let result = await inventoryApi.get(this.credentials.inventory_id, id)
            
            if (this.middleware) {
                result = await this.middleware.parse('inventory', 'import', result)
            }

            return result
        }
        catch (err) {
            throw this.prepareException(err)
        }
    }
    async getCustomer(id = null) {
        try {
            let customerApi = new Request.person(this.credentials)
            
            let result = await customerApi.get(id)
            
            if (this.middleware) {
                result = await this.middleware.parse('customer', 'import', result)
            }

            return result
        }
        catch (err) {
            console.log(err)
            throw this.prepareException(err)
        }
    }
    async createOrder(order) {
        try {
            if (this.middleware) {
                order = await this.middleware.parse('order', 'export', order)
            }
            let orderManager = new Request.order(this.credentials)
            let result = await orderManager.create(order)

            return result
        }
        catch (err) {
            throw this.prepareException(err)
        }
    }

    async invoiceOrder(orderId) {
        try {
            let orderManager = new Request.order(this.credentials)
            let result = await orderManager.invoiceOrder(orderId)
            return result
        }
        catch (err) {
            throw this.prepareException(err)
        }
    }

    async invoiceOrder(orderId) {
        try {
            let orderManager = new Request.order(this.credentials)
            let result = await orderManager.cancelOrder(orderId)
            return result
        }
        catch (err) {
            throw this.prepareException(err)
        }
    }

    async cancelInvoiceOrder(orderId) {
        try {
            let orderManager = new Request.order(this.credentials)
            let result = await orderManager.invoiceOrder(orderId)
            return result
        }
        catch (err) {
            throw this.prepareException(err)
        }
    }

    async getFeed() {
        try {
            let feedManager = new Request.feed(this.credentials)
            let result = await feedManager.get()
            return result
        }
        catch (err) {
            throw this.prepareException(err)
        }
    }

    async markFeedAsRead(feedId) {
        try {
            let feedManager = new Request.feed(this.credentials)
            let result = await feedManager.read(feedId)
            return result
        }
        catch (err) {
            throw this.prepareException(err)
        }
    }

    async getAddress(query) {
        try {
            let addressManager = new Request.address(this.credentials)
            return await addressManager.get(query)
        }
        catch (err) {
            throw this.prepareException(err)
        }
    }

    async getCustomerByDocument(document) {
        try {
            let customerManager = new Request.customer(this.credentials)
            return await customerManager.getByDocument(document)
        }
        catch(err) {
            throw this.prepareException(err)
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
        this.inventory_id = cred['inventory_id'];
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
