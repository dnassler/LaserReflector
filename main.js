
var game = new Phaser.Game( 1200, 800, Phaser.AUTO, 'gave_div');

var game_state = {};

// define globals here
var gridSize = 100;
var numBlocksVertical;
var numBlocksHorizontal;

var introInfoGroup;
var introText;

var timeMarkerUpdateBgTextGroup = 0;
var timeMarkerMoveBlueSquares = 0;
var timeMarkerMovePrizes = 0;
var timeMarkerTweakTriangles = 0;
var timeMarkerGameOver = 0;

var maxGameLevelTime = 100;
var maxHealthShooter = 5;

var gameLevelTimer;
var gameOver = true;

var boxReflector1;
var triangleReflector1;
var shooter1;
var balls;
var blocker1;
var laserLayerBM1; // bitmap for drawing lasers
var laserSprite1; // the sprite that shows the laser bitmap
var laserTextureSprite1;
var laserLayerTexture1;
var laserLayerTexture1sprite;
var prettyBackgroundLayer1;

var reflectorGroup1;
var blankSpaceBufferX = 100, blankSpaceBufferY = 100;

var cursors;

var clickedOnSprite;

var laserFiring = false;
var saveShooterVelocityX, saveShooterVelocityY;

var laserTimerEvent; // used to make the laser flash
var prizeHitEvent;

//var maxShooterVelocity = 300;
var defShooterVelocity = 200;
var shooterAcceleration = 100;

var laserWidth = 10;
var prizeWidth = 34;

var prizeArr;

var rightLimitX;
var topLimitY;
var bottomLimitY;
var leftLimitX;

var timeMarkerReorient = 0;

var totalLaserBounces = 0;
var totalPrizeHits = 0;
var totalHealthShooter;

var scoreText;
var healthText;
var timerText;

var finalScoreText;

var shooterXYText;
var bgTextGroup;

var boxReflectorArr;
var prizeGroupArr;
var triangleGroupArr;

var allGridObjectsArr;

var shapeNameArr;

var prizeHitTweenArr;

