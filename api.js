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
                productObject = this.middleware.parse('product', 'import', productObject)
            }

            return productObject
        }
        catch (err) {
            throw this.prepareException(err)
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
            
            let result = await inventoryApi.get(id)
            
            if (this.middleware) {
                result = this.middleware.parse('inventory', 'import', result)
            }

            return result
        }
        catch (err) {
            throw this.prepareException(err)
        }
    }

    async createOrder(order) {
        try {
            if (this.middleware) {
                order = this.middleware.parse('order', 'export', order)
            }
    
            let result = await Request.order.create(order)

            return result
        }
        catch (err) {
            throw this.prepareException(err)
        }
    }

    async invoiceOrder(orderId) {
        try {
            let result = await Request.order.invoiceOrder(orderId)
            return result
        }
        catch (err) {
            throw this.prepareException(err)
        }
    }

    async invoiceOrder(orderId) {
        try {
            let result = await Request.order.cancelOrder(orderId)
            return result
        }
        catch (err) {
            throw this.prepareException(err)
        }
    }

    async cancelInvoiceOrder(orderId) {
        try {
            let result = await Request.order.invoiceOrder(orderId)
            return result
        }
        catch (err) {
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