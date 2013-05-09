// server side
var app = require('http').createServer(handler)
    , io = require('socket.io').listen(app)
	, util = require('util')
    , fs = require('fs')
    , exec = require('child_process').exec
    , qs = require('querystring');

app.listen(8000);

function service(id, name, desc, url, count) {
	this.id = id;
	this.name = name;
	this.desc = desc;
	this.url = url;
	this.count = count;
}

function serviceManager(defaultLife) {
	var services = {};
	var size = 0;
	var checkInterval = 1000;
	
	var onlineHandlers = [];
	var offlineHandlers = [];
	
	// service control methods
	this.getService = function(id) {
		return services[id];
	};
	
	this.getServices = function() {
		return services;
	};
	
	this.setService = function(id, service) {
		size++;
		console.log('setService');
		console.log(service);
		if (!service.life) {
			service.life = defaultLife;
		}
		if (!services[id]) {
			services[id] = service;
			for (var h in onlineHandlers) {
				onlineHandlers[h].apply(this, service);
			}
		}
		else {
			services[id] = service;
		}
		return service;
	};
	
	this.removeService = function(id) {
		if (services[id]) {
			size--;
		}
		return delete services[id];
	};
	
	this.clearService = function() {
		size = 0;
		services = {};
	};
	
	this.forEach = function(callback) {
		for (var i in services) {
			callback.call(this, services[i]);
		}
	};
	
	var that = this;
	setInterval(function() {
		for (var id in services) {
			var svc = services[id];
			if (--svc.life <= 0) {
				for (var h in offlineHandlers) {
					offlineHandlers[h].apply(that, svc);
				}
				that.removeService(id);
			}
		}
	}, checkInterval);
	
	this.size = function() {
		return size;
	};
	
	this.on = function(event, handler) {
		switch(event) {
			case 'add':
			case 'online': {
				onlineHandlers.push(handler);
				break;
			}
			case 'remove':
			case 'offline': {
				offlineHandlers.push(handler);
				break;
			}
			default: {
				break;
			}
		}
	};
}

var sm = new serviceManager(10);

function refresh() {
	io.sockets.emit('services', sm.getServices());
	console.log('refresh');
	console.log(sm.getServices());
}

sm.on('online', function(service) {
	console.log('online');
	console.log(service);
	refresh();
});

sm.on('offline', function(service) {
	console.log('offline');
	console.log(service);
	refresh();
});

function handler (req, res) {
	console.log(req.url);
	switch (req.url)
	{
		case '/createService': {
			if (req.method !== 'POST') {
				res.writeHead(400);
				res.end('Bad Request');
				return;
			}
			var data = '';
			req.setEncoding('utf8');
			req.on('data', function(chunk) {
				data += chunk;
			});
			
			req.on('end', function() {
				var q = qs.parse(data);
				if (q.id && q.name) {
					sm.setService(q.id, new service(q.id, q.name, q.desc, q.url, q.count));
					res.writeHead(200);
					res.end('Ok');
				}
				else {
					res.writeHead(400);
					res.end('Bad Request');
				}
			});
			break;
		}
		default: {
			res.writeHead(400);
			res.end('Bad Request');
			break;
		}
	}
}

io.sockets.on('connection', function (socket) {
	function echo_exec(cmd, callback) {
		exec(cmd, function(err, stdout, stderr) {
			if (err) {
				console.log(stderr + '\nError:' + err.code, err.code);
			} else {
				console.log(stdout);
			}
			socket.emit('system report', {err: err, stdout: stdout, stderr: stderr});

			callback(arguments);
		});
	}

	socket.on('git pull', function (data) {
		console.log('git pull');
		echo_exec('git pull', function() {});
	});

	socket.on('restart', function (data) {
		console.log('restart');
		echo_exec('forever restart chat.js', function() {});
	});
});
