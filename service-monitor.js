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
	req.on('response', responseHandler);
	req.on('error', errorHandler);
	req.end(qs.stringify(service));
}

function on(event, handler) {
	switch(event) {
		case 'response': {
			responseHandler = handler;
			break;
		}
		case 'error': {
			errorHandler = handler;
			break;
		}
		default: {
			break;
		}
	}
}

exports.report = report;
exports.on = on;