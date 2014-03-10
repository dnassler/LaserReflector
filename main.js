var pixelRatio = window.devicePixelRatio;
var w = window.innerWidth ;//* pixelRatio,
    h = window.innerHeight ;//* pixelRatio;

// const SAFE_ZONE_WIDTH=2048;
// const SAFE_ZONE_HEIGHT=1536; //1344;
const SAFE_ZONE_WIDTH=1200;
const SAFE_ZONE_HEIGHT=900;

//var game = new Phaser.Game( (h > w) ? h : w, (h > w) ? w : h, Phaser.CANVAS, 'game_div');
var game = new Phaser.Game( SAFE_ZONE_WIDTH, SAFE_ZONE_HEIGHT, Phaser.AUTO, 'game_div');

var game_state = {};

var debug=0;


// define globals here

var nextUniqueShapeId = 0;

var gridSize = 100;
var halfGridSize = gridSize/2;

var shapeScale = 1;
var shapeWidth = 100;
var laserWidth = 10;
var prizeWidth = 34;

var numBlocksVertical;
var numBlocksHorizontal;

var gameLevelTimerEvent;
var hideIntroInfoTimer;
var introInfoGroup;
var introText;

var gameplayObjectsGroup; // holds whatever should only be visible when playing the game (i.e. the 'fire' button)
var fireButtonSprite;

var gameOverlayTextGroup; // this holds the text/buttons that overlays the game screen in-between games
var gameOverlayText; // part of the gameOverlayTextGroup this text will appear over game stage "Game Over", etc.
var gameHelpButton;

var gameStartingText; // shows GET READY message that is displayed at game restart

var timeMarkerUpdateBgTextGroup = 0;
var timeMarkerMoveBlueSquares = 0;
var timeMarkerMovePrizes = 0;
var timeMarkerTweakTriangles = 0;
var timeMarkerGameOver = 0;

var maxGameLevelTime = 99;
var maxHealthShooter = 5;

var timerTextTween = null;
var extraGameTimePerPrize = 2;
var gameLevelTimer;
var gameOver = true;
var shooterDead = true;

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
var blankSpaceBufferX = gridSize, blankSpaceBufferY = gridSize;

var cursors;

var clickedOnSprite;

var laserFiring = false;
var saveShooterVelocityX=0, saveShooterVelocityY=0;

var laserTimerEvent; // used to make the laser flash
var prizeHitEvent;

//var maxShooterVelocity = 300;
var defShooterVelocity = 200;
var shooterAcceleration = 300;

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

window.addEventListener('resize', function(event){
	resizeGame();
});

var resizeGame = function () {
  // var height = window.innerHeight;
  // var width = window.innerWidth;
//   console.log("resizeGame: width="+window.innerWidth);

// game.width = window.innerWidth;
// game.height = window.innerHeight;
//   game.world.width = window.innerWidth;
//   game.world.height = window.innerHeight;


  // game.stage.bounds.width = width;
  // game.stage.bounds.height = height;
 
  // if (game.renderType === 1) {
  //   game.renderer.resize(width, height);
  //   Phaser.Canvas.setSmoothingEnabled(game.context, false);
  // }
  // game.camera.setSize(width, height);

  // game.stage.scale.pageAlignHorizontally = true;
  // game.stage.scale.pageAlignVeritcally = true;
  // game.stage.scaleMode = Phaser.StageScaleMode.SHOW_ALL; //resize your window to see the stage resize too
	game.stage.scale.setShowAll();
	game.stage.scale.refresh();

}

