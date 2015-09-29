var menuState = {

	create: function() {
		game.stage.backgroundColor = '#ffffff';
		var nameLabel = game.add.text(80, 80, 'Sphere', {font: '50px Arial', fill: '#000000'});
		var startLabel = game.add.text(80, 500, 'press the "W" key to start', {font: '25px Arial', fill: '#000000'});
		var wkey = game.input.keyboard.addKey(Phaser.Keyboard.W);
		wkey.onDown.addOnce(this.start, this);
		},
	start: function(){
		game.state.start('play');
	},
};
