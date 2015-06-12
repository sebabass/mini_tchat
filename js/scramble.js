var fs = require('fs');
var	Backbone = require('backbone');

var scores = [];
var isscramble = false;
var wrdModel = false;
var wordTab = false; 
var timer = false;
var times = 60000; // 60 secondes temps pour trouver le mot.
var username = '<span style="color:red">[Scramble]</span>';

/* Backbone */
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

/* On récupere tous les mots dans un fichier et on les ajoute a notre collection */
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
			lenTab = wordTab.length;
			exports.wordTab = wordTab;
			exports.wrdModel = wrdModel;
		});
	}
	else
		console.log('le fichier n\'existe pas');
});

/* On récupere les scores dans le fichier score.txt et on les stocks dans un tableau */
fs.exists('../score.txt', function(doesExist) {
	var split;
	if (doesExist) {
		fs.readFile('../score.txt', function(error, content) {
			if (error) {
				console.error(error);
				return;
			}
			content = content.toString();
			split = content.split('\n');
			for (var k in split) {
				var scr = {};
				var split_score = split[k].split(':');
				scr.username =  split_score[0];
				if (scr.username !== '') {
					scr.score = parseInt(split_score[1]);
					scores.push(scr);
				}
			}
			exports.scores = scores;
		});
	}
	else
		console.log('le fichier n\'existe pas'); // "creer le fichier".
});

/* Fonction qui melange un mot */
var shuffle = function shuffle(s, len) {
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

/* Fonction qui ecrit les scores dans le fichier score et qui retourne sont contenu pour être afficher */
var putScore = function putScore() {
	var str_user;
	var str_score;
	var content = '';
	sortScore();
	for (var k in scores) {
		str_user = scores[k].username.concat(':');
		str_score = str_user.concat(scores[k].score);
		if (scores[k].username !== '') 
			str_score = str_score.concat('\n');
		content = content.concat(str_score);
	}
	console.log(content);
	fs.writeFile('../score.txt', content, function(error) {
		if (error)
			console.error(error);
		else {
			console.log('score mis a jour.');
		}
	});
	return (content);
}

/* Fonction qui met a jour le tableau des scores */
var updateScore = function updateScore(username, score) {
	var isUpdate = false;
	for (var k in scores) {
		if (scores[k].username === username) {
			scores[k].score += parseInt(score);
			isUpdate = true;
		}
	}
	if (!isUpdate) {
		var scr = {};
		scr.username = username;
		scr.score = parseInt(score);
		scr.id = score.toString() + scr.username;
		scores.push(scr);
	}
	return (putScore());
}

/* Fonction qui fait un tri décroissant sur les scores */
var sortScore = function sortScore() {
	var tmp;
	var j = 0;
	var i = 0;

	while (i < (scores.length - 1)) {
		j = i + 1;
		if (scores[i].score < scores[j].score) {
			tmp = scores[i];
			scores[i] = scores[j];
			scores[j] = tmp;
			i = 0;
		}
		else
			i++;
	}
}

var dialog = function dialog(str) {
	return ('<span style="color:red;">@<span> <span style="color:blue">'+ str +'</span></span><span style="color:red;">@<span>');
}

exports.times = times;
exports.username = username;
exports.shuffle = shuffle;
exports.updateScore = updateScore;
exports.putScore = putScore;
exports.putScore = putScore;
exports.dialog = dialog;