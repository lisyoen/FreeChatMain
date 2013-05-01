// server side
var app = require('http').createServer(handler)
    , io = require('socket.io').listen(app)
    , fs = require('fs')
    , exec = require('child_process').exec;

app.listen(8000);

function handler (req, res) {
    res.writeHead(400);
    res.end("Invalid Access");
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
