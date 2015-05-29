var http = require('http'); // Module http

// On cree le seveur
var server = http.createServer(function(req, res){
	
});
server.listen(4242); // Ecoute le port 4242

// Module socket.io
var io = require('socket.io').listen(server);
var users = {};

io.sockets.on('connection', function(socket){
	console.log('Nouveau utilisateur');
	var me = false;

	for (var k in users) {
		socket.emit('nwusr', users[k]);
	}

	// Check si l'utilisateur existe déja sinon l'ajoute a la liste.
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
		io.sockets.emit('newmsg', msg);
	});
});