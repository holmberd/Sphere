/**
   Copyright (c) 2015 Dag Holmberg (holmberd@gmail.com)
   Permission is hereby granted, free of charge, to any person obtaining a copy
   of this software and associated documentation files (the "Software"), to deal
   in the Software without restriction, including without limitation the rights
   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   copies of the Software, and to permit persons to whom the Software is
   furnished to do so, subject to the following conditions:
   The above copyright notice and this permission notice shall be included in all
   copies or substantial portions of the Software.
   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
   SOFTWARE.
 */

var playState = {

    background: null,
    cursors: null,
    //time: 0,
    p: null,

		ship: {
		    sprite: null,
		    hp: 100,
		    shipScale: 0.3,
		    proximitySize: 300,
		    proximityCircle: null,
		    init: function () {
		        this.sprite = game.add.sprite(game.world.centerX + 200, game.world.centerY + 200, 'ship');
		        game.physics.p2.enable(this.sprite, false);
		        this.sprite.health = this.hp;
		        this.sprite.scale.setTo(this.shipScale, this.shipScale);
		        this.sprite.body.setCircle(50*this.shipScale);
		        this.sprite.body.collideWorldBounds = false;
		        this.sprite.body.setCollisionGroup(playState.collision.ship);
		        this.sprite.body.collides(playState.collision.boss, this.collision, this);
		        this.proximityCircle = new Phaser.Circle(this.sprite.body.x, this.sprite.body.y, this.proximitySize);
		    },
		    collision: function(body1, body2) {

		        body1.sprite.damage(10);
		        body2.sprite.orbit = false;
		    },
		    proximity: function(sprite){
		        if (this.proximityCircle.contains(sprite.body.x, sprite.body.y) && sprite.selfdest != true){
		            sprite.selfdest = true;  
		            sprite.children[0].tint = 150000;//0xCC0000;
		            game.time.events.add(Phaser.Timer.SECOND * 5, playState.selfDestruct, this, sprite);
		        }
		    }

		}, 
		collision: {
		    bullet: null,
		    enemy: null,
		    boss: null,
		    ship: null,
		    init: function () {
		        this.bullet = game.physics.p2.createCollisionGroup();
		        this.enemy = game.physics.p2.createCollisionGroup();
		        this.ship = game.physics.p2.createCollisionGroup();
		        this.boss = game.physics.p2.createCollisionGroup();
		    }
		},
        explosion: {
            group: null,
            init: function () {
                this.group = game.add.group();
                this.group.enableBodyDebug = false;
                this.group.createMultiple(20, 'explosion');
                this.group.forEach(function(sprite) {
                    sprite.anchor.x = 0.5;
                    sprite.anchor.y = 0.5;
                    sprite.animations.add('explosion', [0,1,2,3,4,5,6,7,8], true);
                });
            }
        },
        bullet: {
            num: 200,
            speed: 800,
            lifespan: 3000,
            delay: 250,
            lastTime: 0,
            group: null,
            init: function () {

                this.group = game.add.group();
                this.group.enableBody = true;
                this.group.physicsBodyType = Phaser.Physics.P2JS;
                this.group.createMultiple(this.num, 'bullet');
                this.group.forEach(function(sprite){
                    game.physics.p2.enable(sprite);
                    sprite.anchor.x = 0.5;
                    sprite.anchor.y = 0.5;
                    sprite.body.mass = 0.01;
                    sprite.body.collideWorldBounds = false;
                    sprite.body.setCollisionGroup(playState.collision.bullet);
                    //sprite.body.collides(collision.boss);
                    sprite.body.collides(playState.collision.boss, playState.bullet.collision, this);
                    sprite.kill();
                });

            },
            collision: function (body1, body2) {

                body2.sprite.orbit = false;
                body2.sprite.damage(1);
                body1.sprite.kill();
                //body2.sprite.kill();
                /*
                var kaboom = explosion.group.getFirstExists(false);
                kaboom.reset(body2.x, body2.y);
                kaboom.play('explosion', 30, false, true); */

            },
            shoot: function (sprite) {

                if (game.time.now > playState.bullet.lastTime) {
                    var one = playState.bullet.group.getFirstExists(false);
                    if (one) {
                        one.reset(sprite.x, sprite.y);
                        one.lifespan = playState.bullet.lifespan;
                        one.body.rotation = sprite.body.rotation;
                        one.rotation = sprite.rotation - Phaser.Math.degToRad(90);
                        one.body.velocity.x = Math.cos(one.rotation) * playState.bullet.speed + sprite.body.velocity.x;
                        one.body.velocity.y = Math.sin(one.rotation) * playState.bullet.speed + sprite.body.velocity.y;
                        playState.bullet.lastTime = game.time.now + playState.bullet.delay;
                    }
                }
            }

        },
        boss: {
            sprite: [],
            HP: 100,
            MAXHEALTH: 100,
            speed: 500,
            group: null,
            graphics: null,
            init: function () {
                this.group = game.add.group();
                this.group.enableBody = true;
                this.group.enableBodyDebug = false; // for debugging
                this.group.physicsBodyType = Phaser.Physics.P2JS;

                this.innerGroup = game.add.group();
                this.innerGroup.enableBody = true;
                this.innerGroup.physicsBodyType = Phaser.Physics.P2JS;

                this.outerGroup = game.add.group();
                this.outerGroup.enableBody = true;
                this.outerGroup.physicsBodyType = Phaser.Physics.P2JS;
                //boss.group.x = game.world.centerX;
                //boss.group.y = game.world.centerY;
                var revoluteConstraint = null;
                var constraint = null;

                // Create middle sphere
                this.drawGraphics(0x9900CC, 100);
                this.sprite[0] = this.group.create(game.world.centerX-200, game.world.centerY-200);
                game.physics.p2.enable(this.sprite[0], false);
                this.sprite[0].addChild(this.graphics);
                this.sprite[0].health = this.HP;
                this.sprite[0].maxHealth = this.MAXHEALTH;
                this.sprite[0].body.setCircle(50);
                this.sprite[0].body.mass = 2;
                this.sprite[0].name = 'boss';
                //this.sprite.body.allowRotation = true;
                this.sprite[0].body.collideWorldBounds = false;
                this.sprite[0].body.setCollisionGroup(playState.collision.boss);
                this.sprite[0].body.collides([playState.collision.bullet, playState.collision.ship]);

                // Create first outer spinning sphere
                this.drawGraphics(0x00CCFF, 30);
                this.sprite[1] = this.innerGroup.create(game.world.centerX+100, game.world.centerY);
                this.createSphere(this.sprite[1], 15);
                this.sprite[1].deg = 0;
                this.sprite[1].orbitData = {radius: 120 , speed: 0.05};

                // Create our second outer spinning sphere
                this.drawGraphics(0x00CCFF, 30);
                this.sprite[2] = this.innerGroup.create(game.world.centerX, game.world.centerY);
                this.createSphere(this.sprite[2], 15);
                this.sprite[2].deg = 45;
                this.sprite[2].orbitData = {radius: 120 , speed: 0.05};

                // Create our third outer spinning sphere
                this.drawGraphics(0x00CCFF, 30);
                this.sprite[3] = this.innerGroup.create(game.world.centerX, game.world.centerY);
                this.createSphere(this.sprite[3], 15);
                this.sprite[3].deg = 90;
                this.sprite[3].orbitData = {radius: 120 , speed: 0.05};

                // Create our forth outer spinning sphere
                this.drawGraphics(0x00CCFF, 30);
                this.sprite[4] = this.innerGroup.create(game.world.centerX, game.world.centerY);
                this.createSphere(this.sprite[4], 15);
                this.sprite[4].deg = 135;
                this.sprite[4].orbitData = {radius: 120 , speed: 0.05};

                // Create our fifth outer spinning sphere
                this.drawGraphics(0x00CCFF, 30);
                this.sprite[5] = this.innerGroup.create(game.world.centerX, game.world.centerY);
                this.createSphere(this.sprite[5], 15);
                this.sprite[5].deg = 180;
                this.sprite[5].orbitData = {radius: 120 , speed: 0.05};

                // Create our sixth outer spinning sphere
                this.drawGraphics(0x00CCFF, 30);
                this.sprite[6] = this.innerGroup.create(game.world.centerX, game.world.centerY);
                this.createSphere(this.sprite[6], 15);
                this.sprite[6].deg = 225;
                this.sprite[6].orbitData = {radius: 120 , speed: 0.05};

                //Create second outer sphere ring

                // seventh
                this.drawGraphics(0x00CCFF, 30);
                this.sprite[7] = this.outerGroup.create(game.world.centerX+100, game.world.centerY);
                this.createSphere(this.sprite[7], 15);
                this.sprite[7].deg = 45;
                this.sprite[7].orbitData = {radius: 160 , speed: 0.02};

                // eigth
                this.drawGraphics(0x00CCFF, 30);
                this.sprite[8] = this.outerGroup.create(game.world.centerX, game.world.centerY);
                this.createSphere(this.sprite[8], 15);
                this.sprite[8].deg = 90;
                this.sprite[8].orbitData = {radius: 160 , speed: 0.02};

                // ninth
                this.drawGraphics(0x00CCFF, 30);
                this.sprite[9] = this.outerGroup.create(game.world.centerX, game.world.centerY);
                this.createSphere(this.sprite[9], 15);
                this.sprite[9].deg = 135;
                this.sprite[9].orbitData = {radius: 160 , speed: 0.02};

                // tenth
                this.drawGraphics(0x00CCFF, 30);
                this.sprite[10] = this.outerGroup.create(game.world.centerX, game.world.centerY);
                this.createSphere(this.sprite[10], 15);
                this.sprite[10].deg = 180;
                this.sprite[10].orbitData = {radius: 160 , speed: 0.02};

                // eleventh
                this.drawGraphics(0x00CCFF, 30);
                this.sprite[11] = this.outerGroup.create(game.world.centerX, game.world.centerY);
                this.createSphere(this.sprite[11], 15);
                this.sprite[11].deg = 225;
                this.sprite[11].orbitData = {radius: 160 , speed: 0.02};

                // twelve
                this.drawGraphics(0x00CCFF, 30);
                this.sprite[12] = this.outerGroup.create(game.world.centerX, game.world.centerY);
                this.createSphere(this.sprite[12], 15);
                this.sprite[12].deg = 270;
                this.sprite[12].orbitData = {radius: 160 , speed: 0.02};

                this.group.add(this.outerGroup);
                this.group.add(this.innerGroup);
        },

        createSphere: function(sprite, bodySize){
            game.physics.p2.enable(sprite, false);
            sprite.addChild(this.graphics);
            sprite.health = 10;
            sprite.body.setCircle(bodySize);
            sprite.body.collideWorldBounds = false;
            sprite.body.mass = 1;
            sprite.orbit = true;
            sprite.selfdest = false;
            sprite.body.setCollisionGroup(playState.collision.boss);
            sprite.body.collides([playState.collision.ship, playState.collision.bullet]);
        },

        drawGraphics: function(color, size) {
            this.graphics = game.add.graphics();
            this.graphics.boundsPadding = 0;
            this.graphics.beginFill(color, 1);
            this.graphics.drawCircle(0, 0, size);
            this.graphics.endFill();
        },
        updateSpriteOrbit: function(sprite, r, c, rate){

            sprite.body.x = c.x + (r * Math.cos(sprite.deg));
            sprite.body.y = c.y + (r * Math.sin(sprite.deg));
            sprite.deg += rate;
        },

        moveSpheres: function (obj, speed) { 
            this.accelerateToObject(obj, playState.ship.sprite, speed);
        },
        orbitCheck: function(p){
            var i = 1;
            for (i = 1; i <= 12; i++){
                if (i < 7) {
                    if (this.sprite[i].orbit) this.updateSpriteOrbit(this.sprite[i], 120, p, 0.05);
                    else {
                        this.moveSpheres(this.sprite[i], 70);
                        playState.ship.proximity(this.sprite[i]);
                    }
                }
                else {
                    if (this.sprite[i].orbit) this.updateSpriteOrbit(this.sprite[i], 160, p, 0.02);
                    else {
                        this.moveSpheres(this.sprite[i], 100);
                        playState.ship.proximity(this.sprite[i]);
                    }

                }
            }  
        },
        accelerateToObject: function(obj1, obj2, speed) {
            if (typeof speed === 'undefined') { speed = 60; }
            var angle = Math.atan2(obj2.y - obj1.y, obj2.x - obj1.x);
            obj1.body.rotation = angle;
            obj1.body.force.x = Math.cos(angle) * speed;
            obj1.body.force.y = Math.sin(angle) * speed;
        },
        
        revive: function(check) {

                var i = 1;
                var resetDeg = [0,0,45,90,135,180,225,270,45,90,135,180,225];
                if (check) {
                    for (i = 1; i <= 7; i++){
                        playState.boss.sprite[i].reset(game.world.centerX, game.world.centerY);
                        playState.boss.sprite[i].health = 10;
                        playState.boss.sprite[i].children[0].tint = 0xfffffff;
                        playState.boss.sprite[i].orbit = true;
                        playState.boss.sprite[i].selfdest = false;
                        playState.boss.sprite[i].deg = resetDeg[i];
                        //playState.boss.updateSpriteOrbit(playState.boss.sprite[i], playState.boss.sprite[i].orbitData.radius, p, playState.boss.sprite[i].orbitData.speed);
                    }
                }
                    else {
                        for (i = 8; i <= 12; i++){
                        playState.boss.sprite[i].reset(game.world.centerX, game.world.centerY);
                        playState.boss.sprite[i].health = 10;
                        playState.boss.sprite[i].children[0].tint = 0xfffffff;
                        playState.boss.sprite[i].orbit = true;
                        playState.boss.sprite[i].selfdest = false;
                        playState.boss.sprite[i].deg = resetDeg[i];
                        //playState.boss.updateSpriteOrbit(playState.boss.sprite[i], playState.boss.sprite[i].orbitData.radius, p, playState.boss.sprite[i].orbitData.speed);
                    }
                }
        },

        /*
        collision: function (body1, body2) {

            body1.sprite.orbit = false;
            //body2.sprite.orbit = false;
        } */
    },
 
    selfDestruct: function(sprite){

        if (sprite.alive){
            var blast = playState.explosion.group.getFirstExists(false);
            var blastCircle = new Phaser.Circle(sprite.body.x, sprite.body.y, 250);
            blast.reset(sprite.body.x, sprite.body.y);
            sprite.kill();
            blast.play('explosion', 9, false, true);
            if (blastCircle.contains(playState.ship.sprite.body.x, playState.ship.sprite.body.y)) playState.ship.sprite.damage(50);
        }
    },

    winOrLose: function(){
        if (!this.ship.sprite.alive) this.Lose();
        if (!this.boss.sprite[0].alive) this.Win();
    },

    create: function() {
        //game.physics.p2.friction = 0;

        game.stage.backgroundColor = '#ffffff';
        var image = game.add.image(0, 0, 'background');

        this.collision.init();

        game.physics.p2.updateBoundsCollisionGroup();

        this.explosion.init();
        this.boss.init();
        this.bullet.init();
        this.ship.init();

        //init ship healthbar
        var shipBarConfig = {
                                width: 250,
                                height: 20,
                                x: 870,
                                y: 50,
                                bg: {
                                  color: '#FFFFFF'
                                },
                                bar: {
                                  color: '#000000'
                                },
                                animationDuration: 200,
                                flipped: false
                              };

        this.shipHealthBar = new HealthBar(this.game, shipBarConfig);
        this.shipHealthBar.barSprite.fixedToCamera = true;
        this.shipHealthBar.bgSprite.fixedToCamera = true;

        //init boss healthbar
        var bossBarConfig = {
                                width: 250,
                                height: 20,
                                x: 870,
                                y: 20,
                                bg: {
                                  color: '#FFFFFF'
                                },
                                bar: {
                                  color: '#9900CC'//'#CC0066'
                                },
                                animationDuration: 200,
                                flipped: false
                              };
        this.bossHealthBar = new HealthBar(this.game, bossBarConfig);
        this.bossHealthBar.barSprite.fixedToCamera = true;
        this.bossHealthBar.bgSprite.fixedToCamera = true;                    

        game.camera.follow(this.ship.sprite);
        this.cursors = game.input.keyboard.createCursorKeys();

    },

                

    update: function() {
        
        game.world.wrap(this.ship.sprite.body);

        game.world.wrap(this.boss.sprite[0].body);

        this.boss.innerGroup.forEachExists(function(sprite) {
            game.world.wrap(sprite.body);
        }); 

        this.boss.outerGroup.forEachExists(function(sprite) {
            game.world.wrap(sprite.body);
        });  

        this.winOrLose();

        if (this.boss.sprite[0].health === 50) this.boss.moveSpheres(this.boss.sprite[0], 150);
        else this.boss.moveSpheres(this.boss.sprite[0], 100);

        //updates the position for main big boss sphere
        p = {
            x: this.boss.sprite[0].x, 
            y: this.boss.sprite[0].y
        };

        //updates orbital path for spheres, sprite, radius, centerP, rate
        this.boss.orbitCheck(p);

        this.ship.proximityCircle.x = this.ship.sprite.body.x;
        this.ship.proximityCircle.y = this.ship.sprite.body.y;

        //updates seconds since game started
        //time = Math.round(game.time.time/1000);

        this.shipHealthBar.setPercent(this.ship.sprite.health);
        this.bossHealthBar.setPercent(this.boss.sprite[0].health);  

        if (this.boss.innerGroup.countLiving() === 0){
            playState.boss.revive(1);
        } 
        if (this.boss.outerGroup.countLiving() === 0){
            playState.boss.revive(0);
        } 



        
      if (this.cursors.left.isDown)
        {
            this.ship.sprite.body.rotateLeft(100);
        }
        else if (this.cursors.right.isDown)
        {
            this.ship.sprite.body.rotateRight(100);
        }
        else
        {
            this.ship.sprite.body.setZeroRotation();
        }

        if (this.cursors.up.isDown)
        {
            this.ship.sprite.body.thrust(400);
        }/*
        else if (cursors.down.isDown)
        {
            ship.sprite.body.reverse(400);
        } */
        if (game.input.keyboard.isDown(Phaser.Keyboard.CONTROL)) {
            playState.bullet.shoot(this.ship.sprite);
        }
    }, 
    render: function() {
        //game.debug.geom(ship.proximityCircle,'blue');
        //game.debug.text('x: '+ship.proximityCircle.x,50,200);
        //game.debug.text('y: '+ship.proximityCircle.y,50,230);
        //game.debug.text('Aliveinner: ' +this.boss.innerGroup.countLiving(),50,250);
        //game.debug.text('Aliveouter: ' +this.boss.outerGroup.countLiving(),50,150);
        //game.debug.text('gametime: ' +time, 50, 300);
        //game.debug.text('Turns: ' +Math.round(Math.cos(boss.sprite[1].deg)), 50, 100);
        //game.debug.spriteInfo(ship, 32, 32);
        //game.debug.text('Living ' + (enemy.group.countLiving()), 32, 32);
    },

	Win: function(){
		game.state.start('win');
	},
	Lose: function(){
		game.state.start('lose');
	}
};
		