game_state.main = function() {};
game_state.main.prototype = {

	preload: function() {
		game.load.image('boxReflector1', "assets/squareBlue1.png");
		game.load.image('triangleReflector1', "assets/triangleWhite1_0.png");
		game.load.image('blocker1', "assets/square1.png");

		game.load.image('shooter1', "assets/triangleYellow1_0.png");

		game.load.image('redBall', "assets/redBall.png");
		game.load.image('laser1', "assets/laserTexture1.png");

		game.load.image('greenBox', "assets/greenBox.png");
	},

	create: function() {

		gameOver = true;

		numBlocksVertical = Math.floor(game.world.height/gridSize) - 2;
		numBlocksHorizontal = Math.floor(game.world.width/gridSize) -3;

		cursors = game.input.keyboard.createCursorKeys();

		if ( false ) {
			bgTextGroup = game.add.group();
	    shooterXYText = game.add.text( 10, 10, "xxx", { font: "400px Arial", fill: "#ffffff", align: "center" });
	    bgTextGroup.add( shooterXYText );
	    bgTextGroup.alpha = .1;
  	}

    //shapeNameArr = ["boxReflector1", "triangleReflector1", "blocker1", "greenBox", "shooter1"];
    shapeNameArr = ["triangleReflector1", "blocker1"];

    bgDecorationGroup1 = game.add.group();
    for (var i=0; i<10; i++) {
    	var x = Math.random()*game.world.width - 100;
    	var y = Math.random()*game.world.height;
    	var shapeName = Phaser.Math.getRandom( shapeNameArr );
    	var s = game.add.sprite(x,y,shapeName);
    	s.anchor.setTo(0.5,0.5);
    	var rscale = Math.random()*2 + 1;
    	s.scale.setTo(rscale,rscale);
    	s.body.velocity.x = (20 * rscale/2.0);
    	s.body.velocity.y = (40 * rscale/2.0);
    	//s.body.angularVelocity = 10 - Math.random()*10*rscale/10;
    	s.events.onOutOfBounds.add( function (bgShape) {
    		// bgShape.reset(-500,-500);
    		// var rscale = Math.random()*10 + 1;
    		// bgShape.scale.setTo(rscale,rscale);
    		// bgShape.body.velocity.x = 50 * rscale/5.0;
    		// bgShape.body.velocity.y = 100 * rscale/5.0;
    		var bgShapeScale = bgShape.scale.x;
    		bgShape.reset(Math.random()*game.world.width - 100, -100);
    		bgShape.body.velocity.x = 20 * bgShapeScale/2.0;
    		bgShape.body.velocity.y = 40 * bgShapeScale/2.0;
    	});
    	bgDecorationGroup1.add( s );
    }
    bgDecorationGroup1.alpha = 0.1;

		// laserSprite1 = game.add.sprite(0,0, 'laser1');
		// laserSprite1.visible = false;
		// laserSprite1.anchor.setTo(0.5,0.5);

		allGridObjectsArr = [];

		// ===
		// add the reflector sprites...

		reflectorGroup1 = game.add.group();
		triangleGroupArr = [];
		for (var i=0; i<10; i++) {
			var r = reflectorGroup1.add( createGameElement("triangleReflector1", true, true) );
			triangleGroupArr.push( r );
			allGridObjectsArr.push( r );
		}
		boxReflectorArr = [];
		for (var i=0; i<5; i++) {
			var r = reflectorGroup1.add( createGameElement("boxReflector1") );
			boxReflectorArr.push( r );
			allGridObjectsArr.push( r );
		}
		for (var i=0; i<5; i++) {
			reflectorGroup1.add( createGameElement("blocker1") );
			allGridObjectsArr.push( r );
		}

		// add prizes
		prizeGroupArr = [];
		prizeGroup = game.add.group();
		for (var i=0; i<10; i++) {
			// do not allow the greenBox to be dragged
			var r = prizeGroup.add( createGameElement("greenBox", false, false) );
			prizeGroupArr.push( r );
			allGridObjectsArr.push( r );
		}
		prizeHitTweenArr = [];
		// ===


		// balls = game.add.group();
		// // balls.createMultiple(50,'redBall');
		// // balls.setAll('anchor.x', 0.5);
		// // balls.setAll('anchor.y', 0.5);
		// // balls.setAll('outOfBoundsKill', true);
		// for ( var i=0; i<50; i++ ) {
		// 	var aBall = balls.create(0,0,'redBall',null,false);
		// 	aBall.anchor.setTo(0.5,0.5);
		// 	aBall.outOfBoundsKill = true;
		// 	aBall.body.bounce.setTo(1,1);
		// 	//aBall.body.gravity.y = 200;
		// }

		game.input.onDown.add( clickListener );

		fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		fireButton.onDown.add( fireButtonPressed );
		fireButton.onUp.add( fireButtonReleased );

		moveLeftKey = game.input.keyboard.addKey(Phaser.Keyboard.A);
		//moveLeftKey.onDown.add( moveLeft );
		moveRightKey = game.input.keyboard.addKey(Phaser.Keyboard.D);
		moveUpKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
		moveDownKey = game.input.keyboard.addKey(Phaser.Keyboard.S);

		game.input.keyboard.addKey(Phaser.Keyboard.BACKWARD_SLASH).onDown.add( fullscreenKeyPressed );
		game.stage.fullScreenScaleMode = Phaser.StageScaleMode.SHOW_ALL;
		//game.stage.scale=0.5;
		//game.stage.backgroundColor = "#e3ed49";

		// player.body.bounce.y = 0.2;
		// player.body.gravity.y = 6;
		// player.body.collideWorldBounds = true;


		//shooter1.body.collideWorldBounds = true;
		//shooter1.body.immovable = true;
		
		//1----laserLayerTexture1 = game.add.renderTexture('laser_texture', game.world.width, game.world.height);
		//1----laserLayerTexture1sprite = game.add.sprite(0,0,laserLayerTexture1);
		// laserLayerBM1 = game.add.bitmapData(game.world.width, game.world.height);
		// laserTextureSprite1 = game.add.sprite(0,0,laserLayerBM1);

		laserLayerBM1 = game.add.bitmapData(game.world.width,game.world.height);
		laserLayerSprite1 = game.add.sprite(0,0,laserLayerBM1);
		laserLayerSprite1.visible = false;

		shooter1 = game.add.sprite(game.world.centerX, 50, "shooter1");
		shooter1.anchor.setTo(0.5,0.5);
		shooter1.visible = false;

		// --
		rightLimitX = game.world.width - shooter1.width/2 - shooter1.width;
		topLimitY = shooter1.height / 2;
		bottomLimitY = game.world.height - shooter1.height/2;
		leftLimitX = shooter1.width/2;

		// --
		var style = { font: "50px 'Press Start 2P'", fill: "#ff0044", align: "center" };

    scoreText = game.add.text(game.world.width-100, 10, "", style);
    healthText = game.add.text(game.world.width-100, 110, "", style);
    timerText = game.add.text(game.world.width-100, 210, "", style);

    // finalScoreText = game.add.text( game.world.centerX, -500, "", { font: "600px Arial", fill: "#ffffff", align: "center", stroke: "#258acc", strokeThickness: 8 });
    finalScoreText = game.add.text( game.world.centerX, -500, "", { font: "600px 'Press Start 2P'", fill: "#ff0044", align: "center", stroke: "#FFFFFF", strokeThickness: 8 });
    finalScoreText.anchor.setTo(0.5,0.5);
    finalScoreText.visible = false;

    introInfoGroup = game.add.group();
    var blackBg = game.add.graphics(0,0);
    introInfoGroup.add( blackBg );
    blackBg.beginFill("0x000000");
    blackBg.drawRect(0,0,game.width,game.height);
    // now draw a red laser around the perimeter of the game world
    //blackBg.setStrokeStyle(laserWidth);
    //blackBg.strokeStyle('#f00');
    
    var introPrize1 = game.add.sprite(gridSize/2,game.world.height-gridSize/2*3, "greenBox");
    introPrize1.anchor.setTo(0.5,0.5);
    introPrize1.scale.setTo(2,2);
    introInfoGroup.add( introPrize1 );
    var introPrize2 = game.add.sprite(game.world.centerX, game.world.height-gridSize/2, "greenBox");
    introPrize2.anchor.setTo(0.5,0.5);
    introPrize2.scale.setTo(2,2);
    introInfoGroup.add( introPrize2 );
    var introPrize3 = game.add.sprite(game.world.width-gridSize/2, 5*gridSize/2, "greenBox");
    introPrize3.anchor.setTo(0.5,0.5);
    introPrize3.scale.setTo(2,2);
    introInfoGroup.add( introPrize3 );

    blackBg.lineStyle(10, 0xFF0000, 1);
    blackBg.moveTo(50,50);
    blackBg.lineTo(game.world.width-gridSize/2,gridSize/2);
    blackBg.lineTo(game.world.width-gridSize/2,game.world.height-gridSize/2);
    blackBg.lineTo(gridSize/2,game.world.height-gridSize/2);
    blackBg.lineTo(gridSize/2,gridSize/2+gridSize*3);

    // *** add graphics to the intro screen (i.e. show the pieces)
    //blackBg.alpha = 0.1;
    var introShooter = game.add.sprite(50,50, "shooter1");
    introShooter.anchor.setTo(0.5,0.5);
    introInfoGroup.add( introShooter );
    var introTri1 = game.add.sprite(game.world.width-gridSize/2,gridSize/2, "triangleReflector1");
    introTri1.anchor.setTo(0.5,0.5);
    introTri1.angle=180;
    introInfoGroup.add( introTri1 );
    var introTri2 = game.add.sprite(game.world.width-gridSize/2,game.world.height-gridSize/2, "triangleReflector1");
    introTri2.anchor.setTo(0.5,0.5);
    introInfoGroup.add( introTri2 );
    introTri2.angle=270;
    var introTri3 = game.add.sprite(gridSize/2,game.world.height-gridSize/2, "triangleReflector1");
    introTri3.anchor.setTo(0.5,0.5);
    introInfoGroup.add( introTri3 );
		var introBlocker = game.add.sprite(gridSize/2,3*gridSize+gridSize/2, "blocker1");
    introBlocker.anchor.setTo(0.5,0.5);
    introInfoGroup.add( introBlocker );
    var introReflector = game.add.sprite(gridSize/2,2*gridSize+gridSize/2, "boxReflector1");
    introReflector.anchor.setTo(0.5,0.5);
    introInfoGroup.add( introReflector );
    
		var introStyle = { font: "24px 'Press Start 2P'", fill: "#ff0044", align: "center" };
    introText = game.add.text( game.world.centerX, game.world.centerY, "",	introStyle );
    introText.anchor.setTo(0.5,0.5);
    introInfoGroup.add( introText );

    game.time.events.add(Phaser.Timer.SECOND*2, function () {
    	introText.setText(
    		"Welcome to LASER REFLECTOR!!!\n\n"
    		+ "Press '\\' for fullscreen (recommended).\n"
    		+ "Press SPACEBAR to fire laser.\n"
    		+ "Try to hit the green boxes without\n"
    		+ "hitting the blue reflector boxes.\n"
    		+ "Watch out for the triangle reflectors!\n"
    		+ "Note you only have "+maxGameLevelTime+" seconds of time\n"
    		+ "and are limited to "+maxHealthShooter+" lives.\n\n"
    		+ "Players may want to control the shooter\n"
    		+ "acceleration around the game edge by using\n"
    		+ "the W/A/S/D keys. Also it is possible\n"
    		+ "to drag and rotate the triangle pieces\n"
    		+ "to shoot more strategically. The more\n"
    		+ "the laser bounces, the more points per\n"
    		+ "'green box' hit. And BONUS points are\n"
    		+ "awarded based on the number of lives\n"
    		+ "remaining."
    		);
    }, this);

		// game.time.events.add(1000, function(){
		// 	healthText.setText( totalHealthShooter );
		// 	scoreText.setText( totalPrizeHits );
		// }, this);

	},

	update: function() {
		
		//game.physics.collide( balls, reflectorGroup1 );
		//game.physics.collide( reflectorGroup1, reflectorGroup1 );


		//console.log("in update");
		// update shooter/player movement
		var shooterAngle = shooter1.angle;
		//console.log("shooter1.angle="+shooter1.angle+", wrappedAngle="+shooterAngle);
		//shooter1.body.velocity.x = 0;
		shooter1.body.acceleration.setTo(0,0);

		if ( !gameOver && !shooterDead ) {
			if ( Math.abs(shooterAngle) == 90 && moveLeftKey.isDown ) {
				// shooter1.body.velocity.x = -minShooterVelocity;
				shooter1.body.acceleration.x = -shooterAcceleration;
			} else if ( Math.abs(shooterAngle) == 90 && moveRightKey.isDown ) {
				// shooter1.body.velocity.x = minShooterVelocity;
				shooter1.body.acceleration.x = shooterAcceleration;
			} else if ( (Math.abs(shooterAngle) == 180 || shooterAngle == 0 ) && moveDownKey.isDown ) {
				// shooter1.body.velocity.y = minShooterVelocity;
				shooter1.body.acceleration.y = shooterAcceleration;
			} else if ( (Math.abs(shooterAngle) == 180 || shooterAngle == 0 ) && moveUpKey.isDown ) {
				// shooter1.body.velocity.y = -minShooterVelocity;
				shooter1.body.acceleration.y = -shooterAcceleration;
			}
		}

		reorientShooterAsNecessary();

		if ( game.time.now > timeMarkerUpdateBgTextGroup ) {
			if ( shooterXYText ) shooterXYText.setText( shooter1.x +"\n" + shooter1.y );
			timeMarkerUpdateBgTextGroup = game.time.now + 1000;
		}

		if ( game.time.now > timeMarkerMoveBlueSquares ) {
			updateObjectPositions( boxReflectorArr );
			timeMarkerMoveBlueSquares = game.time.now + Math.random()*5000 + 5000;
		}

		if ( game.time.now > timeMarkerMovePrizes ) {
			updateObjectPositions( prizeGroupArr );
			timeMarkerMovePrizes = game.time.now + Math.random()*15000 + 5000;
		}

		if ( game.time.now > timeMarkerTweakTriangles ) {
			updateObjectPositions( triangleGroupArr );
			timeMarkerTweakTriangles = game.time.now + Math.random()*5000 + 2000;
		}

		//texture.render(laserLayer1, position, true); //the last arg specifies to clear or not
		// if (!game.input.activePointer.position.isZero()) {
		// 	laserLayerTexture1.render(laserSprite1, game.input.activePointer.position, false, true);
		// }
		//1----if ( laserFiring) laserLayerTexture1.render(laserLayerSprite1, {x:0,y:0}, false, true);
	},

	render: function() {
		// if ( clickedOnSprite ) {
		// 	game.debug.renderSpriteInfo(clickedOnSprite,10,20);
		// 	game.debug.renderPhysicsBody(clickedOnSprite.body);
		// }
		// // console.log("******");
		// // if ( clickedOnSprite ) console.log("x="+clickedOnSprite.x);

		// game.debug.renderInputInfo(10,400);

		game.debug.renderSpriteInfo(shooter1,10,600);

	}

}

