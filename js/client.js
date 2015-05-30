(function($) {
	var socket = io.connect('http://localhost:4242');
	var form = $('#login-form');
	var	msgform = $('#msg-form');

	form.submit(function(event){
		event.preventDefault();
		// Envoi l'evenement login a notre serveur.
		if ($('#username').val() != '' && $('#email').val() != '') {
			socket.emit('login', {
				username : $('#username').val(),
				email : $('#email').val(),
				sexe : $('input[type=radio][name=sexe]:checked').attr('value')
			});
		}

		socket.on('logged', function() {
			$('#login').fadeOut();
			$('#msg').focus();
		});

		socket.on('errorform', function() {
			console.log('utilisateur ou email déja existant');
		})
	});

	msgform.submit(function(event){
		event.preventDefault();
		if ($('#msg').val() != '') {
			console.log('message envoyer');
			socket.emit('newmsg', {
				msg : $('#msg').val()
			});
		}
		$('#msg').val('');
		$('#msg').focus();
	});

	// On ajoute l'utilisateur connecter a la liste utilisateur.
	socket.on('nwusr', function(user){
		console.log('new user : ' + user.username);
		$('.users-list').append('<li class="list-group-item '+ user.username +' '+ user.sexe +'">'+ user.username +'</li>');
	});

	// On supprime un utilisateur de la liste utilisateur.
	socket.on('delusr', function(user) {
		$('.'+ user.username).remove();
	});

	socket.on('newmsg', function(msg) {
		console.log('Pseudo : ' + msg.username + ' message : ' + msg.msg);
		$('.panel-center').animate({ scrollTop : $('.panel-center').prop('scrollHeight') }, 50);

		MsgView = Backbone.View.extend ({
			el: '#msg-container-tpl',

			initialize: function(){
				this.render();
			},

			render: function(){
				var variables = {
					pseudo : '<span class="pseudo-msg '+ msg.sexe +'">' + msg.username + '</span>',
					message : '<span class="msg-msg">' + msg.msg + '</span>'
				};
				var template = _.template($('#msg-tpl').html(), variables);
				this.$el.append(template(variables));
			}
		});

		var msgView = new MsgView();
	});

})(jQuery);