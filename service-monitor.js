var http = require('http'),
	qs = require('querystring');

/* 
typedef service {
	id,
	name,
	desc,
	url,
	count
}
typedef callback function(response);
*/
var req;
var responseHandler, errorHandler;

function report(service, response, error) {
	var options = {
		host: 'localhost',
		port: 8000,
		path: '/createService',
		method: 'POST'
	};
	
	req = http.request(options, function(res) {
		var data = '';
		res.on('data', function(chunk) {
			data += chunk;
		});
		res.on('end', function() {
			console.log(data);
		});
	});
	if (responseHandler) req.on('response', responseHandler);
	if (errorHandler) req.on('error', errorHandler);
	req.end(qs.stringify(service));
}

function on(event, handler) {
	switch(event) {
		case 'response': {
			responseHandler = handler;
			if (req) req.on('response', responseHandler);
			break;
		}
		case 'error': {
			errorHandler = handler;
			if (req) req.on('error', errorHandler);
			break;
		}
		default: {
			break;
		}
	}
}

exports.report = report;
exports.on = on;