function updateGameLevelTimer() {
	if ( gameOver ) return;
	gameLevelTimer -= 1;
	timerText.setText(gameLevelTimer);
	if ( gameLevelTimer <= 0 ) {
		gameLevelTimeout();
	}
}

function rotateTriangleReflector( r, randomRotate ) {
	var newAngle;
	if ( randomRotate ) {
		newAngle = Math.floor(Math.random() * 4) * 90;
	} else {
		newAngle = r.angle + 90;
	}
	//r.angle = newAngle;
	game.add.tween(r).to({angle:newAngle}, 500, Phaser.Easing.Linear.None, true);
}

function fullscreenKeyPressed() {
		game.stage.scale.startFullScreen();
}

function createGameElement( shapeName, canRotate, canDrag ) {
	
	//console.log("in createGameElement");

	var rx, ry;
	var pointEmpty = findEmptyGridLocation();
	rx = pointEmpty.x;
	ry = pointEmpty.y;
	console.log("createGameElement: pointEmpty.x="+pointEmpty.x+", pointEmpty.y="+pointEmpty.y);

	var shape = game.add.sprite( rx, ry, shapeName );
	shape.anchor.setTo(0.5,0.5);
	if ( shapeName === "triangleReflector1" ) {
		shape.body.setPolygon( 0,0, 100,100, 0,100 );
	}
	
	if ( canRotate ) {
		shape.angle = Math.floor(Math.random() * 4) * 90;
		//var rotation = Phaser.Math.degToRad(Phaser.Math.wrapAngle(shape.angle));
		shape.body.translate( -50,-50 );
		shape.body.polygon.rotate(shape.rotation);
		shape.body.translate( 50, 50 );
	}

	shape.body.linearDamping = 0.1;

	//shape.inputEnabled = true;
	if ( canDrag ) {
		shape.input.start(0,true);
		shape.input.enableDrag();
		//shape.input.enableSnap(50,50,false,true );
		shape.events.onDragStop.add(fixSnapLocationReflector);	
		shape.events.onInputDown.add(clickOnReflectorListener, this);	
	}


	shape.name = shapeName;

	return shape;
}

function fixSnapLocationReflector( reflectorSprite ) {
	reflectorSprite.x = Phaser.Math.snapToFloor( reflectorSprite.x, 100 ) + 50;
	reflectorSprite.y = Phaser.Math.snapToFloor( reflectorSprite.y, 100 ) + 50;
}

