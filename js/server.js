var http = require('http');

var server = http.createServer(function(req, res){
	
});
server.listen(4242);

var io = require('socket.io').listen(server);
var users = {};
var messages = [];
var limit = 10;

io.sockets.on('connection', function(socket){
	console.log('Nouveau utilisateur');
	var me = false;

	for (var k in users) {
		socket.emit('nwusr', users[k]);
	}

	for (var k in messages) {
		socket.emit('newmsg', messages[k]);
	}

	socket.on('login', function(user){
		var exist = false;
		for (var k in users) {
			if (users[k].username === user.username || users[k].email === user.email) {
				socket.emit('errorform');
				exist = true;
			}
		}
		if (exist === false) {
			me = user;
			me.id = user.username;
			users[me.id] = me;
			socket.emit('logged');
			io.sockets.emit('nwusr', me);
		}
	});

	socket.on('disconnect', function() {
		if (me) {
			delete users[me.id];
			io.sockets.emit('delusr', me);
		}
	})

	socket.on('newmsg', function(msg) {
		msg.username = me.username;
		msg.sexe = me.sexe;
		messages.push(msg);
		if (messages.length > limit) {
			messages.shift();
		}
		io.sockets.emit('newmsg', msg);
	});
});