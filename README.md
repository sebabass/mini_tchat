# mini_tchat

# Installation
$ npm install socket.io

# Jeu de scramble

Les commandes
- /scramble 		: Lance une partie de scramble sauf si une partie est en cours.
- /scramble_score 	: Affiche les meilleurs scores par ordre décroissant.

Les règles
- Un mot est tiré au hasard dans une liste.
- Ce mot est mélangé puis afficher aux utilisateurs.
- Vous avez une minute pour trouver ce mot 'majuscules et minuscules acceptées'.
- L'utilisateur qui trouve le mot en 1er gagne des points par rapport à la taille du mot.

Autres
- Modifier le temps : Modifier la variable 'times' dans scramble.js
- On peut continuer a discuté pendant une partie.
- Les mots sont stockés dans un fichier 'mot.txt'.Un mot par ligne.
- Pareil pour les meilleurs scores 'score.txt'.Ils sont trier a chaque partie.