function fireButtonPressed() {

	// since the SPACEBAR is used to start the gameplay (as well as shooting the laser)
	// we need to do a few checks to decide if we need to restart the game 
	// or to shoot the laser.
	if ( gameOver || shooterDead ) {
		if ( !gameOver ) return; // ignore the fire button right now
		if ( game.time.now > timeMarkerGameOver ) {
			// the user pressed the fire button after a game over occurred after
			// a preset amount of time
			restartGame();
		}
		return;
	}

	laserFiring = true;
	//laserLayerTexture1sprite.visible = true;
	saveShooterVelocityX = shooter1.body.velocity.x;
	saveShooterVelocityY = shooter1.body.velocity.y;
	console.log("fireButtonPressed: setting saveShooterVelocityX="+saveShooterVelocityX+", shooter1.body.velocity.x="+shooter1.body.velocity.x);

	shooter1.body.velocity.setTo(0,0);

	var x0 = shooter1.x;
	var y0 = shooter1.y;
	// var aBall = balls.getFirstDead();
	// aBall.reset( x0, y0 );
	// //aBall.body.velocity.y = 200;
	// var theShootingAngle = shooter1.angle;
	// game.physics.velocityFromAngle( theShootingAngle, 400, aBall.body.velocity);
	var r = drawLaserFrom( x0, y0, shooter1.angle );
	laserLayerSprite1.visible = true;
	laserLayerSprite1.alpha = 1;

	if ( r.isReflectingBack ) {
		console.log("adding timer event");
		laserTimerEvent = game.time.events.loop(100, laserTimerEventCallback, this);
		totalHealthShooter -= 1;
	}
	if ( prizeArr.length > 0 ) {
		// game.add.tween(b)
		// 	.to({alpha:0}, 500, Phaser.Easing.Linear.None, true)

		prizeArr.forEach(function(p) {
			// prizeHitTweenArr.push( 
			// 	game.add.tween(p.scale)
			// 		.to({x:2,y:2}, 100, Phaser.Easing.Linear.None, true, 0, 5, true)
			// 		.to({x:1,y:1}, 100, Phaser.Easing.Linear.None, true, 0)
			// 		.loop() );
			game.add.tween(p.scale)
				.to({x:2,y:2}, 100, Phaser.Easing.Linear.None, true, 0, 5, true);
		});

		//prizeHitEvent = game.time.events.loop(200, prizeHitTimerEventCallback, this);

		totalPrizeHits += prizeArr.length * (r.numLaserBounces + 1);
	}

	// update score/health displayed
	healthText.setText( totalHealthShooter );
	scoreText.setText( totalPrizeHits );

	if ( r.isReflectingBack ) {
		var d = shooterDirection();
		if ( d.isUp || d.isDown ) {
			game.add.tween(shooter1)
				.to( { x: '+10' }, 250, Phaser.Easing.Linear.None, true, 0, 0, true)
				.to( { x: '-10' }, 50, Phaser.Easing.Linear.None, true, 0, 0, true)
				.to( { x: '+10' }, 50, Phaser.Easing.Linear.None, true, 0, 0, true)
				.to( { x: '-10' }, 50, Phaser.Easing.Linear.None, true, 0, 0, true)
				.to( { x: '+10' }, 50, Phaser.Easing.Linear.None, true, 0, 0, true)
				.to( { x: '-10' }, 50, Phaser.Easing.Linear.None, true, 0, 0, true)
				.to( { x: '+10' }, 50, Phaser.Easing.Linear.None, true, 0, 0, true)
				.to( { x: '-10' }, 50, Phaser.Easing.Linear.None, true, 0, 0, true)
				.to( { x: '+10' }, 50, Phaser.Easing.Linear.None, true, 0, 0, true)
				.to( { x: '-10' }, 50, Phaser.Easing.Linear.None, true, 0, 0, true)
				.to( { x: '+10' }, 50, Phaser.Easing.Linear.None, true, 0, 0, true)
				.to( { x: '-10' }, 50, Phaser.Easing.Linear.None, true, 0, 0, true)
				.to( { x: '+10' }, 50, Phaser.Easing.Linear.None, true, 0, 0, true)
				.to( { x: '-10' }, 50, Phaser.Easing.Linear.None, true, 0, 0, true)
				.to( { x: '+10' }, 50, Phaser.Easing.Linear.None, true, 0, 0, true)
				.to( { x: '-10' }, 50, Phaser.Easing.Linear.None, true, 0, 0, true)
				.to( { x: '+10' }, 50, Phaser.Easing.Linear.None, true, 0, 0, true)
				.onComplete.add( shooterDies, this );
		} else {
			game.add.tween(shooter1)
				.to( { y: '+10' }, 250, Phaser.Easing.Linear.None, true, 0, 0, true)
				.to( { y: '-10' }, 50, Phaser.Easing.Linear.None, true, 0, 0, true)
				.to( { y: '+10' }, 50, Phaser.Easing.Linear.None, true, 0, 0, true)
				.to( { y: '-10' }, 50, Phaser.Easing.Linear.None, true, 0, 0, true)
				.to( { y: '+10' }, 50, Phaser.Easing.Linear.None, true, 0, 0, true)
				.to( { y: '-10' }, 50, Phaser.Easing.Linear.None, true, 0, 0, true)
				.to( { y: '+10' }, 50, Phaser.Easing.Linear.None, true, 0, 0, true)
				.to( { y: '-10' }, 50, Phaser.Easing.Linear.None, true, 0, 0, true)
				.to( { y: '+10' }, 50, Phaser.Easing.Linear.None, true, 0, 0, true)
				.to( { y: '-10' }, 50, Phaser.Easing.Linear.None, true, 0, 0, true)
				.to( { y: '+10' }, 50, Phaser.Easing.Linear.None, true, 0, 0, true)
				.to( { y: '-10' }, 50, Phaser.Easing.Linear.None, true, 0, 0, true)
				.to( { y: '+10' }, 50, Phaser.Easing.Linear.None, true, 0, 0, true)
				.to( { y: '-10' }, 50, Phaser.Easing.Linear.None, true, 0, 0, true)
				.to( { y: '+10' }, 50, Phaser.Easing.Linear.None, true, 0, 0, true)
				.to( { y: '-10' }, 50, Phaser.Easing.Linear.None, true, 0, 0, true)
				.to( { y: '+10' }, 50, Phaser.Easing.Linear.None, true, 0, 0, true)
				.onComplete.add( shooterDies, this );
		}
	}

}

function shooterDies() {
  //game.add.tween(shooter1).to( { scale: 0 }, 2000, Phaser.Easing.Linear.None, true);
  shooterDead = true;
  fireButtonReleased();

	game.add.tween(shooter1).to( { alpha: 0 }, 2000, Phaser.Easing.Linear.None, true, 500);
	if ( totalHealthShooter > 0 ) {
		game.time.events.add(3000, restartLevel, this);
	} else {
		gameLevelTimeout();
	}
}

function gameLevelTimeout() {
	gameOver = true;
	game.time.events.remove(gameLevelTimerEvent);

	console.log("************** GAME OVER *****************");
	// calculate final score based on the number of hits combined with the shooter health
	var totalScore = totalPrizeHits + Math.floor(totalPrizeHits * totalHealthShooter / maxHealthShooter);
	finalScoreText.visible = true;
	finalScoreText.setText( totalScore );
	game.add.tween(finalScoreText).to({y:game.world.centerY}, 1000, Phaser.Easing.Back.Out, true);
	
	timeMarkerGameOver = game.time.now + 5000;

	game.time.events.add(Phaser.Timer.SECOND * 10, showIntroInfo, this);
}

function showIntroInfo() {
	introInfoGroup.visible = true;
	finalScoreText.visible = false;
}

function restartGame() {

	introInfoGroup.visible = false;

	finalScoreText.visible = false;
	finalScoreText.y = -500;
	finalScoreText.setText("");
	totalHealthShooter = maxHealthShooter;
	totalPrizeHits = 0;
	gameLevelTimer = maxGameLevelTime;

	restartLevel();

	gameLevelTimerEvent = game.time.events.loop(Phaser.Timer.SECOND, updateGameLevelTimer, this);

	timeMarkerMoveBlueSquares = game.time.now + 10000;
	timeMarkerMovePrizes = game.time.now + 20000;
	timeMarkerTweakTriangles = game.time.now + 15000;

	gameOver = false;

}

function restartLevel() {
	saveShooterVelocityX = null;
	saveShooterVelocityY = null;
	shooterDead = false;
	shooter1.visible = true;
	shooter1.alpha = 1;
  shooter1.angle = 90;
  shooter1.x = game.world.centerX;
  shooter1.y = topLimitY;
  shooter1.body.angularVelocity = 0;
  shooter1.body.acceleration.setTo(0,0);
  shooter1.body.velocity.setTo(0,0);
	shooter1.body.velocity.x = -defShooterVelocity; // make the direction random left/right
	// also make the starting side random (top/bottom)

	healthText.setText( totalHealthShooter );
	scoreText.setText( totalPrizeHits );
	timerText.setText( gameLevelTimer );

}

function fireButtonReleased() {
	console.log("fireButtonReleased!");
	laserLayerSprite1.visible = false;
	laserFiring = false;
	//1----if ( laserFiring) laserLayerTexture1.render(laserLayerSprite1, {x:0,y:0}, false, true);
	if ( laserTimerEvent ) {
		console.log("removing timer event");
		game.time.events.remove(laserTimerEvent);
	}
	if ( prizeHitEvent ) {
		console.log("removing prize hit event");
		game.time.events.remove(prizeHitEvent);
	}
	if ( prizeHitTweenArr.length > 0 ) {
		console.log("removing prize hit tween");
		prizeHitTweenArr.forEach(function(t) {
			t.stop();
		});
		prizeHitTweenArr = [];
	}

	setPrizeScale( prizeArr, 1 );
	resetObjectPositions( prizeArr );

	if ( !gameOver && !shooterDead ) {
		console.log("fireButtonReleased: saveShooterVelocityX="+saveShooterVelocityX);
		if ( saveShooterVelocityX != null ) {
			shooter1.body.velocity.setTo( saveShooterVelocityX, saveShooterVelocityY );
		}
	}
}

function laserTimerEventCallback() {
	if ( laserLayerSprite1.alpha == 1 ) {
		laserLayerSprite1.alpha = 0.1;
	} else {
		laserLayerSprite1.alpha = 1;
	}
}