game_state.main = function() {};
game_state.main.prototype = {

	preload: function() {
		
		// ==
		// sprite images...

		//game.load.image('boxReflector1', "assets/squareBlue1.png");
		game.load.spritesheet('boxReflector1', "assets/squareBlueSpritesheet.png", 100, 100);
		game.load.image('triangleReflector1', "assets/triangleWhite1_0.png");
		game.load.image('blocker1', "assets/square1.png");

		game.load.image('shooter1', "assets/triangleYellow1_0.png");

		game.load.image('redBall', "assets/redBall.png");
		game.load.image('laser1', "assets/laserTexture1.png");

		game.load.image('greenBox', "assets/greenBox.png");

		game.load.spritesheet('fireButton', 'assets/buttons/FireButton2Frames.png',200,200);
		game.load.spritesheet('helpButton', 'assets/buttons/HelpButtonFrames.png',100,100);

		// ==
		// sounds...

		//  Firefox doesn't support mp3 files, so use ogg
		game.load.audio('bgGrumble', 'assets/audio/SC_140301_123920.mp3');
		game.load.audio('sliding','assets/audio/sliding1.mp3');
		game.load.audio('slidingPrize','assets/audio/sliding2.mp3');
		game.load.audio('slidingTriangle','assets/audio/sliding3.mp3');

		game.load.audio('laserFired','assets/audio/shield-hit.mp3');
		game.load.audio('shooterDies','assets/audio/dramatic-fall-and-crash.mp3');
		game.load.audio('prizeHit','assets/audio/button-select.mp3');
		game.load.audio('gameStart','assets/audio/start-game.mp3');
		game.load.audio('gameOver','assets/audio/game-over.mp3');

		game.load.bitmapFont('pressStart2P','assets/fonts/Press_Start_2P/font.png', 'assets/fonts/Press_Start_2P/font.xml');

	},

	create: function() {

		gameOver = true;

		this.game.onPause.add(gamePaused, this);
		this.game.onResume.add(gameResumed, this);

		// ==

		// var lGameScale=Math.round(10000 * Math.min(game.width/SAFE_ZONE_WIDTH,game.height / SAFE_ZONE_HEIGHT)) / 10000;
		// var world= game.add.group ();
		// world.scale.setTo (lGameScale,lGameScale);
		// world.x=(game.width-SAFE_ZONE_WIDTH*lGameScale)/2;
		// world.y=(game.height-SAFE_ZONE_HEIGHT*lGameScale)/2;

		// ==

		game.stage.fullScreenScaleMode = Phaser.StageScaleMode.SHOW_ALL;
		//game.stage.scaleMode = Phaser.StageScaleMode.SHOW_ALL;
		game.stage.scale.setShowAll();
		game.stage.scale.pageAlignHorizontally = true;
		game.stage.scale.pageAlignVeritcally = true;
		game.stage.scale.refresh();

		numBlocksVertical = Math.floor(game.world.height/gridSize) - 2;
		numBlocksHorizontal = Math.floor(game.world.width/gridSize) -3;

		// sound

		audioBackground = game.add.audio('bgGrumble',1,true);
		if ( debug != 1 ) {
		  audioBackground.play('',0,1,true);
		}
		audioSliding = game.add.audio('sliding',0.25,true);
		audioSlidingPrize = game.add.audio('slidingPrize',0.1,true);
		audioSlidingTriangle = game.add.audio('slidingTriangle',0.25,true);

		audioLaserFired = game.add.audio('laserFired',0.75,true);
		audioShooterDies = game.add.audio('shooterDies',0.3,true);
		audioPrizeHit = game.add.audio('prizeHit',0.75,true);

		audioGameStart = game.add.audio('gameStart',0.75,true);
		audioGameOver = game.add.audio('gameOver',0.75,true);

		// ==

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
    	if ( shapeName == "triangleReflector1" ) {
    		s.angle = Math.floor(Math.random()*4)*90;
    	}
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
			var r = reflectorGroup1.add( createGameElement("boxReflector1"), false, false, 0 );
			//if ( i<2 ) {
			//	r.animations.add('flashSafeMode',[0,1,2], 1, true).play();
			//}
			r.animations.add('safeMode',[2,1], 1, false); // this is to be played when the user clicks on it
			r.animations.add('flashRed',[3,4], 4, true); // this is to be play'ed when hit with the laser
			r.events.onAnimationComplete.add(function (r) {
				r.frame=0;
			}, r);
			r.frame = 0;
			boxReflectorArr.push( r );
			allGridObjectsArr.push( r );
		}
		for (var i=0; i<5; i++) {
			var r = reflectorGroup1.add( createGameElement("blocker1") );
			allGridObjectsArr.push( r );
		}

		// add prizes
		prizeGroupArr = [];
		prizeGroup = game.add.group();
		for (var i=0; i<10; i++) {
			// do not allow the greenBox to be dragged
			var r = prizeGroup.add( createGameElement("greenBox", false, false) );
			r.wasHit = false;
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
		//game.input.onUp.add( touchListenerOnUp );

		fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		fireButton.onDown.add( fireButtonPressed );
		fireButton.onUp.add( fireButtonReleased );

		moveLeftKey = game.input.keyboard.addKey(Phaser.Keyboard.A);
		//moveLeftKey.onDown.add( moveLeft );
		moveRightKey = game.input.keyboard.addKey(Phaser.Keyboard.D);
		moveUpKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
		moveDownKey = game.input.keyboard.addKey(Phaser.Keyboard.S);

		game.input.keyboard.addKey(Phaser.Keyboard.BACKWARD_SLASH).onDown.add( fullscreenKeyPressed );

		// for debugging only...
		game.input.keyboard.addKey(Phaser.Keyboard.ZERO).onDown.add( 
			function () { scrambleAllObjects(); } );
		
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

		fireButtonSprite = game.add.button(game.world.width-200,game.world.height-200, "fireButton", null, this, 0,0,1);
		fireButtonSprite.onInputDown.add(fireButtonPressed);
		fireButtonSprite.onInputUp.add(fireButtonReleased);

		shooter1 = game.add.sprite(game.world.centerX, halfGridSize, "shooter1");
		shooter1.anchor.setTo(0.5,0.5);
		shooter1.visible = false;

		gameplayObjectsGroup = game.add.group();
		gameplayObjectsGroup.add( fireButtonSprite );
		gameplayObjectsGroup.visible = false;

		// scale the blocks/triangles/shooter appropriately
		if ( shapeScale != 1 ) {
			allGridObjectsArr.forEach(function(e){
				e.scale.setTo( shapeScale, shapeScale );
			});
			shooter1.scale.setTo( shapeScale, shapeScale );
		}

		// --
		rightLimitX = game.world.width - shooter1.width/2 - shooter1.width; //<<<<1
		topLimitY = shooter1.height / 2;
		bottomLimitY = game.world.height - shooter1.height/2;
		leftLimitX = shooter1.width/2;

		// --
		var style = { font: "50px PressStart2P", fill: "#ff0044", align: "center" };

    // scoreText.visible = true;
    // healthText.visible = true;
    // timerText.visible = true;

    finalScoreText = game.add.text( game.world.centerX, -500, "", { font: "600px Arial", fill: "#258acc", align: "center" });
		// finalScoreText = game.add.text( game.world.centerX, -500, "", { font: "600px Arial", fill: "#ffffff", align: "center", stroke: "#258acc", strokeThickness: 8 });
    // finalScoreText = game.add.text( game.world.centerX, -500, "", { font: "600px 'Press Start 2P'", fill: "#ff0044", align: "center", stroke: "#FFFFFF", strokeThickness: 8 });
    finalScoreText.anchor.setTo(0.5,0.5);
    finalScoreText.visible = false;

    // the gameOverlayTextGroup holds the in-between games/game-over text and help button
    gameOverlayTextGroup = game.add.group();
    gameOverlayText = game.add.bitmapText( game.world.centerX, 200, "", style );
    gameOverlayText.anchor.setTo(0.5,0);
    gameOverlayTextGroup.add( gameOverlayText );
    gameHelpButton = game.add.button(game.world.width-100,game.world.height-100, "helpButton", null, this, 0,0,2,0, gameOverlayTextGroup);
    gameHelpButton.onInputDown.add( helpButtonCallback );

    gameStartingText = game.add.bitmapText( game.world.centerX, game.world.centerY, "", style );
    gameStartingText.anchor.setTo(0.5,0.5);

    scoreText = game.add.bitmapText(game.world.width-10, 10, "", style);
    scoreText.anchor.setTo(1,0);
    healthText = game.add.bitmapText(game.world.width-10, 110, "", style);
    healthText.anchor.setTo(1,0);
    timerText = game.add.bitmapText(game.world.width-10, 210, "", style);
    timerText.anchor.setTo(1,0);

    introInfoGroup = game.add.group();
    introInfoGroup.visible = false;
    var blackBg = game.add.graphics(0,0);
    introInfoGroup.add( blackBg );
    blackBg.beginFill("0x000000", 0.7);
    blackBg.drawRect(0,0,game.width,game.height);
    // now draw a red laser around the perimeter of the game world
    //blackBg.setStrokeStyle(laserWidth);
    //blackBg.strokeStyle('#f00');
    
    var introPrize1 = game.add.sprite(halfGridSize,game.world.height-halfGridSize*3, "greenBox");
    introPrize1.anchor.setTo(0.5,0.5);
    introPrize1.scale.setTo(1,1);
    introInfoGroup.add( introPrize1 );
    var introPrize2 = game.add.sprite(game.world.centerX, game.world.height-halfGridSize, "greenBox");
    introPrize2.anchor.setTo(0.5,0.5);
    introPrize2.scale.setTo(1,1);
    introInfoGroup.add( introPrize2 );
    var introPrize3 = game.add.sprite(game.world.width-halfGridSize, 5*halfGridSize, "greenBox");
    introPrize3.anchor.setTo(0.5,0.5);
    introPrize3.scale.setTo(1,1);
    introInfoGroup.add( introPrize3 );

    blackBg.lineStyle(10, 0xFF0000, 1);
    blackBg.moveTo(halfGridSize,halfGridSize);
    blackBg.lineTo(game.world.width-halfGridSize,halfGridSize);
    blackBg.lineTo(game.world.width-halfGridSize,game.world.height-halfGridSize);
    blackBg.lineTo(halfGridSize,game.world.height-halfGridSize);
    blackBg.lineTo(halfGridSize,halfGridSize+gridSize*3);

    // *** add graphics to the intro screen (i.e. show the pieces)
    //blackBg.alpha = 0.1;
    var introShooter = game.add.sprite(halfGridSize,halfGridSize, "shooter1");
    introShooter.anchor.setTo(0.5,0.5);
    introInfoGroup.add( introShooter );
    var introTri1 = game.add.sprite(game.world.width-halfGridSize,halfGridSize, "triangleReflector1");
    introTri1.anchor.setTo(0.5,0.5);
    introTri1.angle=180;
    introInfoGroup.add( introTri1 );
    var introTri2 = game.add.sprite(game.world.width-halfGridSize,game.world.height-halfGridSize, "triangleReflector1");
    introTri2.anchor.setTo(0.5,0.5);
    introInfoGroup.add( introTri2 );
    introTri2.angle=270;
    var introTri3 = game.add.sprite(halfGridSize,game.world.height-halfGridSize, "triangleReflector1");
    introTri3.anchor.setTo(0.5,0.5);
    introInfoGroup.add( introTri3 );
		var introBlocker = game.add.sprite(halfGridSize,3*gridSize+halfGridSize, "blocker1");
    introBlocker.anchor.setTo(0.5,0.5);
    introInfoGroup.add( introBlocker );
    var introReflector = game.add.sprite(halfGridSize,2*gridSize+halfGridSize, "boxReflector1");
    introReflector.anchor.setTo(0.5,0.5);
    introInfoGroup.add( introReflector );
    
		//var introStyle = { font: "20px PressStart2P", fill: "#ff0044", align: "left" };
		var introStyle = { font: "20px PressStart2P", fill: "#ffffff", align: "left" };
    introText = game.add.bitmapText( 120, game.world.centerY, "",	introStyle );
    introText.anchor.setTo(0,0.5);
    introInfoGroup.add( introText );

    game.time.events.add(Phaser.Timer.SECOND*2, function () {
    	introText.setText(
    		"Welcome to LAZOR REFLEKTOR!!!\n"
    		+ "\n"
    		+ "The object of the game is to fire your laser\n"
    		+ "and try to hit the green prize boxes without\n"
    		+ "hitting a blue reflector box because they\n"
    		+ "will bounce the laser back along its path and\n"
    		+ "kill you. The triangle shaped reflectors will\n"
    		+ "bounce the laser and change it’s path. And\n"
    		+ "the white boxes will absorb/block the laser.\n"
    		+ "\n"
    		+ "You can temporarily neutralize a blue reflector\n"
    		+ "box by touching it (or clicking it). A laser \n"
    		+ "beam that hits a neutralized box will not reflect\n"
    		+ "backwards and so is safe to hit (but only very \n"
    		+ "briefly).\n"
    		+ "\n"
    		+ "You may drag the triangle reflectors around\n"
    		+ "but they will rotate as you do so.\n"
    		+ "\n"
    		+ "Each prize hit will add to your score and will \n"
    		+ "add 2 seconds of game time. The more times the \n"
    		+ "laser is bounced around by the triangle \n"
    		+ "reflectors, the more points per prize hit. But \n"
    		+ "the more likely you will accidentally hit a blue \n"
    		+ "reflector and so be killed.\n"
    		+ "\n"
    		+ "The game is over when all 5 player lives are\n"
    		+ "lost or when you run out of time, whichever \n"
    		+ "comes first.\n"
    		+ "\n"
    		+ "Feel free to leave comments or suggestions at\n"
    		+ "lazor.reflektor@gmail.com\n"
    		);
    	gameOverlayText.setText("LAZOR REFLEKTOR!!!\n\n\n\nGAME OVER\n\ntouch or press spacebar\nto start");
    	//showIntroInfo();
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
			timeMarkerMovePrizes = game.time.now + Math.random()*5000 + 5000;
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

		//game.debug.renderSpriteInfo(shooter1,10,600);
		
    // game.debug.renderText("w="+w+", h="+h+", window.devicePixelRatio="+window.devicePixelRatio,10,10);
    // game.debug.renderText("game.width="+game.width+", game.height="+game.height,10,50);
    // game.debug.renderText("screen.width="+screen.width+", screen.height="+screen.height,10,100);

	}

}

function gamePaused() {
	audioBackground.pause();
}
function gameResumed() {
	audioBackground.resume();
}

function helpButtonCallback() {
	console.log("helpButtonCallback: about to show intro info");
	showIntroInfo();
	console.log("helpButtonCallback: OUT");
}

function updateGameLevelTimer() {
	if ( gameOver ) return;
	if ( debug == 1 ) return;

	gameLevelTimer -= 1;
	timerText.setText(gameLevelTimer.toString());

	console.log("updateGameLevelTimer gameLevelTimer="+gameLevelTimer);

	if ( gameLevelTimer <= 0 ) {
		
		// play sound (game over)
		audioGameOver.play();

		gameLevelTimeout();
	} else if ( gameLevelTimer == 10 ) {
		timerTextTween = game.add.tween(timerText).to({alpha:0},100,Phaser.Easing.Linear.None,true)
		.to({alpha:1},100,Phaser.Easing.Linear.None,true,0,100,true);
	} else if ( gameLevelTimer > 10 ) {
		if ( timerTextTween != null && timerTextTween.isRunning ) {
			console.log("*************** stopping tween");
			timerTextTween.stop();
		}
	}
}

function rotateTriangleReflector( r, randomRotate ) {
	var newAngle;
	if ( randomRotate ) {
		newAngle = Math.floor(Math.random() * 4) * 90;
	} else {
		newAngle = Phaser.Math.snapToFloor(r.angle,90) + 90;
	}
	//r.angle = newAngle;
	game.add.tween(r).to({angle:newAngle}, 500, Phaser.Easing.Linear.None, true)
		.onComplete.add(function(){
			r.angle = Phaser.Math.snapToFloor(r.angle, 90);
		}, this);
}

function fullscreenKeyPressed() {
		game.stage.scale.startFullScreen();
}

function createGameElement( shapeName, canRotate, canDrag, frameNum ) {
	
	//console.log("in createGameElement");

	var rx, ry;
	var pointEmpty = findEmptyGridLocation();
	rx = pointEmpty.x;
	ry = pointEmpty.y;
	console.log("createGameElement: pointEmpty.x="+pointEmpty.x+", pointEmpty.y="+pointEmpty.y);

	var shape = game.add.sprite( rx, ry, shapeName, frameNum );
	shape.shapeId = nextUniqueShapeId++;
	shape.anchor.setTo(0.5,0.5);
	// if ( shapeName === "triangleReflector1" ) {
	// 	shape.body.setPolygon( 0,0, 100,100, 0,100 );
	// }
	
	if ( canRotate ) {
		shape.angle = Math.floor(Math.random() * 4) * 90;
		// shape.body.translate( -50,-50 );
		// shape.body.polygon.rotate(shape.rotation);
		// shape.body.translate( 50, 50 );
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
	
	var toX = Phaser.Math.snapToFloor( reflectorSprite.x, gridSize ) + halfGridSize;
	var toY = Phaser.Math.snapToFloor( reflectorSprite.y, gridSize ) + halfGridSize;

	// check if the snapped to spot is ok to drop to (i.e. there is no existing sprite there that is not itself)
	console.log("\n\n\nfixSnapLocationReflector: IN reflectorSprite.shapeId="+reflectorSprite.shapeId+", toX="+toX+", toY="+toY);
	var shapeAtXY = hasShapeAtXY(toX,toY);
	if ( shapeAtXY ) console.log("fixSnapLocationReflector: hasShapeAtXY(toX,toY)="+shapeAtXY.shapeId);
	
	var freeLocation;
	if ( !shapeAtXY || shapeAtXY.shapeId == reflectorSprite.shapeId) {
		freeLocation = {x:toX,y:toY};
	} else {
		freeLocation = tryGetNearbyLocation( toX, toY );
	}

	reflectorSprite.x = freeLocation.x;
	reflectorSprite.y = freeLocation.y;
}

function fireButtonPressed() {

	console.log("fireButtonPressed IN");

	// since the SPACEBAR is used to start the gameplay (as well as shooting the laser)
	// we need to do a few checks to decide if we need to restart the game 
	// or to shoot the laser.
	if ( !gameOver && shooterDead ) {
		console.log("fireButtonPressed: ignoring because the shooter is dead")
		return;
	}
	if ( gameOver || shooterDead ) {
		if ( game.time.now > timeMarkerGameOver ) {
			// the user pressed the fire button after a game over occurred after
			// a preset amount of time
			restartGame();
			return;
		}
		console.log("fireButtonPressed: game is over or the shooter is dead so ignoring the fire button");
		return;
	}
	console.log("fireButtonPressed: shooter must not be dead. shooterDead="+shooterDead);

	laserFiring = true;

	// play sound!
	audioLaserFired.play();

	//laserLayerTexture1sprite.visible = true;
	saveShooterVelocityX = shooter1.body.velocity.x;
	saveShooterVelocityY = shooter1.body.velocity.y;
	console.log("\n\n\n\n\n\n*************\nfireButtonPressed: setting saveShooterVelocityX="+saveShooterVelocityX+", shooter1.body.velocity.x="+shooter1.body.velocity.x);

	shooter1.body.velocity.setTo(0,0);

	var x0 = shooter1.x;
	var y0 = shooter1.y;
	// var aBall = balls.getFirstDead();
	// aBall.reset( x0, y0 );
	// //aBall.body.velocity.y = 200;
	// var theShootingAngle = shooter1.angle;
	// game.physics.velocityFromAngle( theShootingAngle, 400, aBall.body.velocity);
	var r = drawLaserFrom( x0, y0, shooter1.angle );

	console.log("\nfireButtonPressed: after drawLaserFrom\n\n\n");

	laserLayerSprite1.visible = true;
	laserLayerSprite1.alpha = 1;

	if ( r.isReflectingBack ) {
		console.log("adding timer event");
		laserTimerEvent = game.time.events.loop(100, laserTimerEventCallback, this);
		if ( debug != 1 ) totalHealthShooter -= 1;
	}
	if ( r.prizeArr.length > 0 ) {

		// play sound!
		audioPrizeHit.play();

		// game.add.tween(b)
		// 	.to({alpha:0}, 500, Phaser.Easing.Linear.None, true)

		r.prizeArr.forEach(function(p) {
			// prizeHitTweenArr.push( 
			// 	game.add.tween(p.scale)
			// 		.to({x:2,y:2}, 100, Phaser.Easing.Linear.None, true, 0, 5, true)
			// 		.to({x:1,y:1}, 100, Phaser.Easing.Linear.None, true, 0)
			// 		.loop() );
			
			// increase the game time for each prize hit
			gameLevelTimer += extraGameTimePerPrize;

			// flash the prizes that were hit by the laser!
			p.wasHit = true;
			game.add.tween(p.scale)
				.to({x:2,y:2}, 100, Phaser.Easing.Linear.None, true, 0, 5, true);
			game.add.tween(p)
				.to({alpha:0}, 500, Phaser.Easing.Linear.None, true)
				.onComplete.add( function () {
					var point = findEmptyGridLocation();
					p.wasHit = false;
					p.scale.setTo(1,1); // sometimes this is called too early and the scale is reset by the above tween
					p.x = point.x;
					p.y = point.y;
					game.add.tween(p)
						.to({alpha:1}, 500, Phaser.Easing.Linear.None, true)
						.onComplete.add( function () {
							p.scale.setTo(1,1);
						});
				}, this);
		});

		//prizeHitEvent = game.time.events.loop(200, prizeHitTimerEventCallback, this);

		totalPrizeHits += r.hitScore; //r.prizeArr.length * (r.numLaserBounces + 1);
	}

	// update score/health displayed
	healthText.setText( totalHealthShooter.toString() );
	scoreText.setText( totalPrizeHits.toString() );

	if ( r.isReflectingBack ) {
		var d = shooterDirection();
		if ( d.isUp || d.isDown ) {
			game.add.tween(shooter1)
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
				.to( { x: '-10' }, 50, Phaser.Easing.Linear.None, true, 0, 0, true)
				.to( { x: '+10' }, 50, Phaser.Easing.Linear.None, true, 0, 0, true)
				.onComplete.add( shooterDies, this );
		} else {
			game.add.tween(shooter1)
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
				.to( { y: '-10' }, 50, Phaser.Easing.Linear.None, true, 0, 0, true)
				.to( { y: '+10' }, 50, Phaser.Easing.Linear.None, true, 0, 0, true)
				.onComplete.add( shooterDies, this );
		}
	}

}

function fireButtonReleased() {
	if ( !laserFiring ) return;
	console.log("fireButtonReleased!");
	laserLayerSprite1.visible = false;
	laserFiring = false;
	//1----if ( laserFiring) laserLayerTexture1.render(laserLayerSprite1, {x:0,y:0}, false, true);
	if ( laserTimerEvent ) {
		console.log("removing timer event");
		game.time.events.remove(laserTimerEvent);
		laserTimerEvent = null;
	}
	// if ( prizeHitEvent ) {
	// 	console.log("removing prize hit event");
	// 	game.time.events.remove(prizeHitEvent);
	// }

	//resetObjectPositions( prizeArr );

	if ( !gameOver && !shooterDead ) {
		console.log("fireButtonReleased: saveShooterVelocityX="+saveShooterVelocityX);
		if ( saveShooterVelocityX != null ) {
			shooter1.body.velocity.setTo( saveShooterVelocityX, saveShooterVelocityY );
		}
	}
}

function shooterDies() {
  //game.add.tween(shooter1).to( { scale: 0 }, 2000, Phaser.Easing.Linear.None, true);
  shooterDead = true;
  fireButtonReleased();

	game.add.tween(shooter1).to( { alpha: 0 }, 2000, Phaser.Easing.Linear.None, true, 500);
	if ( totalHealthShooter > 0 ) {
		// play sound of shooter dying (but not yet dead)
		audioShooterDies.play();
		game.time.events.add(3000, restartLevel, this);
	} else {
		// play sound of shooter dying (game over)
		audioShooterDies.play();
		gameLevelTimeout();
	}
}

function gameLevelTimeout() {
	gameOver = true;
	shooterDead = true; // shooter is considered "dead" unless it is alive
	if ( gameLevelTimerEvent ) {
			game.time.events.remove(gameLevelTimerEvent);
			gameLevelTimerEvent = null;
	}
	shooter1.visible = false;

	console.log("************** GAME OVER *****************");
	// calculate final score based on the number of hits combined with the shooter health
	var totalScore = totalPrizeHits + Math.floor(totalPrizeHits * totalHealthShooter / maxHealthShooter);
	finalScoreText.visible = true;
	finalScoreText.setText( totalScore );
	game.add.tween(finalScoreText).to({y:game.world.centerY}, 1000, Phaser.Easing.Back.Out, true);
	
	game.time.events.add(Phaser.Timer.SECOND*2, function () {
		gameOverlayTextGroup.visible = true;
		gameplayObjectsGroup.visible = false;
	}, this);

	timeMarkerGameOver = game.time.now + 2000;

	//game.time.events.add(Phaser.Timer.SECOND * 20, showIntroInfo, this);
}

function showIntroInfo() {
	if ( debug==1 ) return;
	if ( !gameOver ) return;
	console.log("showIntroInfo: IN");
	gameOverlayTextGroup.visible = false;
	introInfoGroup.visible = true;
	finalScoreText.visible = false;
	hideIntroInfoTimer = game.time.events.add(Phaser.Timer.SECOND * 60, hideIntroInfo, this);
}

function hideIntroInfo() {
	if ( !gameOver ) return;
	console.log("hideIntroInfo: IN");
	if ( hideIntroInfoTimer ) {
		game.time.events.remove(hideIntroInfoTimer);
		hideIntroInfoTimer = false;
	}
	gameOverlayTextGroup.visible = true;
	introInfoGroup.visible = false;
	gameOverlayTextGroup.visible = true;
	//game.time.events.add(Phaser.Timer.SECOND * 10, showIntroInfo, this);
}

function isShowingIntroInfo() {
	return introInfoGroup.visible;
}

function restartGame() {

	gameOver = false;
	scrambleAllObjects();

	introInfoGroup.visible = false;
	gameOverlayTextGroup.visible = false;
	gameplayObjectsGroup.visible = true;

	finalScoreText.visible = false;
	finalScoreText.y = -500;
	finalScoreText.setText("");

	totalHealthShooter = maxHealthShooter;
	totalPrizeHits = 0;
	gameLevelTimer = maxGameLevelTime;

	healthText.setText( totalHealthShooter.toString() );
	scoreText.setText( totalPrizeHits.toString() );
	timerText.setText( gameLevelTimer.toString() );
	timerText.alpha = 1;

	gameStartingText.setText("GET READY!\n\n3");
	gameStartingText.visible = true;

	game.time.events.add(Phaser.Timer.SECOND, function () {
			gameStartingText.setText("GET READY!\n\n2");
	}, this);
	game.time.events.add(Phaser.Timer.SECOND*2, function () {
			gameStartingText.setText("GET READY!\n\n1");
	}, this);

	// maybe put all of the below logic in timer to go after 3 seconds
	game.time.events.add(Phaser.Timer.SECOND*3, function() {
		// play sound
		audioGameStart.play();

		gameStartingText.visible = false;
		restartLevel();
		if ( gameLevelTimerEvent ) {
				game.time.events.remove(gameLevelTimerEvent);
		}
		gameLevelTimerEvent = game.time.events.loop(Phaser.Timer.SECOND, updateGameLevelTimer, this);
		timeMarkerMoveBlueSquares = game.time.now + 1000;
		timeMarkerMovePrizes = game.time.now + 2000;
		timeMarkerTweakTriangles = game.time.now + 2000;
		
	}, this);

}

function restartLevel() {
	var topOrBottom = [topLimitY, bottomLimitY];
	var isDownOrIsUp = [90,270];
	var movingLeftOrRight = [-defShooterVelocity, defShooterVelocity];
	saveShooterVelocityX = null;
	saveShooterVelocityY = null;
	shooterDead = false;
	shooter1.visible = true;
	shooter1.alpha = 1;
  shooter1.angle = Phaser.Math.getRandom(isDownOrIsUp);
  shooter1.x = game.world.centerX;
  shooter1.y = Phaser.Math.getRandom(topOrBottom); //topLimitY;
  shooter1.body.angularVelocity = 0;
  shooter1.body.acceleration.setTo(0,0);
  shooter1.body.velocity.setTo(0,0);
	shooter1.body.velocity.x = Phaser.Math.getRandom(movingLeftOrRight); //-defShooterVelocity; // make the direction random left/right
	// also make the starting side random (top/bottom)

	healthText.setText( totalHealthShooter.toString() );
	scoreText.setText( totalPrizeHits.toString() );
	timerText.setText( gameLevelTimer.toString() );
	timerText.alpha = 1;

}

function laserTimerEventCallback() {
	if ( laserLayerSprite1.alpha == 1 ) {
		laserLayerSprite1.alpha = 0.1;
	} else {
		laserLayerSprite1.alpha = 1;
	}
}

// function prizeHitTimerEventCallback() {
// 	if (prizeArr.length > 0) {
// 		var p = prizeArr[0];
// 		if (p.scale.x == 2) {
// 			setPrizeScale(prizeArr, 1);
// 		} else {
// 			setPrizeScale(prizeArr, 2);	
// 		}
// 	}

// }
// function setPrizeScale( aPrizeArr, scaleAmount ) {
// 	aPrizeArr.forEach(function(p) {
// 		p.scale.setTo(scaleAmount,scaleAmount);
// 	});
// }

function drawLaserFrom( x0, y0, angle ) {
	
	if ( debug==1) console.log("\n\n\n\n\n\n-----------------------------------------\ndrawLaserFrom: IN")

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
	var prizeArr = [];
	var numLaserBounces = 0;
	
	// this is the accumulated prize hit score where prizes are worth more depending 
	// on the number of bounces needed to reach them
	var hitScore = 0;
	
	while ( !calcuatedLineSegmentInfo || !calcuatedLineSegmentInfo.isLastSegment ) {
		
		if ( debug == 1 ) console.log(
			"drawLaserFrom: in while, "
			+ "numLaserBounces="+numLaserBounces
			+ ", laserDirection="+stringForDir(laserDirection)
			+ ", lx0="+lx0+", ly="+ly0
			);

		calcuatedLineSegmentInfo = calcLineSegment(laserDirection,lx0,ly0);

		laserLayerBM1.lineTo(calcuatedLineSegmentInfo.x1, calcuatedLineSegmentInfo.y1);
		
		isReflectingBack = calcuatedLineSegmentInfo.isReflectingBack;

		prizeArr = prizeArr.concat( calcuatedLineSegmentInfo.prizeArr );
		hitScore += calcuatedLineSegmentInfo.prizeArr.length * (numLaserBounces+1);

		//console.log("drawLaserFrom: calcuatedLineSegmentInfo.prizeArr.length="+calcuatedLineSegmentInfo.prizeArr.length);
		//console.log("drawLaserFrom: prizeArr.length="+prizeArr.length);

		laserDirection = calcuatedLineSegmentInfo.laserReflectionDirection;

		if ( debug == 1 ) console.log(
			"drawLaserFrom: in while after calcLineSegment, "
			+ ", laserReflectionDirection="+stringForDir(laserDirection)
			+ ", calcuatedLineSegmentInfo.x1="+calcuatedLineSegmentInfo.x1+", y1="+calcuatedLineSegmentInfo.y1
			+ ", isLastSegment="+calcuatedLineSegmentInfo.isLastSegment
		);

		lx0 = calcuatedLineSegmentInfo.x1;
		ly0 = calcuatedLineSegmentInfo.y1;
		if ( !calcuatedLineSegmentInfo.isLastSegment ) {
			numLaserBounces += 1;
		}

	}

	//laserLayerBM1.lineTo(x,y);
	//laserLayerBM1.lineTo(x,y);

	//laserLayerBM1.moveTo(x0,y0);
	//laserLayerBM1.closePath();

	laserLayerBM1.stroke();

	//laserLayerBM1.fillStyle('#f00');
	//laserLayerBM1.fill();
	
	// not sure if I need to do the below!
	// if (false) laserLayerSprite1.loadTexture(laserLayerBM1);
	//1----laserLayerTexture1.render(laserLayerSprite1, {x:0,y:0}, true, true);

	console.log("drawLaserFrom: OUT isReflectingBack="+isReflectingBack);

	return {isReflectingBack:isReflectingBack, numLaserBounces:numLaserBounces, hitScore:hitScore, prizeArr:prizeArr};
}

function touchListenerOnUp() {
	if ( laserFiring ) {
		fireButtonReleased();
	}
}

function clickListener() {
	console.log("\n\nclickListener: IN***");

	if (gameOver) {
		if ( isShowingIntroInfo() ) {
			hideIntroInfo();
		} else {
			// clicking anywhere (above the help button) on the surface will start the game
			if (game.input.y < game.world.height-100) {
						fireButtonPressed();
			}
		}
		
	}

	// console.log("clickListener: input.x="+game.input.x+", input.y="+game.input.y);
	var sp = snapToShapeGrid( {x:game.input.x,y:game.input.y} );
	console.log("clickListener: snapped to x="+sp.x+", y="+sp.y);

	// if ( game.input.y > bottomLimitY - shapeWidth/2 ) {
	// 	// only fire the button if the surface was touched at the bottom of the screen
	// 	fireButtonPressed();
	// 	return;
	// }

	var r = hasShapeAt({x:game.input.x, y:game.input.y});

	// if ( r ) {
	// 	// console.log("clickListener: hasShapeAt returned a shape: shapeName="+r.name+", r.x="+r.x+", r.y="+r.y);
	// 	// debugging...
	// 	var adjacentSpots = getFreeAdjacentLocations(r.x, r.y);
	// 	// console.log("clickListener: get free adjacent locations relative to x="+r.x+", y="+r.y+"... found "+adjacentSpots.length);
	// 	// adjacentSpots.forEach( function ( p ) { 
	// 		// console.log( "clickListener: free spot at point.x="+p.x+", point.y="+p.y ); 
	// 	// } );
	// // } else {
	// // 	console.log("clickListener: hasShapeAt returned NOTHING. Checking adjacent spots...");
	// // 	var adjacentSpots = getFreeAdjacentLocations(sp.x, sp.y);
	// // 	console.log("clickListener: get free adjacent locations relative to sp.x="+sp.x+", sp.y="+sp.y+"... found "+adjacentSpots.length);
	// // 	adjacentSpots.forEach( function ( p ) { 
	// // 		console.log( "clickListener: free spot at point.x="+p.x+", point.y="+p.y ); 
	// // 	} );
	// }

	if ( r ) {
		if ( isShapeTriangle(r) ) {
			// make sure that the triangle isn't in the process of rotating
			console.log("clickListener: clicked on triangle");
			if ( r.angle == Phaser.Math.snapToFloor(r.angle, 90) ) {
				rotateTriangleReflector(r, false);
			} else {
				console.log("clickListener: the triangle is rotating!!!!!!! Ignoring the click!")
			}
		} else if ( r.name == "boxReflector1" ) {
			r.play("safeMode");
		}
	}
	console.log("clickListener: OUT\n\n\n");
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
		console.log("calcLineSegment: sprite found for line segment! sprite.x="+spriteCollide.x+", sprite.y="+spriteCollide.y+", sprite.angle="+spriteCollide.angle);
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
		if (debug==1) console.log("calcLineSegment: no sprite collision, so go to edge of the world");
		var line = lineFromDirectionAndXY( direction, x0, y0);
		r.x1 = line.x1;
		r.y1 = line.y1;
	}

	// collect prizes on the calculated line (return this array with the other results)
	r.prizeArr = collectPrizesOnLine( direction, r.x0, r.y0, r.x1, r.y1 );
	if (debug==1) console.log("calcLineSegment: r.prizeArr.lenth="+r.prizeArr.length);
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
		if ( prize.alive && !prize.wasHit && isPrizeOnLine( prize, d, x0, y0, x1, y1 ) ) {
			console.log("collectPrizesOnLine: found prize x="+prize.x+", y="+prize.y);
			prizeArr.push( prize );
		}
	});
	console.log("collectPrizesOnLine: OUT  prizeArr.length="+prizeArr.length);
	return prizeArr;
}

