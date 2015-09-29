var loseState = {

	create: function() {
		var loseLabel = game.add.text(80, 80, 'You lost!', {font: '50px Arial', fill: '#000000'});
		var startLabel = game.add.text(80, 500, 'press the "W" key to return to menu', {font: '25px Arial', fill: '#000000'});
		var wkey = game.input.keyboard.addKey(Phaser.Keyboard.W);
		wkey.onDown.addOnce(this.restart, this);
		},
	restart: function() {
		game.state.start('menu');
	},
};