function prizeHitTimerEventCallback() {
	if (prizeArr.length > 0) {
		var p = prizeArr[0];
		if (p.scale.x == 2) {
			setPrizeScale(prizeArr, 1);
		} else {
			setPrizeScale(prizeArr, 2);	
		}
	}

}
function setPrizeScale( aPrizeArr, scaleAmount ) {
	prizeArr.forEach(function(p) {
		p.scale.setTo(scaleAmount,scaleAmount);
	});
}

function drawLaserFrom( x0, y0, angle ) {
	
	console.log("drawLaserFrom!!!!")
	// laserSprite1.width = 1000;
	// laserSprite1.angle = angle;
	// laserSprite1.anchor.setTo(0,0);
	// laserSprite1.visible = true;
	// laserSprite1.x = x0+5;
	// laserSprite1.y = y0;

	//laserLayerTexture1.render(laserSprite1, {x:500,y:500}, false, true);

	laserLayerBM1.clear();
	//laserLayerBM1.clearRect(0,0,game.world.width,game.world.height);
	laserLayerBM1.setStrokeStyle(laserWidth);
	laserLayerBM1.strokeStyle('#f00');
	laserLayerBM1.beginPath();
	console.log("drawing line");
	
	var lx0,ly0;

	var calcuatedLineSegmentInfo;

	lx0 = x0;
	ly0 = y0;

	var isReflectingBack = false;

	laserLayerBM1.moveTo(lx0,ly0);

	// calcuatedLineSegmentInfo = calcLineSegment(shooterDirection(),lx0,ly0);
	// laserLayerBM1.lineTo(calcuatedLineSegmentInfo.x1, calcuatedLineSegmentInfo.y1);
	// isReflectingBack = calcuatedLineSegmentInfo.isReflectingBack;
	var laserDirection = shooterDirection();
	prizeArr = [];
	var numLaserBounces = 0;
	while ( !calcuatedLineSegmentInfo || !calcuatedLineSegmentInfo.isLastSegment ) {
		
		calcuatedLineSegmentInfo = calcLineSegment(laserDirection,lx0,ly0);

		laserLayerBM1.lineTo(calcuatedLineSegmentInfo.x1, calcuatedLineSegmentInfo.y1);
		
		isReflectingBack = calcuatedLineSegmentInfo.isReflectingBack;
		prizeArr = prizeArr.concat( calcuatedLineSegmentInfo.prizeArr );
		console.log("drawLaserFrom: calcuatedLineSegmentInfo.prizeArr.length="+calcuatedLineSegmentInfo.prizeArr.length);
		console.log("drawLaserFrom: prizeArr.length="+prizeArr.length);
		laserDirection = calcuatedLineSegmentInfo.laserReflectionDirection;
		lx0 = calcuatedLineSegmentInfo.x1;
		ly0 = calcuatedLineSegmentInfo.y1;
		if ( !calcuatedLineSegmentInfo.isLastSegment ) {
			numLaserBounces += 1;
		}
	}

	//laserLayerBM1.lineTo(x,y);
	//laserLayerBM1.lineTo(x,y);
	laserLayerBM1.moveTo(x0,y0);
	laserLayerBM1.closePath();
	laserLayerBM1.stroke();
	//laserLayerBM1.fillStyle('#f00');
	//laserLayerBM1.fill();
	
	// not sure if I need to do the below!
	if (false) laserLayerSprite1.loadTexture(laserLayerBM1); //<<<<1
	


	//1----laserLayerTexture1.render(laserLayerSprite1, {x:0,y:0}, true, true);

	//totalLaserBounces += numLaserBounces;

	console.log("drawLaserFrom: isReflectingBack="+isReflectingBack
		+", prizeArr.length="+prizeArr.length);
	return {isReflectingBack:isReflectingBack, numLaserBounces:numLaserBounces, prizeHitCount:prizeArr.length};
}

function clickListener() {
	console.log("input.x="+game.input.x+", input.y="+game.input.y);
	var r = hasShapeAt({x:game.input.x, y:game.input.y});
	if ( r && isShapeTriangle(r) ) {
		rotateTriangleReflector(r, false);
		//console.log("hasShapeAt xy ********");
	} else {
		//console.log("hasShapeAt returned nothing.");
	}
}

// given a direction (isUp, isDown, isRight, isLeft) and a co-ordinate
// calculate the array of xy points to be used to draw the laser line
// considering the reflections properly. Returns the next part of the line
// ...this function would need to be called n times until the whole
// bounced around laser line is all calculated
// if isReflectingBack is true then the shooter should get hit
// if isLastSegment is true then there are no more line segments to calculate
function calcLineSegment( direction, x0, y0 ) {
	console.log("calcLineSegment: IN");
	var r = {x0:x0, y0:y0, isReflectingBack:false, isLastSegment:true};
	var spriteCollide = firstSpriteHit( direction, x0, y0 );	
	if ( spriteCollide ) {
		console.log("calcLineSegment: spriteCollide!!!");
		var hitInfo = calcHitPoint( direction, spriteCollide, x0, y0 );
		r.x1 = hitInfo.x1;
		r.y1 = hitInfo.y1;
		r.isReflectingBack = hitInfo.isReflectingBack;
		r.isLastSegment = hitInfo.isLastSegment;
		r.laserReflectionDirection = hitInfo.laserReflectionDirection;
	} else {
		// no sprite is in the path
		// so the end point of the line is just
		// the limit of the game world
		console.log("calcLineSegment: spriteCollide!!!");
		var line = lineFromDirectionAndXY( direction, x0, y0);
		r.x1 = line.x1;
		r.y1 = line.y1;
	}

	// collect prizes on the calculated line (return this array with the other results)
	r.prizeArr = collectPrizesOnLine( direction, r.x0, r.y0, r.x1, r.y1 );
	console.log("calcLineSegment: r.prizeArr.lenth="+r.prizeArr.length);
	return r;
}

function collectPrizesOnLine( d, x0, y0, x1, y1 ) {
	var prizeArr = [];

	// for (var i=0; i < reflectorGroup1.length; i++) {
	// 	var shape = reflectorGroup1.getAt(i);
	// 	if ( shape.alive ) {
	// 		if ( !isShapeOnPath( d, shape, x0, y0 ) ) {
	// 			continue;
	// 		}
	console.log("collectPrizesOnLine: IN");
	prizeGroup.forEach(function (prize) {
		if ( prize.alive && isPrizeOnLine( prize, d, x0, y0, x1, y1 ) ) {
			console.log("collectPrizesOnLine: found prize x="+prize.x+", y="+prize.y);
			prizeArr.push( prize );
		}
	});
	console.log("collectPrizesOnLine: prizeArr.length="+prizeArr.length);
	return prizeArr;
}

function isPrizeOnLine( prize, d, x0, y0, x1, y1 ) {
	console.log("isPrizeOnLine: prize.x="+prize.x+", y="+prize.y+", d.isUp|d.isDown="+(d.isUp|d.isDown)+", x0="+x0+", y0="+y0+", x1="+x1+",y1="+y1);
	var dx, dy;
	var laserX = x0;
	var laserY = y0;
	var threshold = laserWidth/2 + prizeWidth/2;
	if ( d.isUp || d.isDown ) {
		if ( isBetween( prize.y, y0, y1 ) ) {
			if ( Math.abs(prize.x - laserX) < threshold ) {
				console.log("isPrizeOnLine: FOUND PRIZE!!! dx="+Math.abs(prize.x - laserX)+", laserX="+laserX+", prize.x="+prize.x+", prize.y="+prize.y+" is between y0="+y0+", y1="+y1);
				return true;
			}
		}
	} else {
		if ( isBetween(prize.x, x0, x1) ) {
			if ( Math.abs(prize.y - laserY) < threshold ) {
				console.log("isPrizeOnLine: FOUND PRIZE!!! dy="+Math.abs(prize.y - laserY)+", laserY="+laserY+", prize.y="+prize.x+", prize.x="+prize.x+" is between x0="+x0+", x1="+x1);
				return true;
			}
		}
	}
	return false;
}
function isBetween( x, a, b ) {
	return (a < x && x < b) || (a > x && x > b);
	//return (y0 < prize.y && prize.y < y1) || (y0 > prize.y && prize.y > y1);
}

