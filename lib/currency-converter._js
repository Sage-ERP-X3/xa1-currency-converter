"use strict";

var httpClient = require('syracuse-httpclient');
var jsxml = require('jsxml');

function requestXml(fromCurrency, toCurrency) {
	return jsxml.stringify({
		"soap:Envelope": {
			$: {
				"xmlns:soap": "http://www.w3.org/2003/05/soap-envelope",
				"xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
				"xmlns:xsd": "http://www.w3.org/2001/XMLSchema",
				"xmlns": "http://www.webserviceX.NET/",
			},
			"soap:Body": {
				ConversionRate: {
					FromCurrency: fromCurrency,
					ToCurrency: toCurrency,
				}
			}
		}
	});
}

exports.conversionRate = function(_, fromCurrency, toCurrency) {
	var reqXml = requestXml(fromCurrency, toCurrency);
	var response = httpClient.httpRequest(_, {
		url: 'http://www.webservicex.net/CurrencyConvertor.asmx',
		method: 'POST',
		headers: {
			'content-type': 'application/soap+xml; charset=utf-8',
			'content-length': reqXml.length,
		}
	}).write(_, reqXml, 'utf8').end().response(_);
	if (response.statusCode !== 200) throw new Error("service request failed, statusCode=" + response.statusCode);
	var resp = jsxml.parse(response.readAll(_));
	var body = resp['soap:Envelope']['soap:Body'];
	return body.ConversionRateResponse.ConversionRateResult;
}