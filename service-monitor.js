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
function report(service) {
	var options = {
		host: 'localhost',
		port: 8000,
		path: '/createService',
		method: 'POST'
	};
	
	var req = http.request(options, function(res) {
		var data = '';
		res.on('data', function(chunk) {
			data += chunk;
		});
		res.on('end', function() {
			console.log(data);
		});
	});
	
	this.on = function(event, handler) {
		switch(event) {
			case 'response': {
				req.on('response', handler);
				break;
			}
			case 'error': {
				req.on('error', handler);
				break;
			}
			default: {
				break;
			}
		}
	}
	
	req.end(qs.stringify(service));
}

exports.report = report;