function lineFromDirectionAndXY( direction, x, y ) {
	var line;
	if ( direction.isUp ) {
		line = {x0:x,y0:y,x1:x,y1:0}; // line to top of the world
	} else if ( direction.isDown ) {
		line = {x0:x,y0:y,x1:x,y1:game.world.height};
	} else if ( direction.isLeft ) {
		line = {x0:x,y0:y,x1:0,y1:y};
	} else {
		line = {x0:x,y0:y,x1:game.world.width,y1:y};
	}
	return line;
}

function isShapeTriangle( shape ) {
	if ( shape.name == "triangleReflector1" ) {
		return true;
	}
	return false;
}

// returns the point that the laser hits as x/y and also
// returns next laser direction info
// if the laser is reflecting back then isReflectingBack=true
// if the laser is absorbed then isReflectingBack=false
// if the laser is reflected in a new direction then 
//   laserReflectionDirection will indicate the new direction
function calcHitPoint( direction, spriteCollide, x0, y0 ) {
	var r = {isReflectingBack:false, isLastSegment:true};
	// default the laser reflection direction to be "no direction" (i.e. not reflected)
	r.laserReflectionDirection = {isUp:false,isDown:false,isLeft:false,isRight:false};
	var triangleHitDiagonalInfo;
	console.log("calcHitPoint: in");
	if ( isShapeTriangle(spriteCollide) ) {
		console.log("calcHitPoint: triangle");
		triangleHitDiagonalInfo = hitTriangleDiagonal(direction,x0,y0,spriteCollide);
		console.log("calcHitPoint: triangleHitDiagonalInfo.hitDiagonal="+triangleHitDiagonalInfo.hitDiagonal);
	}
	if ( isShapeTriangle(spriteCollide) && triangleHitDiagonalInfo.hitDiagonal ) {
		console.log("calcHitPoint: hitDiagonal***");
		r.isLastSegment = false;
		r.laserReflectionDirection = triangleHitDiagonalInfo.laserReflectionDirection;
		// determine the intersection point
		// between the triangleDiagonalLine and a line from x0/y0 in the given direction 
		// r.reflectingLineInfo
		r.x1 = triangleHitDiagonalInfo.hitPointXY.x;
		r.y1 = triangleHitDiagonalInfo.hitPointXY.y;
		console.log("calcHitPoint: triangle, diagonal, hitPointXY="+r.x1+"/"+r.y1);

	} else {
		// hit is on "flat" surface (i.e. box or non-diagonal triangle)

		if ( direction.isDown ) {
			r.x1 = x0;
			r.y1 = spriteCollide.y-50;
		} else if ( direction.isUp ) {
			r.x1 = x0;
			r.y1 = spriteCollide.y+50;
		} else if ( direction.isLeft ) {
			r.x1 = spriteCollide.x+50;
			r.y1 = y0;
		} else {
			r.x1 = spriteCollide.x-50;
			r.y1 = y0;
		}
		
		if ( spriteCollide.name == "boxReflector1" ) {
			r.isReflectingBack = true;
			r.laserReflectionDirection = invertLaserDirection(direction);
		}

	}

	return r;
}

function invertLaserDirection( inDirection ) {
	var invertedDirection = {isUp:false, isDown:false, isLeft:false, isRight:false};
	if ( inDirection.isUp ) {
		invertedDirection.isDown = true;
	}
	if ( inDirection.isDown ) {
		invertedDirection.isUp = true;
	}
	if ( inDirection.isLeft ) {
		invertedDirection.isRight = true;
	}
	if ( inDirection.isRight ) {
		invertedDirection.isLeft = true;
	}
	return invertedDirection;
}

// returns object with hitDiagonal=false if the direction towards the sprite 
//   is not towards the diagonal
// returns the diagonal line info and the reflectionDirection otherwise
// the return object has the following keys: 
//	- hitDiagonal, hitPointXY, reflectingLineInfo, laserReflectionDirection
//   where reflectingLineInfo has keys: x0,y0, x1,y1 which indicate the x/y points of the
//     reflecting diagonal line of the triangle
//     and laserReflectionDirection has keys: isUp, isDown, isLeft, isRight
function hitTriangleDiagonal(laserDirection, x0, y0, triangleSprite) {
	//return false; // fix this!!!
	var hitDiagonal = false;
	var r = {};
	var laserReflectionDirection = {isLeft:false,isRight:false,isUp:false,isDown:false};
	var diagonalInfo = {};
	var trd = triangleReflectDirection( triangleSprite );
	var hx,hy,dx,dy;
	if ( laserDirection.isDown && trd.isUp ) {
		hitDiagonal = true;

		if ( trd.isLeft ) {
			dx = triangleSprite.x - x0;
			hx = x0;
			hy = triangleSprite.y + dx;
			diagonalInfo.x0 = 1;
			diagonalInfo.y0 = -1;
			diagonalInfo.x1 = -1;
			diagonalInfo.y1 = 1;
			laserReflectionDirection.isLeft = true;
		} else {
			dx = x0 - triangleSprite.x;
			hx = x0;
			hy = triangleSprite.y + dx;
			diagonalInfo.x0 = -1;
			diagonalInfo.y0 = -1;
			diagonalInfo.x1 = 1;
			diagonalInfo.y1 = 1;
			laserReflectionDirection.isRight = true;
		}
	} else if ( laserDirection.isUp && trd.isDown ) {
		hitDiagonal = true;
		if ( trd.isLeft ) {
			dx = x0 - triangleSprite.x;
			hx = x0;
			hy = triangleSprite.y + dx;
			laserReflectionDirection.isLeft = true;
			diagonalInfo = {x0:-1,y0:-1,x1:1,y1:1};
		} else {
			dx = triangleSprite.x - x0;
			hx = x0;
			hy = triangleSprite.y + dx;
			laserReflectionDirection.isRight = true;
			diagonalInfo = {x0:1,y0:-1,x1:-1,y1:1};
		}
	} else if ( laserDirection.isLeft && trd.isRight ) {
		hitDiagonal = true;
		if ( trd.isUp ) {
			dy = y0 - triangleSprite.y;
			hx = triangleSprite.x + dy;
			hy = y0;
			laserReflectionDirection.isUp = true;
			diagonalInfo = {x0:-1,y0:-1,x1:1,y1:1};
		} else {
			dy = triangleSprite.y - y0;
			hx = triangleSprite.x + dy;
			hy = y0;
			laserReflectionDirection.isDown = true;
			diagonalInfo = {x0:1,y0:-1,x1:-1,y1:1};
		}
	} else if ( laserDirection.isRight && trd.isLeft ) {
		hitDiagonal = true;
		if ( trd.isUp ) {
			dy = triangleSprite.y - y0;
			hx = triangleSprite.x + dy;
			hy = y0;
			laserReflectionDirection.isUp = true;
			diagonalInfo = {x0:1,y0:-1,x1:-1,y1:1};
		} else {
			dy = y0 - triangleSprite.y;
			hx = triangleSprite.x + dy;
			hy = y0;
			laserReflectionDirection.isDown = true;
			diagonalInfo = {x0:-1,y0:-1,x1:1,y1:1};
		}
	}

	r.hitDiagonal = hitDiagonal;
	if (!hitDiagonal) return r;
	// setup the result object
	var triangleSpriteHalfWidth = triangleSprite.width / 2;
	r.laserReflectionDirection = laserReflectionDirection;
	r.hitPointXY = {x:hx,y:hy};
	r.reflectingLineInfo = 
		{
			x0: diagonalInfo.x0*triangleSpriteHalfWidth+triangleSprite.x, 
			y0: diagonalInfo.y0*triangleSpriteHalfWidth+triangleSprite.y, 
			x1: diagonalInfo.x1*triangleSpriteHalfWidth+triangleSprite.x, 
			y1: diagonalInfo.y1*triangleSpriteHalfWidth+triangleSprite.y
		};
	return r;
}

