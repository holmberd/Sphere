var loadState = {
	
	preload: function(){
		var loadingLabel = game.add.text(80, 150, 'loading...', {font: '30px Courier', fill: '#ffffff'});

		game.load.spritesheet('explosion', 'assets/Blaster_Explosion.png', 250, 250);
	    	game.load.image('bullet', 'assets/bullet_black.png');
	    	game.load.image('ship', 'assets/whiteShip.png');
	    	game.load.image('background', 'assets/white_2048x2048.jpg');
	},
	
	create: function(){
		game.state.start('menu');
	}
};
