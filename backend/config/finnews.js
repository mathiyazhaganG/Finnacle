const finnhub = require('finnhub');

const api_key = finnhub.ApiClient.instance.authentications['api_key'];
api_key.apiKey = "d08scmpr01qju5m8f0kgd08scmpr01qju5m8f0l0"
const finnhubClient = new finnhub.DefaultApi()

finnhubClient.companyNews("AAPL", "2025-01-01", "2025-05-01", (error, data, response) => {
	console.log(data)
});
finnhubClient.marketNews("general", {}, (error, data, response) => {
	console.log(data)});
	
	