// returns the direction of the "normal" of the trianlge's reflecting diagonal 
function triangleReflectDirection( triangleSprite ) {
	var r = {up:false,down:false,left:false,right:false};
	if ( triangleSprite.angle == 0 ) {
		r.isUp = true;
		r.isRight = true;
	} else if ( triangleSprite.angle == -90 ) {
		r.isUp = true;
		r.isLeft = true;
	} else if ( triangleSprite.angle == 90 ) {
		r.isDown = true;
		r.isRight = true;
	} else {
		r.isDown = true;
		r.isLeft = true;
	}
	return r;
}

function firstSpriteHit( direction, x0, y0 ) {
	var objsOnPath = findObjectsOnPath( direction, x0, y0 );
	if ( objsOnPath.length == 0 ) return null;
	return objsOnPath.shift();
}

// returns an array of the shape objects in the path
// and sorted so that the closest shape is first
// ...the "path" this function considers is a straight 
// line from the inx0/iny0 coords
function findObjectsOnPath( d, inx0, iny0 ) {

	console.log("findObjectsOnPath: inx0="+inx0+", iny0="+iny0);

	var objsOnPath = [];

	xy0 = snapToShapeGrid({x:inx0,y:iny0});
	var x0 = xy0.x;
	var y0 = xy0.y;

	console.log("findObjectsOnPath: x0="+x0+", y0="+y0);

	var savedShape;
	for (var i=0; i < reflectorGroup1.length; i++) {
		var shape = reflectorGroup1.getAt(i);
		if ( shape.alive ) {
			if ( !isShapeOnPath( d, shape, x0, y0 ) ) {
				continue;
			}
			console.log("findObjectsOnPath: shape.x="+shape.x+", shape.y="+shape.y);
			objsOnPath.push( shape );
		}
	}

	console.log("findObjectsOnPath: after loop");

	// sort objsOnPath so that the top of the array is the closest to x0/y0
	objsOnPath.sort(function (a,b) {
		if ( d.isDown ) {
			return a.y - b.y;
		} else if ( d.isUp ) {
			return b.y - a.y;
		} else if ( d.isRight ) {
			return  a.x - b.x;
		}
		return b.x - a.x;
	});

	// for debugging...
	if ( objsOnPath.length > 0 ) {
		console.log("findObjectsOnPath: showing objsOnPath");
		for (var ii=0; ii < objsOnPath.length; ii++) {
			console.log("findObjectsOnPath: objsOnPath["+ii+"].x="+objsOnPath[ii].x+", .y="+objsOnPath[ii].y);
		}
	}
	return objsOnPath;
}

// x0/y0 are assumed to be snapped to the shape "grid"
function isShapeBelow( shape, x0, y0 ) {
	if ( shape.y > y0 && shape.x == x0 ) {
		return true;
	}
	return false;
}
function isShapeAbove( shape, x0, y0 ) {
	if ( shape.y < y0 && shape.x == x0 ) {
		return true;
	}
	return false;
}
function isShapeToTheRight( shape, x0, y0 ) {
	if ( shape.x > x0 && shape.y == y0 ) {
		return true;
	}
	return false;
}
function isShapeToTheLeft( shape, x0, y0 ) {
	if ( shape.x < x0 && shape.y == y0 ) {
		return true;
	}
	return false;
}
function isShapeOnPath( direction, shape, x0, y0 ) {
	if ( direction.isDown ) {
		return isShapeBelow( shape, x0, y0 );
	} else if ( direction.isUp ) {
		return isShapeAbove( shape, x0, y0 );
	} else if ( direction.isRight ) {
		return isShapeToTheRight( shape, x0, y0 );
	}
	return isShapeToTheLeft( shape, x0, y0 );
}

function shooterDirection() {
	var a = shooter1.angle;
	var d = {};
	if ( a == 0 ) {
		d.isRight = true;
	} else if ( a == -180 ) {
		d.isLeft = true;
	} else if ( a == 90 ) {
		d.isDown = true;
	} else {
		d.isUp = true;
	}
	//console.log("shooterDirection shooter1.angle="+a+", d="+d);
	return d;
}

function clickOnReflectorListener(sprite,pointer) {
	//console.log("sprite.name="+sprite.name)
	//console.log("sprite.x="+sprite.x+", y="+sprite.y);
	clickedOnSprite = sprite;
}

