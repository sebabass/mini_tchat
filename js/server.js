/* Modules */
var http = require('http');
var scramble = require('./scramble');
var fs = require('fs');

/* SERVER */
var server = http.createServer(function(req, res){
	
});
server.listen(4242);
var io = require('socket.io').listen(server);

/* Variables */
var users = {};
var messages = [];
var limit = 10;

/* SOCKET.IO */
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
		if (scramble.wrdModel && msg.msg === scramble.wrdModel.get('word')) {
			var content;
			msg.username = '<span style="color:red">[Scramble]</span>';
			msg.msg = '<span style="color:red;">@<span> <span style="color:blue">Le mot a été trouver : ['+ scramble.wrdModel.get('word') +'] par <span class="'+ me.sexe +'">'+ me.username +'</span>. </span><span style="color:red;">@<span>';
			scramble.isscramble = false;
			io.sockets.emit('newmsg', msg);
			content = scramble.updateScore(me.username, scramble.wrdModel.get('pts'));
			for (var i = 0; i < scramble.scores.length; i++) {
				content = content.replace(/\n/, '<br />');
			}
			msg.msg = content;
			io.sockets.emit('newmsg', msg);
			scramble.wrdModel = false;
		}
	});

	socket.on('newgame', function(msg) {
		msg.username = '<span style="color:red">[Scramble]</span>';
		if (scramble.isscramble) {
			msg.msg = '<span style="color:red;">@<span> <span style="color:blue">Une partie est déja en cours mot a trouver : ['+ scramble.wrdModel.get('check') +']. </span><span style="color:red;">@<span>';
			socket.emit('newmsg', msg);
		}
		else {
			var rand = Math.floor(Math.random() * scramble.wordTab.length);
			scramble.wrdModel = scramble.wordTab.models[rand];
			var split = scramble.wrdModel.get('word').split('');
			var shuf = scramble.shuffle(split, scramble.wrdModel.get('len'));
			scramble.wrdModel.set('check', shuf);
			scramble.isscramble = true;
			msg.msg = '<span style="color:red;">@<span> <span style="color:blue">Nouvelle Partie de scramble par <span class="'+ me.sexe +'">'+ me.username +'</span> mot a trouver : ['+ scramble.wrdModel.get('check') +'] bonne chance! </span><span style="color:red;">@<span>';
			io.sockets.emit('newmsg', msg);
		}
	});

	socket.on('lookscore', function(msg) {
		var content;
		msg.username = '<span style="color:red">[Scramble]</span>';
		content = scramble.putScore();
		for (var i = 0; i < scramble.scores.length; i++) {
			content = content.replace(/\n/, '<br />');
		}
		msg.msg = content;
		socket.emit('newmsg', msg);
	});
});