function isShapeOnPath2( shape, d, x0, y0 ) {
	var line = lineFromDirectionAndXY( d, x0, y0 );
	return isPrizeOrShapeOnLine( shape, shapeWidth, d, x0, y0, line.x1, line.y1 );
}
function isPrizeOnLine( prize, d, x0, y0, x1, y1 ) {
	return isPrizeOrShapeOnLine( prize, prizeWidth, d, x0, y0, x1, y1, true );
}

function isPrizeOrShapeOnLine( obj, sw, d, x0, y0, x1, y1, isPrizeSearch ) {
	//console.log("isPrizeOrShapeOnLine: obj.x="+obj.x+", y="+obj.y+", d.isUp|d.isDown="+(d.isUp|d.isDown)+", x0="+x0+", y0="+y0+", x1="+x1+",y1="+y1);
	//var dx, dy;
	if ( debug==1 ) 
		console.log("isPrizeOrShapeOnLine: "
			+ "obj.name="+obj.name+", obj.x="+obj.x+", obj.y="+obj.y
			+ ", sw="+sw
			+ ", d="+stringForDir(d)
			+ ", x0="+x0+", y0="+y0+", x1="+x1+", y1="+y1
			+ ", isPrizeSearch="+isPrizeSearch);
	
	if ( Math.abs(obj.x-x0) < sw/2 && Math.abs(obj.y-y0) < sw/2 ) {
		// ignore this "obj" because we are starting our line from within it!
		if ( debug==1 ) console.log("isPrizeOrShapeOnLine: ignore obj");
		return false; 
	}
	var laserX = x0;
	var laserY = y0;
	var threshold = laserWidth/2 + sw/2;
	if ( d.isUp || d.isDown ) {
		if ( isBetween( obj.y, y0, y1, threshold) ) {
			if ( Math.abs(obj.x - laserX) < threshold ) {
				//console.log("isPrizeOrShapeOnLine: FOUND PRIZE/SHAPE !!! dx="+Math.abs(obj.x - laserX)+", laserX="+laserX+", obj.x="+obj.x+", obj.y="+obj.y+" is between y0="+y0+", y1="+y1);
				return true;
			}
		}
	} else {
		if ( isBetween(obj.x, x0, x1, threshold) ) {
			if ( Math.abs(obj.y - laserY) < threshold ) {
				//console.log("isPrizeOrShapeOnLine: FOUND PRIZE/SHAPE!!! dy="+Math.abs(obj.y - laserY)+", laserY="+laserY+", obj.y="+obj.x+", obj.x="+obj.x+" is between x0="+x0+", x1="+x1);
				return true;
			}
		}
	}
	return false;
}

