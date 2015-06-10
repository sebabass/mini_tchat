var http = require('http');
var	Backbone = require('backbone');
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
var isscramble = false;
var wrdModel = false;
var wordTab = false;

/* Backbone et fs(gestion de fichier) */
var Word = Backbone.Model.extend({

	initialize : function(data, options) {
		this.word = data.word,
		this.check = data.check,
		this.len = data.len,
		this.pts = data.pts
	}
});

var WordList = Backbone.Collection.extend({
	model : Word
});

fs.exists('../mot.txt', function(doesExist) {
	var split;
	if (doesExist) {
		fs.readFile('../mot.txt', function(error, content) {
			if (error) {
				console.error(error);
				return;
			}
			wordTab = new WordList();
			wordTab.on('add', function(w){
				console.log('ajout du mot : ' + w.get('word') + ' a la collection');
			});
			content = content.toString();
			split = content.split('\n');
			for(var k in split) {
				var wrd = split[k];
     			var tmp = new Word({word : wrd, check : wrd, len : wrd.length, pts : wrd.length});
     			wordTab.add(tmp);
			}
		});
	}
	else
		console.log('le fichier n\'existe pas');
});

/* Fonction qui melange un mot */
function shuffle(s, len) {
	var shuf = s;
	var i = 0;
	var j = 0;
	var tmp = '';
	while (i < len) {
		j = Math.floor(Math.random() * len);
		tmp = shuf[j];
		shuf[j] = shuf[i];
		shuf[i] = tmp;
		i++;
	}
	return (shuf);
}

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
	});

	socket.on('newgame', function(msg) {
		msg.username = '<span style="color:red">[Scramble]</span>';
		if (isscramble) {
			msg.msg = '<span style="color:red;">@<span> <span style="color:blue">Une partie est déja en cours. </span><span style="color:red;">@<span>';
			socket.emit('newmsg', msg);
		}
		else {
			var rand = Math.floor(Math.random() * wordTab.length);
			wrdModel = wordTab.models[rand];
			var split = wrdModel.get('word').split('');
			var shuf = shuffle(split, wrdModel.get('len'));
			wrdModel.set('check', shuf);
			console.log('le mot choisis est : ' + wrdModel.get('word') + ' melanger : ' + shuf);
			isscramble = true;
			msg.msg = '<span style="color:red;">@<span> <span style="color:blue">Nouvelle Partie de scramble par <span class="'+ me.sexe +'">'+ me.username +'</span> bonne chance! </span><span style="color:red;">@<span>';
			io.sockets.emit('newmsg', msg);
		}
	});
});