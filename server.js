// server side
var app = require('http').createServer(handler)
    , io = require('socket.io').listen(app)
    , fs = require('fs')
    , exec = require('child_process').exec;

app.listen(8000);

function service(id, name, desc, count) {
	this.id = id;
	this.name = name;
	this.desc = desc;
	this.count = count;
}

function serviceGroup(id, name) {
	this.id = id;
	this.name = name;
	var services = {};
	var size = 0;
	
	// service control methods
	this.getService = function(id) {
		return services[id];
	};
	
	this.setService = function(id, service) {
		size++;
		return services[id] = service;
	};
	
	this.removeService = function(id) {
		size--;
		return delete services[id];
	};
	
	this.clearService = function() {
		size = 0;
		services = {};
	};
	
	this.forEach = function(cb) {
		for (var i in services) {
			cb.call(this, services[i]);
		}
	};
}

var sg = new serviceGroup('chat', 'Chatting');

function handler (req, res) {
	console.log(req.url);
	switch (req.url)
	{
	case '/createService':
	{
		if (req.method !== 'POST') {
			res.writeHead(400);
			res.end('Bad Request');
			return;
		}
		req.setEncoding('utf8');
		req.on('data', function(data) {
			
			console.log(data);
		});
	}
	default:
	{
		res.writeHead(400);
		res.end('Bad Request');
	}
	break;
	}
}

io.sockets.on('connection', function (socket) {
	socket.on('report', function (data) {
		console.log('request report');
		socket.emit('my_report', {users: 10, rooms: 3});
	});

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