// is x between a and b or near to b within threshold
function isBetween( x, a, b, threshold ) {
	return ((a-threshold) < x && x < (b+threshold)) || ((a+threshold) > x && x > (b-threshold));
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
	if (debug==1) console.log("calcHitPoint: in");
	if ( isShapeTriangle(spriteCollide) ) {
		if (debug==1) console.log("calcHitPoint: triangle");
		triangleHitDiagonalInfo = hitTriangleDiagonal(direction,x0,y0,spriteCollide);
		if (debug==1) console.log("calcHitPoint: triangleHitDiagonalInfo.hitDiagonal="+triangleHitDiagonalInfo.hitDiagonal);
	}
	if ( isShapeTriangle(spriteCollide) && triangleHitDiagonalInfo.hitDiagonal ) {
		if (debug==1) console.log("calcHitPoint: hitDiagonal***");
		r.isLastSegment = false;
		r.laserReflectionDirection = triangleHitDiagonalInfo.laserReflectionDirection;
		// determine the intersection point
		// between the triangleDiagonalLine and a line from x0/y0 in the given direction 
		// r.reflectingLineInfo
		r.x1 = triangleHitDiagonalInfo.hitPointXY.x;
		r.y1 = triangleHitDiagonalInfo.hitPointXY.y;
		if (debug==1) console.log("calcHitPoint: triangle, diagonal, hitPointXY="+r.x1+"/"+r.y1);

	} else {
		// hit is on "flat" surface (i.e. box or non-diagonal triangle)

		var halfShapeWidth = shapeWidth/2;
		if ( direction.isDown ) {
			r.x1 = x0;
			r.y1 = spriteCollide.y-halfShapeWidth;
		} else if ( direction.isUp ) {
			r.x1 = x0;
			r.y1 = spriteCollide.y+halfShapeWidth;
		} else if ( direction.isLeft ) {
			r.x1 = spriteCollide.x+halfShapeWidth;
			r.y1 = y0;
		} else {
			r.x1 = spriteCollide.x-halfShapeWidth;
			r.y1 = y0;
		}
		
		if ( spriteCollide.name == "boxReflector1" ) {
			//var currentFrame = spriteCollide.animations.getAnimation('safeMode').frame;
			var currentFrame = spriteCollide.frame;
			var animation = spriteCollide.animations.getAnimation('safeMode');
			if (debug==1) console.log("!!!!!!!******** boxReflector1 isPlaying="+animation.isPlaying+", frame="+currentFrame);
			if ( currentFrame == 0 && !animation.isPlaying ) {
				r.isReflectingBack = true;
				spriteCollide.play('flashRed');
				game.time.events.add(1000, function() {
					spriteCollide.animations.getAnimation('flashRed').stop();
					spriteCollide.frame = 0;
				});
			}
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
function findObjectsOnPath( d, x0, y0 ) {

	//console.log("findObjectsOnPath: inx0="+inx0+", iny0="+iny0);

	var objsOnPath = [];

	// xy0 = snapToShapeGrid({x:inx0,y:iny0});
	// var x0 = xy0.x;
	// var y0 = xy0.y;

	if ( debug == 1 ) {
		console.log("findObjectsOnPath: IN  "+stringForDir(d)+", x0="+x0+", y0="+y0);
	}

	for (var i=0; i < reflectorGroup1.length; i++) {
		var shape = reflectorGroup1.getAt(i);
		if ( shape.alive ) {
			if ( !isShapeOnPath2( shape, d, x0, y0 ) ) {
				continue;
			}
			//console.log("findObjectsOnPath: shape.x="+shape.x+", shape.y="+shape.y);
			objsOnPath.push( shape );
		}
	}

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
	// if ( objsOnPath.length > 0 ) {
	// 	console.log("findObjectsOnPath: showing objsOnPath");
	// 	for (var ii=0; ii < objsOnPath.length; ii++) {
	// 		console.log("findObjectsOnPath: objsOnPath["+ii+"].x="+objsOnPath[ii].x+", .y="+objsOnPath[ii].y);
	// 	}
	// }

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
		if ( debug==1 ) console.log("reorientShooterAsNecessary: saveVelocity="+saveVelocity+", velocity.x="+velocity.x+", velocity.y="+velocity.y);
		if ( saveVelocity == 0 ) {
			// normally this does not happen however it could if the user fires the laser a just the right moment which stops the shooter
			if ( debug==1 ) console.log("reorientShooterAsNecessary: do nothing!!!");
			return;
		}
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
	return {x:Phaser.Math.snapToFloor(xy.x,gridSize)+halfGridSize, y:Phaser.Math.snapToFloor(xy.y,gridSize)+halfGridSize};
}

function hasShapeAtXY( x, y ) {
	return hasShapeAt( {x:x,y:y} );
}
function hasShapeAt(xy) {
	// console.log("hasShapeAt: IN");
	var xy0 = snapToShapeGrid(xy);
	var x0 = xy0.x;
	var y0 = xy0.y;
	// console.log("hasShapeAt: x0="+x0+", y0="+y0);
	for (var i=0; i < allGridObjectsArr.length; i++) {
		var shape = allGridObjectsArr[i];
		if ( shape.alive ) {
			if ( x0 === shape.x && y0 === shape.y ) {
				// console.log("hasShapeAt: found shape.x="+shape.x+", shape.y="+shape.y+", name="+shape.name);
				return shape;
			}
		}
	}
	// console.log("hasShapeAt: OUT - found none... returning false");
	return false;
}

function shapeCountAtLocation( x, y ) {
	var shapes = findShapesAt( x, y );
	return shapes.length;
}

// return all shapes at the specified location
function findShapesAt( x, y ) {
	var shapesAtLocation = [];
	allGridObjectsArr.forEach(
		function( shape ) {
			if ( shape.alive && x == shape.x && y == shape.y ) {
				shapesAtLocation.push( shape );
			}
		}
	);
	return shapesAtLocation;
}

function updateSingleObjectPosition( b ) {

	var adjacentSpots = getFreeAdjacentLocations(b.x,b.y);
	if ( adjacentSpots.length == 0 ) return;

	var newLocationPoint = Phaser.Math.getRandom( adjacentSpots );
	//console.log("updateBlueSquarePositions: moving blue box from x="+b.x+", y="+b.y+" to x="+newLocationPoint.x+", y="+newLocationPoint.y);

	//game.physics.moveToXY( b, newLocationPoint.x, newLocationPoint.y, 100 );
	game.add.tween(b).to({x:newLocationPoint.x, y:newLocationPoint.y}, 500, Phaser.Easing.Back.Out, true)
		.onComplete.add(function() {
				// check that the location moved to doesn't have more than one occupant (i.e. this could occur if another 
				// object moved there within the last 500ms). Count the number of objects at the new location and if there 
				// is more than one then move this piece again.
				console.log("updateSingleObjectPosition: completed move, checking if need to move again");
				var count = shapeCountAtLocation( newLocationPoint.x, newLocationPoint.y );
				if ( count > 1 ) {
					console.log("updateSingleObjectPosition: moving shape again");
					updateSingleObjectPosition( b );
				} else {
					console.log("updateSingleObjectPosition: did not need to move again")
				}
			}, this);
	if ( isShapeTriangle(b) ) {
		audioSlidingTriangle.play();
		rotateTriangleReflector( b, true );
	} else if ( b.name == 'greenBox' ) {
		audioSlidingPrize.play();
	} else {
		audioSliding.play();
	}

}

// this function mischeiviously changes the locations of some or all of the deadly blue squares
function updateObjectPositions( objectsToMoveArr ) {
	if ( debug==1 ) return;
	var b = Phaser.Math.getRandom( objectsToMoveArr );
	updateSingleObjectPosition( b );
}

function tryGetNearbyLocation( x, y ) {
	var freeLocation;

	var adjacentSpots = getFreeAdjacentLocations( x, y );
	if ( adjacentSpots.length > 0 ) {
		return Phaser.Math.getRandom( adjacentSpots );
	}

	adjacentSpots = getFreeAdjacentDiagonalLocations( x, y );
	if ( adjacentSpots.length > 0 ) {
		return Phaser.Math.getRandom( adjacentSpots );
	}
	
	// nothing at or adjacent so pick a random location
	return findEmptyGridLocation();
}

function getFreeAdjacentLocations( x, y ) {
	var locationPoints = [];
	if ( x-gridSize >= leftLimitX+gridSize && !hasShapeAtXY(x-gridSize,y) ) locationPoints.push({x:x-gridSize,y:y});
	if ( x+gridSize <= rightLimitX-gridSize && !hasShapeAtXY(x+gridSize,y) ) locationPoints.push({x:x+gridSize,y:y});
	if ( y-gridSize >= topLimitY+gridSize && !hasShapeAtXY(x,y-gridSize) ) locationPoints.push({x:x,y:y-gridSize});
	if ( y+gridSize <= bottomLimitY-gridSize && !hasShapeAtXY(x,y+gridSize) ) locationPoints.push({x:x,y:y+gridSize});

	return locationPoints;
}

function getFreeAdjacentDiagonalLocations( x, y ) {
	var locationPoints = [];
	if ( x-gridSize >= leftLimitX+gridSize && y-gridSize >= topLimitY+gridSize && !hasShapeAtXY(x-gridSize,y-gridSize) ) {
		locationPoints.push({x:x-gridSize,y:y-gridSize});
	}
	if ( x+gridSize <= rightLimitX-gridSize && y+gridSize <= bottomLimitY-gridSize && !hasShapeAtXY(x+gridSize,y+gridSize) ) {
		locationPoints.push({x:x+gridSize,y:y+gridSize});
	}
	if ( x-gridSize >= leftLimitX+gridSize && y+gridSize <= bottomLimitY-gridSize && !hasShapeAtXY(x-gridSize,y+gridSize) ) {
		locationPoints.push({x:x-gridSize,y:y+gridSize});
	}
	if ( x+gridSize <= rightLimitX-gridSize && y-gridSize >= topLimitY+gridSize && !hasShapeAtXY(x+gridSize,y-gridSize) ) {
		locationPoints.push({x:x+gridSize,y:y-gridSize});
	}
	return locationPoints;
}

function findEmptyGridLocation() {
	var rx, ry;
	var hasShapeAtRxRy;
	while (hasShapeAtRxRy || rx == null ) {
		rx = (Math.floor(Math.random() * numBlocksHorizontal)+1) * gridSize + halfGridSize;
		ry = (Math.floor(Math.random() * numBlocksVertical)+1) * gridSize + halfGridSize;
		hasShapeAtRxRy = hasShapeAt({x:rx,y:ry});
		//if (hasShapeAtRxRy) console.log("hasShapeAtRxRy=true, getting another rx/ry");
	}
	return {x:rx,y:ry};
}

function scrambleAllObjects() {
		allGridObjectsArr.forEach(function (b) {
			b.alive = false;
		});
		// create new arrangements
		allGridObjectsArr.forEach(function (b) {
			var point = findEmptyGridLocation();
			b.x = point.x;
			b.y = point.y;
			b.alive = true;
		});
}

// function scrambleAllObjects() {
// 	//allGridObjectsArr, 
// 	//prizeGroup (prizeGroupArr), reflectorGroup1

// 	// first "push" away all of the current objects
// 	game.add.tween(prizeGroup).to({y:game.world.height+10}, 500, Phaser.Easing.Linear.None, true);
// 	game.add.tween(reflectorGroup1).to({y:game.world.height+10}, 500, Phaser.Easing.Linear.None, true, 500);

// 	game.time.events.add(Phaser.Timer.SECOND, function() {
// 		console.log("**************1111 prizeGroup.y="+prizeGroup.y);
// 		allGridObjectsArr.forEach(function (b) {
// 			//b.visible = false;
// 			b.alive = false;
// 		});
// 		// create new arrangements
// 		allGridObjectsArr.forEach(function (b) {
// 			var point = findEmptyGridLocation();
// 			b.x = point.x;
// 			b.y = point.y;
// 			b.alive = true;
// 		});
// 		console.log("**************2222 prizeGroup.y="+prizeGroup.y);
// 	});

// 	// now bring in the new arrangement
// 	game.add.tween(prizeGroup).to({y:0}, 500, Phaser.Easing.Linear.None, true, 1000);
// 	game.add.tween(reflectorGroup1).to({y:0}, 500, Phaser.Easing.Linear.None, true, 1500);
// }

// the following function is not used
function resetObjectPositions( objectsToMoveArr ) {
	objectsToMoveArr.forEach( function ( b ) {
		var point = findEmptyGridLocation();
		console.log("resetObjectPositions: b.x="+b.x+", b.y="+b.y+", point.x="+point.x+", point.y="+point.y);
		b.scale.setTo(1,1);
		game.add.tween(b)
			.to({alpha:0}, 500, Phaser.Easing.Linear.None, true)
			.to({x:point.x,y:point.y}, 1, Phaser.Easing.Linear.None, true)
			.to({alpha:1}, 500, Phaser.Easing.Linear.None, true, 500);

		// game.add.tween(b)
		// 	.to({alpha:0}, 500, Phaser.Easing.Linear.None, true)
		// 	.onComplete.add(function () {b.x=point.x; b.y=point.y;});
		// game.add.tween(b)
		// 	.to({alpha:1}, 500, Phaser.Easing.Linear.None, true, 1000);

		// b.x = point.x;
		// b.y = point.y;
	});
}

function stringForDir(d) {
	if ( !d ) return "direction NONE";
	if ( d.isUp ) return "direction isUp";
	if ( d.isDown ) return "direction isDown";
	if ( d.isLeft ) return "direction isLeft";
	if ( d.isRight) return "direction isRight";
}

// finally
game.state.add('main', game_state.main);
game.state.start('main');
