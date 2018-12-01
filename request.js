const rp = require('request-promise')

const qs = require('querystring')

class Request {
    constructor(credentials) {
        this.credentials = credentials
        this.request_path = ''
        this.extra_path = ''
    }

    async executeRequest(requestType, body, params = null, headers = null) {
        let url = this.credentials['server'] + this.request_path + this.extra_path
        if (params) {
            url = url + '?' + qs.stringify(params)
        }
        let config = {
            uri : url,
            method : requestType,
            timeout : 900000,
            json : true,
            headers : headers,
        }
        //verify if body is defined before setting it
        if (body) { // if this isn't done content-length can be set errouneously
            config['body'] = body;
        }
        let result = await rp(config)

        this.extra_path = ''
        return result
    }

    
    async get(id = null) {
        if (id) {
            this.extra_path = '/' + id
        }
        
        return await this.executeRequest('GET', null, null, this.credentials_headers)
    }

    
    async create(data) { 
        return await this.executeRequest('POST', data, null, this.credentials_headers)
    }


    get credentials_headers () {
        return {
            'Cache-Control': 'no-cache',
            'X-Session-ID' : this.credentials.data.token
        }
    }
}
/**
 * 
 */
class Order extends Request {
    constructor(credentials) {
        super(credentials)
        this.request_path = '/pedidovenda-rest/pedidos'
    }


    async cancelOrder(id) {
        if (!id) {
            throw new Error('No order to cancel')
        }

        this.extra_path = '/'+id+'/cancelar'

        return await this.executeRequest('POST', null, null, this.credentials_headers)
    }

    async invoiceOrder(id) {
        if (!id) {
            throw new Error('No order to cancel')
        }

        this.extra_path = '/'+id+'/efetivar'
        
        return await this.executeRequest('POST', null, null, this.credentials_headers)
    }

    async cancelInvoiceOrder(id) {
        if (!id) {
            throw new Error('No order to cancel')
        }

        this.extra_path = '/'+id+'/efetivar'
        
        return await this.executeRequest('DELETE', null, null, this.credentials_headers)
    }
    
}
/**
 * Authentication request representation
 */
class Auth extends Request {
    constructor(credentials) {
        super(credentials)
        this.request_path = '/pedidovenda-rest/auth'
    }

    async login() {
        return await this.executeRequest('post', 
            {
                login : this.credentials.username,
                password : this.credentials.password
            }
        )
    }

    async setSessionId(companyId) {
        return await this.executeRequest('PUT', {
            id : companyId
        }, null, this.credentials_headers)
    }
}
/**
 * 
 */
class Product extends Request {
    constructor(credentials) {
        super(credentials)
        this.request_path = '/operacional/produtos'
    }
    /**
     * Returns product's image
     * @param {*} idProduct 
     * @param {*} nrItem 
     */
    async getImage(idProduct, nrItem = 0) {
        if (idProduct == null) {
            throw new Error('Product id is required')
        }
        this.extra_path = '/'+idProduct+'/fotos'

        return await this.executeRequest('GET', null, {nrItem : nrItem}, this.credentials_headers)
    }   

}
/**
 * 
 */
class Person extends Request {
    constructor(credentials) {
        super(credentials)
        this.request_path = '/pedidovenda-rest/pessoas'
    }

}

/**
 * 
 */
class Inventory extends Request {
    constructor(credentials) {
        super(credentials)
        this.request_path = '/pedidovenda-rest/produtos'
    }

    async get(priceTable, id = null) {
        if (id) {
            this.extra_path = '/' + id
        }
        
        return await this.executeRequest('GET', null, {tabelapreco : priceTable}, this.credentials_headers)
    }
}

class Feed extends Request {
    constructor(credentials) {
        super(credentials)
        this.request_path = '/operacional/consultasql/CONSULTA_FEED'
    }

    async get() {
        return await this.executeRequest('GET', null, null, this.credentials_headers)
    }

    async read (feedId) {
        if (!feedId) {
            throw new Error('Invalid feed id')
        }
        this.extra_path = '/' + feedId

        return await this.executeRequest('PUT', null, null, this.credentials_headers)
    }
}
class Address extends Request {
    constructor(credentials) {
        super(credentials)
        this.request_path = '/operacional/enderecos'
    }

    async get(query) {
        return await this.executeRequest('GET', null, query, this.credentials_headers)
    }
}


module.exports = {
    order : Order,
    auth: Auth,
    product : Product,
    person : Person,
    inventory : Inventory,
    feed : Feed,
    address : Address
}