function reorientShooterAsNecessary() {

	var d = shooterDirection();

	var changed = false;
	if ( game.time.now > timeMarkerReorient ) {
		var saveVelocity = Math.abs(shooter1.body.velocity.x + shooter1.body.velocity.y);
		if ( shooter1.x > rightLimitX && d.isDown ) {
			changed = true;
			shooter1.angle = 180;
			shooter1.body.velocity.x = 0;
			shooter1.body.velocity.y = saveVelocity;
			shooter1.x = rightLimitX;
		} else if ( shooter1.y < topLimitY && d.isLeft ) {
			changed = true;
			shooter1.angle = 90;
			shooter1.body.velocity.x = -saveVelocity;
			shooter1.body.velocity.y = 0;
			shooter1.y = topLimitY;
		} else if ( shooter1.y > bottomLimitY && d.isLeft ) {
			changed = true;
			shooter1.angle = 270;
			shooter1.body.velocity.y = 0;
			shooter1.body.velocity.x = -saveVelocity;
			shooter1.y = bottomLimitY;
		} else if ( shooter1.x > rightLimitX && d.isUp ) {
			changed = true;
			shooter1.angle = 180;
			shooter1.body.velocity.x = 0;
			shooter1.body.velocity.y = -saveVelocity;
			shooter1.x = rightLimitX;
		} else if ( shooter1.x < leftLimitX && d.isUp ) {
			changed = true;
			shooter1.angle = 0;
			shooter1.body.velocity.x = 0;
			shooter1.body.velocity.y = -saveVelocity;
			shooter1.x = leftLimitX;
		} else if ( shooter1.y > bottomLimitY && d.isRight ) {
			changed = true;
			shooter1.angle = 270;
			shooter1.body.velocity.x = saveVelocity;
			shooter1.body.velocity.y = 0;
			shooter1.y = bottomLimitY;
		} else if ( shooter1.y < topLimitY && d.isRight ) {
			changed = true;
			shooter1.angle = 90;
			shooter1.body.velocity.x = saveVelocity;
			shooter1.body.velocity.y = 0;
			shooter1.y = topLimitY;
		} else if ( shooter1.x < leftLimitX && d.isDown ) {
			changed = true;
			shooter1.angle = 0;
			shooter1.body.velocity.x = 0;
			shooter1.body.velocity.y = saveVelocity;
			shooter1.x = leftLimitX;
		}
	}

	if ( changed ) {
		timeMarkerReorient = game.time.now + 200;
	}

	if ( d.isDown ) {
		shooter1.y = topLimitY;
	} else if ( d.isUp ) {
		shooter1.y = bottomLimitY;
	} else if ( d.isLeft ) {
		shooter1.x = rightLimitX;
	} else {
		shooter1.x = leftLimitX;
	}

	// var saveVelocity = shooter1.body.velocity.x + shooter1.body.velocity.y;
	// if ( shooter1.x > rightLimitX && shooter1.y == topLimitY ) {
	// 	shooter1.angle = 180;
	// 	shooter1.body.velocity.x = 0;
	// 	shooter1.body.velocity.y = saveVelocity;
	// 	shooter1.x = rightLimitX;
	// } else if ( shooter1.y < topLimitY && shooter1.x == rightLimitX ) {
	// 	shooter1.angle = 90;
	// 	shooter1.body.velocity.x = -saveVelocity;
	// 	shooter1.body.velocity.y = 0;
	// 	shooter1.y = topLimitY;
	// } else if ( shooter1.y > bottomLimitY && shooter1.x == rightLimitX ) {
	// 	shooter1.angle = 270;
	// 	shooter1.body.velocity.y = 0;
	// 	shooter1.body.velocity.x = -saveVelocity;
	// 	shooter1.y = bottomLimitY;
	// } else if ( shooter1.x > rightLimitX && shooter1.y == bottomLimitY ) {
	// 	shooter1.angle = 180;
	// 	shooter1.body.velocity.x = 0;
	// 	shooter1.body.velocity.y = -saveVelocity;
	// 	shooter1.x = rightLimitX;
	// } else if ( shooter1.x < leftLimitX && shooter1.y == bottomLimitY ) {
	// 	shooter1.angle = 0;
	// 	shooter1.body.velocity.x = 0;
	// 	shooter1.body.velocity.y = -saveVelocity;
	// 	shooter1.x = leftLimitX;
	// } else if ( shooter1.y > bottomLimitY && shooter1.x == leftLimitX ) {
	// 	shooter1.angle = 270;
	// 	shooter1.body.velocity.x = saveVelocity;
	// 	shooter1.body.velocity.y = 0;
	// 	shooter1.y = bottomLimitY;
	// } else if ( shooter1.y < topLimitY && shooter1.x == leftLimitX ) {
	// 	shooter1.angle = 90;
	// 	shooter1.body.velocity.x = saveVelocity;
	// 	shooter1.body.velocity.y = 0;
	// 	shooter1.y = topLimitY;
	// } else if ( shooter1.x < leftLimitX && shooter1.y == topLimitY ) {
	// 	shooter1.angle = 0;
	// 	shooter1.body.velocity.x = 0;
	// 	shooter1.body.velocity.y = saveVelocity;
	// 	shooter1.x = leftLimitX;
	// }
}

function snapToShapeGrid( xy ) {
	return {x:Phaser.Math.snapToFloor(xy.x,100)+50, y:Phaser.Math.snapToFloor(xy.y,100)+50};
}

function hasShapeAtXY( x, y ) {
	return hasShapeAt( {x:x,y:y} );
}
function hasShapeAt(xy) {
	xy0 = snapToShapeGrid(xy);
	var x0 = xy0.x;
	var y0 = xy0.y;
	console.log("hasShapeAt: x0="+x0+", y0="+y0)
	for (var i=0; i < reflectorGroup1.length; i++) {
		var shape = reflectorGroup1.getAt(i);
		if ( shape.alive ) {
			if ( x0 === shape.x && y0 === shape.y ) {
				console.log("found shape");
				return shape;
			}
		}
	}
}

// this function mischeiviously changes the locations of some or all of the deadly blue squares
function updateObjectPositions( objectsToMoveArr ) {
	// boxReflectorArr.forEach(function () {		
	// });
	console.log("updateBlueSquarePositions: IN");
	var b;
	var adjacentSpots;
	var limitSearchCount = 10;
	while ( true ) {
		b = Phaser.Math.getRandom( objectsToMoveArr );
		adjacentSpots = getFreeAdjacentLocations(b.x,b.y);
		if ( adjacentSpots.length > 0 ) break;
		if ( limitSearchCount <= 0 ) return;
		limitSearchCount -= 1;
	}

	var newLocationPoint = Phaser.Math.getRandom( adjacentSpots );
	console.log("updateBlueSquarePositions: moving blue box from x="+b.x+", y="+b.y+" to x="+newLocationPoint.x+", y="+newLocationPoint.y);

	//game.physics.moveToXY( b, newLocationPoint.x, newLocationPoint.y, 100 );
	game.add.tween(b).to({x:newLocationPoint.x, y:newLocationPoint.y}, 500, Phaser.Easing.Back.Out, true);
	if ( isShapeTriangle(b) ) {
		rotateTriangleReflector( b, true );
	}

	//game.add.tween(p).to({ x: 700 }, 1000, Phaser.Easing.Linear.None, true) .to({ y: 300 }, 1000, Phaser.Easing.Linear.None) .to({ x: 0 }, 1000, Phaser.Easing.Linear.None) .to({ y: 0 }, 1000, Phaser.Easing.Linear.None) .loop();

	//b.x = newLocationPoint.x;
	//b.y = newLocationPoint.y;
}

function getFreeAdjacentLocations( x, y ) {
	var locationPoints = [];
	if ( x-gridSize >= leftLimitX+gridSize && !hasShapeAtXY(x-gridSize,y) ) locationPoints.push({x:x-gridSize,y:y});
	if ( x+gridSize <= rightLimitX-gridSize && !hasShapeAtXY(x+gridSize,y) ) locationPoints.push({x:x+gridSize,y:y});
	if ( y-gridSize >= topLimitY+gridSize && !hasShapeAtXY(x,y-gridSize) ) locationPoints.push({x:x,y:y-gridSize});
	if ( y+gridSize <= bottomLimitY-gridSize && !hasShapeAtXY(x,y+gridSize) ) locationPoints.push({x:x,y:y+gridSize});
	return locationPoints;
}

function findEmptyGridLocation() {
	var rx, ry;
	var hasShapeAtRxRy;
	while (hasShapeAtRxRy || rx == null ) {
		rx = (Math.floor(Math.random() * numBlocksHorizontal)+1) * gridSize + gridSize/2;
		ry = (Math.floor(Math.random() * numBlocksVertical)+1) * gridSize + gridSize/2;
		hasShapeAtRxRy = hasShapeAt({x:rx,y:ry});
		//if (hasShapeAtRxRy) console.log("hasShapeAtRxRy=true, getting another rx/ry");
	}
	return {x:rx,y:ry};
}

function resetObjectPositions( objectsToMoveArr ) {
	objectsToMoveArr.forEach( function ( b ) {
		var point = findEmptyGridLocation();
		console.log("resetObjectPositions: b.x="+b.x+", b.y="+b.y+", point.x="+point.x+", point.y="+point.y);
		game.add.tween(b)
			.to({alpha:0}, 500, Phaser.Easing.Linear.None, true)
			.to({x:point.x,y:point.y}, 1, Phaser.Easing.Linear.None, true)
			.to({alpha:1}, 500, Phaser.Easing.Linear.None, true);

		// game.add.tween(b)
		// 	.to({alpha:0}, 500, Phaser.Easing.Linear.None, true)
		// 	.onComplete.add(function () {b.x=point.x; b.y=point.y;});
		// game.add.tween(b)
		// 	.to({alpha:1}, 500, Phaser.Easing.Linear.None, true, 1000);

		// b.x = point.x;
		// b.y = point.y;
	});
}

// finally
game.state.add('main', game_state.main);
game.state.start('main');
