/* Modules */
var http = require('http');
var scramble = require('./scramble');

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
		msg.msg.trim();
		messages.push(msg);
		if (messages.length > limit) {
			messages.shift();
		}
		io.sockets.emit('newmsg', msg);
		if (scramble.wrdModel && msg.msg.length === scramble.wrdModel.get('len') && msg.msg.toLowerCase() === scramble.wrdModel.get('word')) {
			var content;
			clearTimeout(scramble.timer);
			msg.username = scramble.username;
			msg.msg = scramble.dialog('Le mot a été trouver : ['+ scramble.wrdModel.get('word') +'] par <span class="'+ me.sexe +'">'+ me.username +'</span>.');
			scramble.isscramble = false;
			io.sockets.emit('newmsg', msg);
			content = scramble.updateScore(me.username, scramble.wrdModel.get('pts'));
			for (var i = 0; i < scramble.scores.length; i++) {
				content = content.replace(/\n/, '<br />');
			}
			msg.msg = scramble.dialog('<br />'+ content);
			io.sockets.emit('newmsg', msg);
			scramble.wrdModel = false;
		}
	});

	socket.on('newgame', function(msg) {
		msg.username = scramble.username;
		if (scramble.isscramble) {
			msg.msg = scramble.dialog('Une partie est déja en cours mot a trouver : ['+ scramble.wrdModel.get('check') +'].');
			socket.emit('newmsg', msg);
		}
		else {
			var rand = Math.floor(Math.random() * scramble.wordTab.length);
			scramble.wrdModel = scramble.wordTab.models[rand];
			var split = scramble.wrdModel.get('word').split('');
			var shuf = scramble.shuffle(split, scramble.wrdModel.get('len'));
			scramble.wrdModel.set('check', shuf);
			scramble.isscramble = true;
			msg.msg = scramble.dialog('Nouvelle Partie de scramble par <span class="'+ me.sexe +'">'+ me.username +'</span> mot a trouver : ['+ scramble.wrdModel.get('check') +'] bonne chance!');
			io.sockets.emit('newmsg', msg);
			scramble.timer = setTimeout(function() {
				msg.msg = scramble.dialog('Partie terminée, dommage, la bonne réponse était : ['+ scramble.wrdModel.get('word') +'].');
				io.sockets.emit('newmsg', msg);
				scramble.isscramble = false;
				scramble.wrdModel = false;
			}, scramble.times);
		}
	});

	socket.on('lookscore', function(msg) {
		var content;
		msg.username = scramble.username;
		content = scramble.putScore();
		for (var i = 0; i < scramble.scores.length; i++) {
			content = content.replace(/\n/, '<br />');
		}
		msg.msg = content;
		socket.emit('newmsg', msg);
	});
});