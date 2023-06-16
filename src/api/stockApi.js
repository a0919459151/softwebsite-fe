import axios from "axios";
import envConfig from '../../env.config.js';

const env = import.meta.env.VITE_NODE_ENV
const apiUrlSpider = envConfig[env].apiUrl

const instence = axios.create({
    baseURL: apiUrlSpider,
    timeout: 10000,
});

const StockApi = {

    getStocks: async (stockSymbol) => {
        const response = await instence.get(`stockData/${stockSymbol}`)
        return response.data
    },

    getOneBystockName: async (stockName) => {
        const response = await instence.get(`getOneBystockName/${stockName}`)
        return response.data
    },

    getOneBystockSymbol: async (stockSymbol) => {
        const response = await instence.get(`getOneBystockSymbol/${stockSymbol}`)
        return response.data
    }
}

export default StockApi
