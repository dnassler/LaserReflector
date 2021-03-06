var pixelRatio = window.devicePixelRatio;
var w = window.innerWidth ;//* pixelRatio,
    h = window.innerHeight ;//* pixelRatio;
var lw, lh; //landscape width/height in pixels
if ( h > w ) {
	lw = h;
	lh = w;
} else {
	lw = w;
	lh = h;
}
var aspectRatioDevice = lw/lh;

// const SAFE_ZONE_WIDTH=2048;
// const SAFE_ZONE_HEIGHT=1536; //1344;
const SAFE_ZONE_WIDTH=1200;
const SAFE_ZONE_HEIGHT=900;

var aspectRatioSafeZone = SAFE_ZONE_WIDTH / SAFE_ZONE_HEIGHT;
var extraWidth = 0, extraHeight = 0;
if (aspectRatioSafeZone < aspectRatioDevice) {
	// have to add game pixels vertically in order to fill the device screen
	extraWidth = aspectRatioDevice * SAFE_ZONE_HEIGHT - SAFE_ZONE_WIDTH;
} else {
	// have to add game pixels horizontally
	extraHeight = SAFE_ZONE_WIDTH / aspectRatioDevice - SAFE_ZONE_HEIGHT;
}

//var game = new Phaser.Game( (h > w) ? h : w, (h > w) ? w : h, Phaser.CANVAS, 'game_div');
//var game = new Phaser.Game( SAFE_ZONE_WIDTH, SAFE_ZONE_HEIGHT, Phaser.AUTO, 'game_div');
var game = new Phaser.Game( SAFE_ZONE_WIDTH + extraWidth, SAFE_ZONE_HEIGHT + extraHeight, Phaser.CANVAS, 'game_div');

var game_state = {};

var debug=0;


// define globals here

var doneInit = false;

var nextUniqueShapeId = 0;
var currentClickedShape = null;

var gridSize = 100;
var halfGridSize = gridSize/2;

var shapeScale = 1;
var shapeWidth = 100;
var laserWidth = 10;
var laserTrailWidth = 5;
var prizeWidth = 34;
var laserPathId = 0; // each laser fire path will have it's own id
var laserTrailTween;

var numBlocksVertical;
var numBlocksHorizontal;

var clockTimer = null;
//var gameLevelTimerEvent;
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
var timeMarkerMoveTimeBomb = 0;
var timeMarkerTweakTriangles = 0;
var timeMarkerGameOver = 0;
var timeMarkerShowRedBoxes = 0;
var timeMarkerHideRedBoxes = 0;
var timeMarkerShuffleBlueReflectors = 0;
var timeMarkerShuffleAllReflectors = 0;
var timeMarkerCheckIfLaserFiredRecently = 0;

var maxGameLevelTime = 99;
var maxHealthShooter = 5;

var timerTextTween = null;
var extraGameTimePerPrize = 1;
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

var laserTrailBM; 		// holds the laser trail left after a laser firing
var laserTrailSprite; // holds the laser trail left after a laser firing

var laserTextureSprite1;
var laserLayerTexture1;
var laserLayerTexture1sprite;
var prettyBackgroundLayer1;

var reflectorGroup1;
var blankSpaceBufferX = gridSize, blankSpaceBufferY = gridSize;

var cursors;

//var clickedOnSprite;

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
var basicPrizeGroupArr;
var triangleGroupArr;

var allGridObjectsArr;

var shapeNameArr;

var prizeHitTweenArr;

var timeToLaunchTimeBomb;
var timeBombGroup;
var timeBombArr = [];

var specialPrizesArr = [];

var timeBombTextGroup;

var timeBombTimerInfo = {};

var redBoxGroup;
var redBoxArr = [];

// var explosionBM;
// var explosionSprite;

var stopLaserFiringTimerHandle;

var savedGameTime = 0;
var savedGameTimeAtLastRestartLevel = 0;
var savedGameTimeAtLastPrizeHit = 0;
var savedGameTimeAtLastLaserFiring = 0;
var savedGameTimeAtLastComment = 0;
var savedGameTimeAtLastCommentOfType = {};
var savedPrizeHitCountPerShotArr = [];
var savedPrizeHitScorePerSuccessfulShotArr = [];

// the following array holds some timers that may be used in the after 
// game/pre-game sequence but when the game is started these must be stopped
//var nonPlayModeTimersActiveArr = [];

var msgDieHardArr = ["That's Unfortunate!", "You Can't Win Them All!", "Ouch!!!", "Oh Well!"];
var msgDieEasyArr = ["Try Harder!", "Were You Even Looking?", "Come On!", "Are You Sleeping OK?", "Don't You Care?"];
var msgDieEasyWithPrize = ["Are You Distracted?", "Look Beyond Your Target!", "Be Careful!"];
var msgDieEasyWithTimeBomb = ["You Meant That?", "So Sad!"]
var msgDie1BounceWithPrizeArr = ["Didn't You See That?", "Be More Careful!", "Don't Be Lazy!","Was It Worth It?"];
var msgDie1BounceWithoutPrizeArr = ["You Can Do Better!", "Look Further Ahead!", "Don't Be Slopy!"];
var msgEasyLowHits = ["Go For More!", "Go Big Or Go Home!", "Little More Effort!", "Why Not Be Daring?", "Take A Risk!", "Not Bad But..."];
var msgRiskyGood = ["I Like!", "Interesting!", "Bravo!", "Pretty Good!", "Good Stuff!", "Awesome!", "Pretty Slick!"];
var msg2BouncesOkay = ["That Was Not Bad.", "Not Bad, My Friend.", "Doing Well.", "I'm Liking Your Style.", "I See Skill."];
var msgNoShotsRecently = ["I'm Waiting...", "Be Bolder, Hmm?", "Don't Be Afraid, Shoot!", "Taking It Easy?", "Fire That Laser!", "Don't Just Observe", "Take Action.", "Aim And Shoot!", "Is There A Pattern?", "Try Moving Triangles...", "Rotate A Triangle...", "Impress Me!"];

// <<<<3 NOTE the following 3 are not yet used... need to add logic to check for appropriate conditions
var msgDieAfterNoShotsRecently = ["Sorry!!!","Oh Well...","That Can Happen...","Watchout Next Time!"];
var msgDieAfterRiskyGood = ["Good Effort!", "Stay Sharp!", "It's Tough I Know."];
var msgDieAfter2BouncesOkay = ["Life Is Unpredictable...", "Keep Trying!"];

//var msgNoShotsRecently = ["Is There A Pattern?"];
var msgShootingNoHits = ["Having Fun?", "Cool Your Jets!", "Don't Waste Laser Power!", "Relax A Bit!", "You Like That Laser?", "Calm Down, My Friend", "Try Harder, Won't You?"];
var msgShootingNoHitsSlow = ["Take Aim Then Fire!", "You Need More Practice!", "You'll Get Better.", "Effort Brings Reward.", "Don't Give Up!","Touch A Blue Box...","Move A Triangle...", "Impress Me, Come On!"];

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
	game.scale.setShowAll();
	game.scale.refresh();

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

		game.load.image('textMinus25', "assets/textMinus25.png");

		game.load.spritesheet('fireButton', 'assets/buttons/FireButton2Frames.png',200,200);
		game.load.spritesheet('helpButton', 'assets/buttons/HelpButtonFrames.png',100,100);

		game.load.spritesheet('timeBomb', createSpritesheetTimeBomb(), gridSize, gridSize);

		game.load.spritesheet('greenBox10', createSpritesheetPrize10Points(), gridSize, gridSize);
		game.load.spritesheet('greenBox10time', createSpritesheetPrize10Seconds(), gridSize, gridSize);

		//game.load.image('redBox', createSpritesheetPrizeUnlockChallenge1() );
		game.load.spritesheet('redBox', createSpritesheetPrizeUnlockChallenge1(), gridSize, gridSize);

		// game.load.image('greenBox10', "assets/greenBox10.png");
		// game.load.image('greenBox10time', "assets/greenBox10time.png");

		// ==
		// sounds...

		//  Firefox doesn't support mp3 files, so use ogg
		//game.load.audio('bgGrumble', 'assets/audio/SC_140301_123920.mp3');
		game.load.audio('sliding','assets/audio/sliding1.mp3');
		game.load.audio('slidingPrize','assets/audio/sliding2.mp3');
		game.load.audio('slidingTriangle','assets/audio/sliding3.mp3');

		game.load.audio('laserFired','assets/audio/shield-hit.mp3');
		game.load.audio('shooterDies','assets/audio/dramatic-fall-and-crash.mp3');
		game.load.audio('prizeHit','assets/audio/button-select.mp3');
		game.load.audio('gameStart','assets/audio/start-game.mp3');
		game.load.audio('gameOver','assets/audio/game-over.mp3');

		game.load.audio('timeBombExplode','assets/audio/Randomize136.mp3');
		game.load.audio('timeBombLaunched', 'assets/audio/Powerup19.mp3');
		game.load.audio('timeBombArm3', 'assets/audio/Pickup_Coin34.mp3');

		game.load.audio('redBoxesHit', 'assets/audio/Pickup_Coin60b.mp3');

		game.load.bitmapFont('pressStart2P','assets/fonts/Press_Start_2P/font.png', 'assets/fonts/Press_Start_2P/font.xml');

	},

	create: function() {

		game.physics.startSystem(Phaser.Physics.ARCADE);

		gameOver = true;

		this.game.onPause.add(gamePaused, this);
		this.game.onResume.add(gameResumed, this);

		clockTimer = game.time.create(false);
		clockTimer.loop(1000, updateGameLevelTimer, this);

		// ==

		// var lGameScale=Math.round(10000 * Math.min(game.width/SAFE_ZONE_WIDTH,game.height / SAFE_ZONE_HEIGHT)) / 10000;
		// var world= game.add.group ();
		// world.scale.setTo (lGameScale,lGameScale);
		// world.x=(game.width-SAFE_ZONE_WIDTH*lGameScale)/2;
		// world.y=(game.height-SAFE_ZONE_HEIGHT*lGameScale)/2;

		// ==

		game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
		game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		//game.stage.scaleMode = Phaser.StageScaleMode.SHOW_ALL;
		game.scale.setShowAll();
		game.scale.pageAlignHorizontally = true;
		game.scale.pageAlignVeritcally = true;
		game.scale.refresh();

		numBlocksVertical = Math.floor(SAFE_ZONE_HEIGHT/gridSize) - 2;
		numBlocksHorizontal = Math.floor(SAFE_ZONE_WIDTH/gridSize) -3;

		// --
		rightLimitX = SAFE_ZONE_WIDTH + extraWidth/2 - halfGridSize - gridSize;
		topLimitY = halfGridSize + extraHeight/2;
		bottomLimitY = SAFE_ZONE_HEIGHT + extraHeight/2 - halfGridSize;
		leftLimitX = extraWidth/2 + halfGridSize;

		// sound

		// audioBackground = game.add.audio('bgGrumble',1,true);
		// if ( debug != 1 ) {
		//   audioBackground.play('',0,1,true);
		// }
		audioSliding = game.add.audio('sliding',0.25,false);
		audioSlidingPrize = game.add.audio('slidingPrize',0.1,false);
		audioSlidingTriangle = game.add.audio('slidingTriangle',0.25,false);

		audioLaserFired = game.add.audio('laserFired',0.75,false);
		audioShooterDies = game.add.audio('shooterDies',1,false);
		audioPrizeHit = game.add.audio('prizeHit',0.75,false);

		audioGameStart = game.add.audio('gameStart',0.75,false);
		audioGameOver = game.add.audio('gameOver',0.75,false);

		audioTimeBombExplode = game.add.audio('timeBombExplode',1,false);
		audioTimeBombLaunched = game.add.audio('timeBombLaunched',0.5,false);
		audioTimeBombArm3 = game.add.audio('timeBombArm3',0.5,false);

		audioRedBoxesHit = game.add.audio('redBoxesHit',0.75,false);
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
    	// var x = Math.random()*game.world.width - 100;
    	// var y = Math.random()*game.world.height;
    	var x = game.world.randomX-100;
    	var y = game.world.randomY;

    	//console.log("bgDecorationGroup1: x=",x,", y=",y);
    	var shapeName = Phaser.Math.getRandom( shapeNameArr );
    	var s = game.add.sprite(x,y,shapeName);
    	game.physics.enable(s, Phaser.Physics.ARCADE);
    	s.checkWorldBounds = true;
    	s.anchor.setTo(0.5,0.5);
    	if ( shapeName == "triangleReflector1" ) {
    		s.angle = Math.floor(Math.random()*4)*90;
    	}
    	var rscale = Math.random()*2 + 1;
    	s.scale.setTo(rscale,rscale);
    	
			s.body.velocity.x = (20 * rscale/2.0);
    	s.body.velocity.y = (40 * rscale/2.0);
    	//s.x = x;
    	//x.y = y;
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
		for (var i=0; i<15; i++) {
			var r = createGameElement("triangleReflector1", true);
			reflectorGroup1.add( r );

			r.inputEnabled = true;
			//shape.input.start(0,true);
			r.input.enableDrag();
			//shape.input.enableSnap(50,50,false,true );
			r.events.onDragStart.add(function(s) { 
				s.saveShapeOriginalPositionX = s.x;
				s.saveShapeOriginalPositionY = s.y;
				s.isReflectorBeingDragged = true;
				if ( debug === 20140420 ) console.log("s.shapeId=",s.shapeId);
				currentClickedShape = s;
			});
			r.events.onDragStop.add(fixSnapLocationReflector);
			r.gameTimeOfLastManualMove = 0;

			//r.events.onInputUp.add(clickOnTriangleReflectorListener, this);	
			triangleGroupArr.push( r );
			allGridObjectsArr.push( r );
		}
		boxReflectorArr = [];
		for (var i=0; i<5; i++) {
			var r = createGameElement("boxReflector1", false, 0 );
			reflectorGroup1.add( r );
			r.inputEnabled = true;
			r.events.onInputDown.add(clickOnBoxReflectorListener, this);	
			r.animations.add('safeMode',[2,1], 1, false); // this is to be played when the user clicks on it
			r.animations.add('flashRed',[3,4], 4, true); // this is to be play'ed when hit with the laser
			r.events.onAnimationComplete.add(function (r) {
				r.frame=0;
			}, r);
			r.frame = 0;
			boxReflectorArr.push( r );
			allGridObjectsArr.push( r );
		}
		for (var i=0; i<0; i++) {
			var r = reflectorGroup1.add( createGameElement("blocker1") );
			allGridObjectsArr.push( r );
		}

		// add prizes
		prizeGroupArr = [];
		basicPrizeGroupArr = [];
		prizeGroup = game.add.group();
		for (var i=0; i<10; i++) {
			// do not allow the greenBox to be dragged
			var r;
			if ( i === 0 ) {
				r = prizeGroup.add( createGameElement("greenBox10") );
				r.animations.add("basic", null, 1, true);
				r.play("basic");
				r.prizePoints = 10;
				r.timeMarkerMove = game.time.now + Math.random()*5000 + 1000;
				specialPrizesArr.push( r );
			} else if ( i === 1 ) {
				r = prizeGroup.add( createGameElement("greenBox10time") );
				r.animations.add("basic", null, 1, true);
				r.play("basic");
				r.prizePoints = 0;
				r.prizeTimeOffset = 10;
				r.timeMarkerMove = game.time.now + Math.random()*5000 + 1000;
				specialPrizesArr.push( r );
			} else {
				r = prizeGroup.add( createGameElement("greenBox") );
				r.prizePoints = 1;
				basicPrizeGroupArr.push( r );
			}
			r.wasHit = false;
			prizeGroupArr.push( r );
			allGridObjectsArr.push( r );
		}
		prizeHitTweenArr = [];

		redBoxGroup = game.add.group();
		for ( var i=0; i<3; i++ ) {
			var r = createGameElement("redBox").kill();
			r.animations.add("basic", null, 4, true);
			r.prizePoints = 1;
			redBoxGroup.add( r );
			redBoxArr.push( r );
			allGridObjectsArr.push( r );
		}
		timeMarkerShowRedBoxes = game.time.now + 30000;

		// ===

		// create time bomb game element
		timeBombGroup = game.add.group();
		timeBombTextGroup = game.add.group();
		for (var i=0; i<10; i++) {
			timeBombTextGroup.add(createGameElement("textMinus25")).kill();
			var r = timeBombGroup.add(createGameElement("timeBomb")); //game.make.sprite(0,0,'timeBomb',0);
			//r.alive = false;
			//r.exists = false;
			r.kill();
			r.prizePoints = 1;
			r.animations.add('arm1',[0,1], 1, true);
			r.animations.add('arm2',[0,1], 4, true);
			r.animations.add('arm3',[2,3], 8, true);
			r.animations.add('explode',[4,5,6,7,6,7,6,7], 4, false);
			timeBombArr.push( r );
			allGridObjectsArr.push( r );
		}
		//launchTimeBomb();

		// explosionBM = game.add.bitmapData(game.world.width, game.world.height);
		// explosionSprite = game.add.sprite(0,0, explosionBM);
		// explosionSprite.alive = false;
		// explosionSprite.exists = false;

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

		laserTrailBM = game.add.bitmapData(game.world.width,game.world.height);
		laserTrailSprite = game.add.sprite(0,0,laserTrailBM);
		laserTrailSprite.visible = false;

		laserLayerBM1 = game.add.bitmapData(game.world.width,game.world.height);
		laserLayerSprite1 = game.add.sprite(0,0,laserLayerBM1);
		laserLayerSprite1.visible = false;

		fireButtonSprite = game.add.button(game.world.width-200,game.world.height-200, "fireButton", null, this, 0,0,1,0);
		fireButtonSprite.onInputDown.add(fireButtonPressed);
		fireButtonSprite.onInputUp.add(fireButtonReleased);
		//fireButtonSprite.visible = false;

		shooter1 = game.add.sprite(game.world.centerX, halfGridSize, "shooter1");
		game.physics.enable(shooter1, Phaser.Physics.ARCADE);
		shooter1.anchor.setTo(0.5,0.5);
		shooter1.visible = false;

		gameplayObjectsGroup = game.add.group();
		// gameplayObjectsGroup.add( fireButtonSprite );
		gameplayObjectsGroup.visible = false;

		// scale the blocks/triangles/shooter appropriately
		if ( shapeScale != 1 ) {
			allGridObjectsArr.forEach(function(e){
				e.scale.setTo( shapeScale, shapeScale );
			});
			shooter1.scale.setTo( shapeScale, shapeScale );
		}

		// --
		var style = { font: "50px PressStart2P", fill: "#ff0044", align: "center" };

    // scoreText.visible = true;
    // healthText.visible = true;
    // timerText.visible = true;

    finalScoreText = game.add.text( game.world.centerX, -500, "", { font: "600px Arial", fill: "#258acc", align: "center" });
		// finalScoreText = game.add.text( game.world.centerX, -500, "", { font: "600px Arial", fill: "#ffffff", align: "center", stroke: "#258acc", strokeThickness: 8 });
    // finalScoreText = game.add.text( game.world.centerX, -500, "", { font: "600px 'Press Start 2P'", fill: "#ff0044", align: "center", stroke: "#FFFFFF", strokeThickness: 8 });
    finalScoreText.anchor.set(0.5,0.5);
    finalScoreText.align = "center";
    finalScoreText.visible = false;

    // the gameOverlayTextGroup holds the in-between games/game-over text and help button
    gameOverlayTextGroup = game.add.group();
    gameOverlayText = game.add.bitmapText( game.world.centerX, 200, "pressStart2P", "", 50 );
    //gameOverlayText.anchor.set(0.5,0);
    gameOverlayText.align = "center";
    gameOverlayTextGroup.add( gameOverlayText );
    gameHelpButton = game.add.button(game.world.width-100,game.world.height-300, "helpButton", null, this, 0,0,2,0, gameOverlayTextGroup);
    gameHelpButton.onInputDown.add( helpButtonCallback );

    bonusInfoGroup = game.add.group();
    bonusText = game.add.bitmapText(game.world.centerX, game.world.centerY, "pressStart2P", "", 50 );
    bonusText.align = "center";
    bonusInfoGroup.add( bonusText );
    bonusInfoGroup.visible = false;

    gameStartingText = game.add.bitmapText( game.world.centerX, game.world.centerY, "pressStart2P", "", 50 );
    //gameStartingText.anchor.setTo(0.5,0.5);
		gameStartingText.align = "center";
    scoreText = game.add.bitmapText(game.world.width-10, 50, "pressStart2P", "", 50);
    //scoreText.anchor.setTo(1,0);
    scoreText.align = "right";
    healthText = game.add.bitmapText(game.world.width-10, 150, "pressStart2P", "", 50);
    //healthText.anchor.setTo(1,0);
    healthText.align = "right";
    timerText = game.add.bitmapText(game.world.width-10, 250, "pressStart2P", "", 50);
    //timerText.anchor.setTo(1,0);
    timerText.align = "right";

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
    introText = game.add.bitmapText( game.world.centerX, game.world.centerY, "pressStart2P", "",	20 );
    //introText.anchor.setTo(0,0.5);
    introText.align = "left";
    introInfoGroup.add( introText );

    game.time.events.add(Phaser.Timer.SECOND*2, function () {
    	//introText.setText(
    	setTextCenter( introText,
    		"Welcome to LAZOR REFLEKTOR!!!\n"
    		+ "\n"
    		+ "The object of the game is to fire your laser\n"
    		+ "and try to hit the green prize boxes without\n"
    		+ "hitting a blue reflector box because they\n"
    		+ "will bounce the laser back along its path and\n"
    		+ "kill you. The triangle shaped reflectors will\n"
    		+ "bounce the laser and change it’s path.\n"
    		+ "\n"
    		+ "You can temporarily neutralize a blue reflector\n"
    		+ "box by touching it (or clicking it). A laser \n"
    		+ "beam that hits a neutralized box will not reflect\n"
    		+ "backwards and so is safe to hit (but only very \n"
    		+ "briefly).\n"
    		+ "\n"
    		+ "You may drag the triangle reflectors around\n"
    		+ "and you may rotate them by clicking on them.\n"
    		+ "\n"
    		+ "Each prize hit will add to your score and will \n"
    		+ "add some game time. The more times the \n"
    		+ "laser is bounced around by the triangle \n"
    		+ "reflectors, the more points per prize hit. But \n"
    		+ "the more likely you will accidentally hit a blue \n"
    		+ "reflector and so be killed.\n"
    		+ "\n"
    		+ "The game is over when all 5 player lives are\n"
    		+ "lost or when you run out of time, whichever \n"
    		+ "comes first.\n"
    		+ "\n"
    		+ "There is more but you'll have to figure it out\n"
    		+ "on your own.\n"
    		+ "\n"
    		+ "Feel free to leave comments or suggestions at\n"
    		+ "lazor.reflektor@gmail.com\n"
    		, true, true);
    	//gameOverlayText.setText("LAZOR REFLEKTOR!!!\n\n\n\nGAME OVER\n\ntouch or press spacebar\nto start");
    	setTextCenter( gameOverlayText, "LAZOR REFLEKTOR!!!\n\n\n\nGAME OVER\n\ntouch screen\nto start");
    	//showIntroInfo();

    	doneInit = true;

    }, this);

		// game.time.events.add(1000, function(){
		// 	healthText.setText( totalHealthShooter );
		// 	scoreText.setText( totalPrizeHits );
		// }, this);

	},

	update: function() {
		
		reorientShooterAsNecessary();

		if ( debug !== 0 ) return;

		if ( savedGameTime !== 0 ) {
			// this means that we are in a special mode such that the usual updates should not occur
			//TODO: when saveGameTime is reset to 0 and regular game play continues then perhaps all 
			//      of the timeMarkers should be updated with the interval difference between the
			//      saveGameTime and game.time.now ... otherwise all of the time markers may fire at
			//      the point that regular play continues
			return;
		}

		// if ( game.time.now > timeMarkerUpdateBgTextGroup ) {
		// 	if ( shooterXYText ) shooterXYText.setText( shooter1.x +"\n" + shooter1.y );
		// 	timeMarkerUpdateBgTextGroup = game.time.now + 1000;
		// }
		if ( timeMarkerShuffleAllReflectors > 0 && game.time.now > timeMarkerShuffleAllReflectors ) {
			timeMarkerShuffleAllReflectors = game.time.now + 60000;
			shuffleAllReflectors();
			return;
		}

		if ( game.time.now > timeMarkerShuffleBlueReflectors ) {
			updateObjectPositions( boxReflectorArr, true ); // all should move
			timeMarkerShuffleBlueReflectors = game.time.now + Math.random()*5000 + 25000;
		} else if ( game.time.now > timeMarkerMoveBlueSquares ) {
			updateObjectPositions( boxReflectorArr );
			timeMarkerMoveBlueSquares = game.time.now + Math.random()*5000 + 5000;
		}

		if ( game.time.now > timeMarkerMovePrizes ) {
			updateObjectPositions( basicPrizeGroupArr );
			timeMarkerMovePrizes = game.time.now + Math.random()*5000 + 5000;
		}

		if ( !isShowingRedBoxes() && game.time.now > timeMarkerShowRedBoxes ) {
			showRedBoxPrizes();
			timeMarkerHideRedBoxes = game.time.now + 30000;
		}
		if ( isShowingRedBoxes() && game.time.now > timeMarkerHideRedBoxes ) {
			hideRedBoxPrizes();
			timeMarkerShowRedBoxes = game.time.now + timeToShowRedBoxes();
		}

		if ( timeBombAliveCount() > 0 && game.time.now > timeMarkerMoveTimeBomb ) {
			updateObjectPositions( timeBombArr, true );
			timeMarkerMoveTimeBomb = game.time.now + 2000;
		}

		if ( specialPrizesArr.length > 0 ) {
			specialPrizesArr.forEach( function(p) {
				if ( game.time.now > p.timeMarkerMove ) {
					updateSingleObjectPosition( p );
					p.timeMarkerMove = game.time.now + Math.random()*5000 + 1000;
				}
			});
		}

		if ( game.time.now > timeMarkerTweakTriangles ) {
			updateObjectPositions( triangleGroupArr, false, game.rnd.integerInRange(1,5) );
			timeMarkerTweakTriangles = game.time.now + Math.random()*5000 + 2000;
		}

		if ( game.time.now > timeToLaunchTimeBomb ) {
			launchTimeBomb();
			timeToLaunchTimeBomb = game.time.now + timeBombIntervalNextBombLaunch();
		}

		if ( timeMarkerCheckIfLaserFiredRecently !== 0 && game.time.now > timeMarkerCheckIfLaserFiredRecently ) {
			timeMarkerCheckIfLaserFiredRecently = game.time.now + Math.random()*3000 + 3000;
			showBonusInfo( game.rnd.pick(msgNoShotsRecently), 2000);
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
    if ( debug === 20140401 ) {
    	game.debug.spriteInfo(shooter1,10,180);
    	game.debug.text("shooter1.body.x="+shooter1.body.x+", y="+shooter1.body.y,10,100);

    	game.debug.text("shooter1.body.velocity.x="+shooter1.body.velocity.x+", y="+shooter1.body.velocity.y,10,120);
    	game.debug.text("shooter1.body.acceleration.x="+shooter1.body.acceleration.x+", y="+shooter1.body.acceleration.y,10,140);
  	}
  	if ( debug === 20140402 ) {
  		//		if ( game.time.now > timeToLaunchTimeBomb ) {
  		game.debug.text("game.time.now="+game.time.now+", timeToLaunchTimeBomb="+timeToLaunchTimeBomb,10,100);
  	}
	}

}

function gamePaused() {
	//audioBackground.pause();
}
function gameResumed() {
	//audioBackground.resume();
}

function helpButtonCallback() {
	console.log("helpButtonCallback: about to show intro info");
	showIntroInfo();
	console.log("helpButtonCallback: OUT");
}

function updateGameLevelTimer() {
	//console.log("updateGameLevelTimer: IN");
	if ( gameOver ) return;
	if ( savedGameTime !== 0 ) return;
	if ( debug !== 0 ) return;

	//console.log("updateGameLevelTimer...");
	gameLevelTimer -= 1;
	if ( gameLevelTimer < 0 ) {
		gameLevelTimer = 0;
	}
	//timerText.setText(gameLevelTimer.toString());
	setTextRight( timerText, gameLevelTimer.toString() );

	// console.log("updateGameLevelTimer gameLevelTimer="+gameLevelTimer);
	// console.log("timeBombAliveCount()="+timeBombAliveCount());

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
		game.scale.startFullScreen();
}

function createGameElement( shapeName, canRotate, frameNum ) {
	
	//console.log("in createGameElement");

	var rx, ry;
	var pointEmpty = findEmptyGridLocation();
	rx = pointEmpty.x;
	ry = pointEmpty.y;
	//console.log("createGameElement: pointEmpty.x="+pointEmpty.x+", pointEmpty.y="+pointEmpty.y);

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

	//shape.body.linearDamping = 0.1;

	//shape.inputEnabled = true;
	// if ( canDrag ) {
	// 	shape.inputEnabled = true;
	// 	//shape.input.start(0,true);
	// 	shape.input.enableDrag();
	// 	//shape.input.enableSnap(50,50,false,true );
	// 	shape.events.onDragStart.add(function(s) { 
	// 		s.saveShapeOriginalPositionX = s.x;
	// 		s.saveShapeOriginalPositionY = s.y;
	// 	});
	// 	shape.events.onDragStop.add(fixSnapLocationReflector);	
	// }


	shape.name = shapeName;

	return shape;
}

function fixSnapLocationReflector( reflectorSprite ) {
	// this function is called when a triangle that is being dragged is "dropped"
	reflectorSprite.isReflectorBeingDragged = false;
	reflectorSprite.gameTimeOfLastManualMove = game.time.now;

	var toXY = snapToShapeGrid( {x:reflectorSprite.x, y:reflectorSprite.y} );
	var toX = toXY.x;
	var toY = toXY.y;

	if ( !isValidGridLocation(toX, toY) ) {
		reflectorSprite.x = reflectorSprite.saveShapeOriginalPositionX;
		reflectorSprite.y = reflectorSprite.saveShapeOriginalPositionY;
		return;
	}

	if ( toX === reflectorSprite.saveShapeOriginalPositionX && toY === reflectorSprite.saveShapeOriginalPositionY ) {
		// if ( sprite.angle == Phaser.Math.snapToFloor(sprite.angle, 90) ) {
		rotateTriangleReflector(reflectorSprite, false);
	}


	// var toX = Phaser.Math.snapToFloor( reflectorSprite.x, gridSize ) + halfGridSize + extraWidth/2;
	// var toY = Phaser.Math.snapToFloor( reflectorSprite.y, gridSize ) + halfGridSize + extraHeight/2;

	// check if the snapped to spot is ok to drop to (i.e. there is no existing sprite there that is not itself)
	//console.log("\n\n\nfixSnapLocationReflector: IN reflectorSprite.shapeId="+reflectorSprite.shapeId+", toX="+toX+", toY="+toY);
	var shapeAtXY = hasShapeAtXY(toX,toY);
	//if ( shapeAtXY ) console.log("fixSnapLocationReflector: hasShapeAtXY(toX,toY)="+shapeAtXY.shapeId);
	
	var freeLocation;
	if ( !shapeAtXY || shapeAtXY.shapeId == reflectorSprite.shapeId) {
		freeLocation = {x:toX,y:toY};
	} else {
		freeLocation = tryGetNearbyLocation( toX, toY );
	}

	reflectorSprite.x = freeLocation.x;
	reflectorSprite.y = freeLocation.y;
}

function isValidGridLocation(x,y, doSnap) {
	// checks if the given x/y is a possible location for a shape
	// NOTE: this does not check if there IS a shape at that location
	var checkX, checkY;
	var toXY;
	if ( doSnap ) {
		toXY = snapToShapeGrid( {x:x, y:y} );
		checkX = toXY.x;
		checkY = toXY.y;
	} else {
		checkX = x;
		checkY = y;
	}
	if ( checkX > leftLimitX && checkX < rightLimitX && checkY > topLimitY && checkY < bottomLimitY ) {
		return true;
	} else {
		return false;
	}
}

function fireButtonPressed() {

	if ( debug !== 0 ) console.log("fireButtonPressed IN");

	// since the SPACEBAR is used to start the gameplay (as well as shooting the laser)
	// we need to do a few checks to decide if we need to restart the game 
	// or to shoot the laser.

	if ( !gameOver && shooterDead ) {
		console.log("fireButtonPressed: ignoring because the shooter is dead");
		return;
	}
	if ( gameOver || shooterDead ) {
		if ( !doneInit ) {
			// NOTE: the main reason for this check is because there is certain text that is setup
			// only after a few seconds so that the fonts have had time to load properly. Without this
			// check the help text, for example, would not be set (i.e. would be empty)
			console.log("Not initialized completely yet...");
			return;
		}
		if ( game.time.now > timeMarkerGameOver ) {
			// the user pressed the fire button after a game over occurred after
			// a preset amount of time
			restartGame();
			return;
		}
		console.log("fireButtonPressed: game is over or the shooter is dead so ignoring the fire button");
		return;
	}
	//console.log("fireButtonPressed: shooter must not be dead. shooterDead="+shooterDead);

	if ( laserFiring ) {
		stopFiringLaserCallback();
	};

	laserPathId += 1;

	laserFiring = true;
	timeMarkerCheckIfLaserFiredRecently = game.time.now + Math.random()*3000 + 5000;

	// play sound!
	audioLaserFired.play();

	//laserLayerTexture1sprite.visible = true;
	saveShooterVelocityX = shooter1.body.velocity.x;
	saveShooterVelocityY = shooter1.body.velocity.y;
	//console.log("\n\n\n\n\n\n*************\nfireButtonPressed: setting saveShooterVelocityX="+saveShooterVelocityX+", shooter1.body.velocity.x="+shooter1.body.velocity.x);

	shooter1.body.velocity.setTo(0,0);

	var x0 = shooter1.x;
	var y0 = shooter1.y;
	// var aBall = balls.getFirstDead();
	// aBall.reset( x0, y0 );
	// //aBall.body.velocity.y = 200;
	// var theShootingAngle = shooter1.angle;
	// game.physics.velocityFromAngle( theShootingAngle, 400, aBall.body.velocity);
	var r = drawLaserFrom( x0, y0 );

	if ( debug !== 0 ) console.log("\nfireButtonPressed: after drawLaserFrom\n\n\n");

	laserLayerSprite1.visible = true;
	laserLayerSprite1.alpha = 1;

	// determine what, if any message to display to the player
	// NOTE that these messages might be overridden by messages a little further below
	// in the logic that processes the details of the prizes that were hit
	// save it for play stats and intelligent commentary
	
	savedPrizeHitCountPerShotArr.push( r.prizeArr.length );

	var avgHitCountForLastFewShots = avgHitCount( 4 ); //check avg for the last 4 laser firings
	var avgHitScoreForLastFewShots = avgHitScore( 4 ); //check avg score increment for the last 4 laser shots with hits
	var timeSinceLastFiring = game.time.now - savedGameTimeAtLastLaserFiring;
	savedGameTimeAtLastLaserFiring = game.time.now;
	var timeSinceLastComment = game.time.now - savedGameTimeAtLastComment;
	var numPrizesHit = r.prizeArr.length;
	var countTimeBombPrizeHit = 0;

	if ( numPrizesHit > 0 ) {

		r.prizeArr.forEach(function(p){
			if ( p.name === "timeBomb" ) {
				countTimeBombPrizeHit += 1;
			}
		});

		savedPrizeHitScorePerSuccessfulShotArr.push( r.hitScore );

	}

	if ( r.isReflectingBack ) {

		if ( r.numLaserBounces >= 3 ) {
			showBonusInfo(game.rnd.pick(msgDieHardArr), 3000);
		} else if ( r.numLaserBounces === 0 ) {
			if ( numPrizesHit === 0 ) {
				showBonusInfo(game.rnd.pick(msgDieEasyArr), 3000);
			} else {
				if ( countTimeBombPrizeHit >= 1 ) {
					showBonusInfo(game.rnd.pick(msgDieEasyWithTimeBomb), 3000);
				} else {
					showBonusInfo(game.rnd.pick(msgDieEasyWithPrize), 3000);
				}
			}
		} else if ( r.numLaserBounces === 1 ) {
			if ( numPrizesHit > 0 ) {
				showBonusInfo(game.rnd.pick(msgDie1BounceWithPrizeArr), 3000);
			} else {
				showBonusInfo(game.rnd.pick(msgDie1BounceWithoutPrizeArr), 3000);
			}
		}

	} else {

		// not reflecting back
		if ( r.numLaserBounces >= 3 && r.hitScore > 5 ) {
			showBonusInfo("Really Nice shot!",2000); // overrides possibly some above commentary
		} else if ( r.numLaserBounces >=3 && r.hitScore > 1 ) {
			showBonusInfo("Cool.", 2000);
		} else if ( r.numLaserBounces >= 2 && r.hitScore > 3) {
			showBonusInfo(game.rnd.pick(msgRiskyGood), 3000);
		} else if ( r.numLaserBounces >= 2 && r.hitScore > 0 ) {
			showBonusInfo(game.rnd.pick(msg2BouncesOkay), 3000);
		} else if ( r.numLaserBounces >= 3 ) {
			showBonusInfo("Reflecting Big Time!", 3000);
		} else if ( numPrizesHit === 0 ) {
			if ( savedPrizeHitCountPerShotArr.length > 4 ) {
				if ( avgHitCountForLastFewShots === 0 ) {
					if ( timeSinceLastCommentOfType("NoHits") > 3000 ) {
						if ( timeSinceLastFiring < 200 ) {
							showBonusInfo(game.rnd.pick(msgShootingNoHits), 3000, "NoHits");
						// } else if ( timeSinceLastFiring < 5000 ) {
						// 	showBonusInfo("Try Harder, Won't You?", 3000, "NoHits");
						} else {
							showBonusInfo(game.rnd.pick(msgShootingNoHitsSlow), 3000, "NoHits");
						}
					}
				} else if ( avgHitCountForLastFewShots >= 1 ) {
					//showBonusInfo("Cool Your Jets!", 2000);
				}
			}
		} else if ( savedPrizeHitCountPerShotArr.length > 4 && avgHitScoreForLastFewShots <= 2 ) {
			showBonusInfo(game.rnd.pick(msgEasyLowHits), 3000);
		} else if ( game.time.now - savedGameTimeAtLastRestartLevel < 5000 && avgHitScoreForLastFewShots > 2 &&
					avgHitCountForLastFewShots >= 1 && savedPrizeHitCountPerShotArr.length === 2 ) {
			showBonusInfo("Not A Bad Start", 3000);
		}
		
	}

	// ==

	if ( r.isReflectingBack ) {
		laserTimerEvent = game.time.events.loop(100, laserTimerEventCallback, this);
		if ( debug != 1 ) totalHealthShooter -= 1;
	}

	if ( r.prizeArr.length > 0 ) {
		//timeToLaunchTimeBomb = game.time.now + 6000;

		// play sound!
		audioPrizeHit.play();

		// game.add.tween(b)
		// 	.to({alpha:0}, 500, Phaser.Easing.Linear.None, true)

		// check r.prizeArr to see if redBoxes were hit and if so check if they were ALL hit
		// because if they were not ALL hit then none of them will disappear
		var countRedBoxInPrizeArr = 0;
		var allRedBoxesHit = false;
		r.prizeArr.forEach(function(p){
			if ( p.name === "redBox" ) {
				countRedBoxInPrizeArr += 1;
			}
		});
		if ( countRedBoxInPrizeArr > 0 && redBoxGroup.countLiving() === countRedBoxInPrizeArr ) {
			allRedBoxesHit = true;

			audioRedBoxesHit.play();

			showBonusInfo("Oh Good!",2000);

			redBoxGroup.forEachAlive(function(p){
				game.add.tween(p.scale)
					.to({x:2,y:2}, 100, Phaser.Easing.Linear.None, true, 0, 20, true)
					.onComplete.add(function(){p.scale.setTo(1,1)});
			});			

			laserHitAllRedBoxes();

			return;
			// game.time.events.add(200, 
			// 	function () {
			// 		laserHitAllRedBoxes();
			// 	}, this);
		}

		r.prizeArr.forEach(function(p) {
			// prizeHitTweenArr.push( 
			// 	game.add.tween(p.scale)
			// 		.to({x:2,y:2}, 100, Phaser.Easing.Linear.None, true, 0, 5, true)
			// 		.to({x:1,y:1}, 100, Phaser.Easing.Linear.None, true, 0)
			// 		.loop() );

			// if ( p.name === "redBox" &&  allRedBoxesHit ) {
			// 	// skip processing of redBox prizes when all of them were hit
			// 	// because there is special processing (above) done to them
			// 	// in this case...
			// 	return;
			// }

			// flash the prizes that were hit by the laser!
			game.add.tween(p.scale)
				.to({x:2,y:2}, 100, Phaser.Easing.Linear.None, true, 0, 5, true);

			// increase the game time for each prize hit
			if ( p.prizeTimeOffset ) {
				gameLevelTimer += p.prizeTimeOffset;
			} else {
				gameLevelTimer += extraGameTimePerPrize;
			}

			// if ( p.name === "redBox" && !allRedBoxesHit ) {
			// 	// since all not all red boxes were hit with one laser blast
			// 	// then none of them are considered "hit" and so none of them
			// 	// should be killed
			// 	return;
			// }

			p.wasHit = true;

			game.add.tween(p)
				.to({alpha:0}, 500, Phaser.Easing.Linear.None, true)
				.onComplete.add( function () {
					p.wasHit = false;
					p.scale.setTo(1,1); // sometimes this is called too early and the scale is reset by the above tween
					if ( p.name === "greenBox" || p.name === "greenBox10" || p.name === "greenBox10time" || p.name === "redBox" ) {
						var point = findEmptyGridLocation();
						p.x = point.x;
						p.y = point.y;
						game.add.tween(p)
							.to({alpha:1}, 500, Phaser.Easing.Linear.None, true)
							.onComplete.add( function () {
								p.scale.setTo(1,1);
							});
					} else if ( p.name === "timeBomb" ) {
						//p.kill();
						p.alpha = 1;
						destroyedTimeBomb( p );
					}
				}, this);

		});

		//prizeHitEvent = game.time.events.loop(200, prizeHitTimerEventCallback, this);

		totalPrizeHits += r.hitScore; //r.prizeArr.length * (r.numLaserBounces + 1);

	}

	if ( r.spriteCollideArr.length > 0 ) {
		r.spriteCollideArr.forEach( function(s){
			if ( s.name !== "boxReflector1" ) {
				s.gameTimeLaserLastHit = game.time.now;
				s.tint = 0xFF9999;
				//game.add.tween(s).to({tint:0xFFFFFF}, 2000, Phaser.Easing.Linear.None, true);
				game.time.events.add(Phaser.Timer.SECOND * 3, function() {
					s.tint = 0xFFFFFF;
					updateSingleObjectPosition( s );
				}, this);

			}
		});
	}

	// update score/health displayed
	//healthText.setText( totalHealthShooter.toString() );
	setTextRight( healthText, totalHealthShooter.toString() );
	//scoreText.setText( totalPrizeHits.toString() );
	setTextRight( scoreText, totalPrizeHits.toString() );

	stopLaserFiringTimerHandle = game.time.events.add(200, stopFiringLaserCallback, this);

	if ( r.isReflectingBack ) {
		var d = shooterDirection();
		if ( d.isUp || d.isDown ) {
			var tween1 = game.add.tween(shooter1)
				.to( { x: shooter1.x+10 }, 50, Phaser.Easing.Linear.None, false)
				.chain( game.add.tween(shooter1).to( {x: shooter1.x-10 }, 50, Phaser.Easing.Linear.None, false) )
				.repeat(9)
				.chain( game.add.tween(shooter1).to( {x: shooter1.x}, 25, Phaser.Easing.Linear.None, false) );
			//tween1.onComplete.add( shooterDies, this );
			tween1.start();
		} else {
			var tween1 = game.add.tween(shooter1)
				.to( { y: shooter1.y+10 }, 50, Phaser.Easing.Linear.None, false)
				.chain( game.add.tween(shooter1).to( {y: shooter1.y-10 }, 50, Phaser.Easing.Linear.None, false) )
				.repeat(9)
				.chain( game.add.tween(shooter1).to( {y: shooter1.y}, 25, Phaser.Easing.Linear.None, false) );
			//tween1.onComplete.add( shooterDies, this );
			tween1.start();
		}
		audioShooterDies.play();
		shooterDies();
	}

}

function fireButtonReleased() {
	stopFiringLaserCallback( true );
}

function stopFiringLaserCallback( fireButtonWasReleased ) {
	if ( !laserFiring ) return;
	if ( debug !== 0 && !fireButtonWasReleased ) return; // skip if this was called from a timeout

	laserFiring = false;

	if ( stopLaserFiringTimerHandle ) {
		// NOTE: what does this do if the stopFiringLaserCallback was called due to the timeout?
		// Is this going to mess up the events (including the gameLevelTimerEvent?)
		game.time.events.remove( stopLaserFiringTimerHandle );
		stopLaserFiringTimerHandle = null;
	}

	laserLayerSprite1.visible = false;

	// show laser trails
	if ( laserTrailTween ) {
		laserTrailTween.stop();
		laserTrailTween = null;
	}
	laserTrailSprite.visible = true;
	laserTrailSprite.alpha = 1;
	laserTrailTween = game.add.tween(laserTrailSprite).to({alpha:0},500,Phaser.Easing.Linear.None,true);
	// game.time.events.add(500, 
	// 	(function(laserPathId0) {
	// 		if ( laserPathId === laserPathId0) {
	// 			laserTrailSprite.visible = false;
	// 		}
	// 	})(laserPathId)
	// 	, this);

	//1----if ( laserFiring) laserLayerTexture1.render(laserLayerSprite1, {x:0,y:0}, false, true);
	if ( laserTimerEvent ) {
		if ( debug !== 0 ) console.log("removing timer event");
		game.time.events.remove(laserTimerEvent);
		laserTimerEvent = null;
	}
	// if ( prizeHitEvent ) {
	// 	console.log("removing prize hit event");
	// 	game.time.events.remove(prizeHitEvent);
	// }

	//resetObjectPositions( prizeArr );

	if ( !gameOver && !shooterDead ) {
		if ( debug !== 0 ) console.log("fireButtonReleased: saveShooterVelocityX="+saveShooterVelocityX);
		if ( saveShooterVelocityX != null ) {
			shooter1.body.velocity.setTo( saveShooterVelocityX, saveShooterVelocityY );
		}
	}
}

function shooterDies() {
	console.log("shooterDies: IN");
  //game.add.tween(shooter1).to( { scale: 0 }, 2000, Phaser.Easing.Linear.None, true);
  shooterDead = true;
  fireButtonReleased();
  fadeOutAllTimeBombs();
  shooter1.body.velocity.setTo( 0, 0 );
	game.add.tween(shooter1).to( { alpha: 0 }, 2000, Phaser.Easing.Linear.None, true, 500);
	if ( totalHealthShooter > 0 ) {
		// play sound of shooter dying (but not yet dead)
		//audioShooterDies.play();
		game.time.events.add(3000, restartLevel, this);
	} else {
		// play sound of shooter dying (game over)
		//audioShooterDies.play();
		game.time.events.add(1000, gameLevelTimeout, this);
		//gameLevelTimeout();
	}
	console.log("shooterDies: OUT");
}

function gameLevelTimeout() {
	gameOver = true;
	shooterDead = true; // shooter is considered "dead" unless it is alive

	removeAndKillAllTimeBombEvents();

	// if ( gameLevelTimerEvent ) {
	// 		game.time.events.remove(gameLevelTimerEvent);
	// 		gameLevelTimerEvent = null;
	// }
	clockTimer.stop(false);

	console.log("************** GAME OVER *****************");
	// calculate final score based on the number of hits combined with the shooter health
	var totalScore = totalPrizeHits; // + Math.floor(totalPrizeHits * totalHealthShooter / maxHealthShooter);
	finalScoreText.visible = true;
	finalScoreText.setText( totalScore );
	game.add.tween(finalScoreText).to({y:game.world.centerY}, 1000, Phaser.Easing.Back.Out, true);
	
	endingSequenceAllReflectors();

	game.time.events.add(Phaser.Timer.SECOND*3, function () {
		console.log("3 Second timer after game over... should show GAME OVER Text!");
		shooter1.visible = false;
		finalScoreText.visible = false;
		gameOverlayTextGroup.visible = true;
		gameOverlayText.visible = true;
		gameplayObjectsGroup.visible = false;
	}, this);

	// the following timer(s) must be removed when the next game is started
	// nonPlayModeTimersActiveArr.push( game.time.events.add(Phaser.Timer.SECOND*20, function () {
	// 	gameOverlayText.visible = false;
	// 	finalScoreText.visible = false;
	// }) );
	game.time.events.add(Phaser.Timer.SECOND*20, function () {
		gameOverlayText.visible = false;
		finalScoreText.visible = false;
		game.time.events.loop(Phaser.Timer.SECOND*10, function () {
			gameOverlayText.visible = !gameOverlayText.visible;
		}, this);
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
	gameHelpButton.visible = false;
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
	gameHelpButton.visible = true;
	gameOverlayTextGroup.visible = true;
	//game.time.events.add(Phaser.Timer.SECOND * 10, showIntroInfo, this);
}

function isShowingIntroInfo() {
	return introInfoGroup.visible;
}

function restartGame() {

	gameOver = false;

	timeMarkerShuffleAllReflectors = 0;
	savedGameTime = 0;

	removeAndKillAllTimeBombEvents();
	removeActiveTimers();

	laserTimerEvent = null;
	stopLaserFiringTimerHandle = null;
	hideIntroInfoTimer = null;
	//gameLevelTimerEvent = null;

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

	// healthText.setText( totalHealthShooter.toString() );
	// scoreText.setText( totalPrizeHits.toString() );
	// timerText.setText( gameLevelTimer.toString() );
	setTextRight( healthText, totalHealthShooter.toString() );
	setTextRight( scoreText, totalPrizeHits.toString() );
	setTextRight( timerText, gameLevelTimer.toString() );
	timerText.alpha = 1;

	// ==
	startupSequenceAllReflectors();

	//gameStartingText.setText("GET READY!\n\n3");
	game.time.events.add(Phaser.Timer.SECOND, function () {
		setTextCenter( gameStartingText, "GET READY!\n\n3", true, true);
		gameStartingText.visible = true;
	}, this);
	game.time.events.add(Phaser.Timer.SECOND*2, function () {
			//gameStartingText.setText("GET READY!\n\n2");
			setTextCenter( gameStartingText, "GET READY!\n\n2", true, true);
	}, this);
	game.time.events.add(Phaser.Timer.SECOND*3, function () {
			//gameStartingText.setText("GET READY!\n\n1");
			setTextCenter( gameStartingText, "GET READY!\n\n1", true, true);
	}, this);

	// maybe put all of the below logic in timer to go after 3 seconds
	game.time.events.add(Phaser.Timer.SECOND*4, function() {
		// play sound
		audioGameStart.play();

		gameStartingText.visible = false;
		restartLevel();
		clockTimer.start();
		// if ( gameLevelTimerEvent ) {
		// 		game.time.events.remove(gameLevelTimerEvent);
		// }
		// gameLevelTimerEvent = game.time.events.loop(Phaser.Timer.SECOND, updateGameLevelTimer, this);

		timeMarkerShuffleAllReflectors = game.time.now + 60000;
		timeMarkerMoveBlueSquares = game.time.now + 1000;
		timeMarkerShuffleBlueReflectors = game.time.now + Math.random()*5000 + 25000;
		timeMarkerMovePrizes = game.time.now + 2000;
		timeMarkerMoveTimeBomb = game.time.now + 1000;
		timeToLaunchTimeBomb = game.time.now + timeBombIntervalNextBombLaunch();
		timeMarkerTweakTriangles = game.time.now + 2000;
		timeMarkerShowRedBoxes = game.time.now + timeToShowRedBoxesAfterGameStart();
		timeMarkerCheckIfLaserFiredRecently = game.time.now + Math.random()*3000 + 3000;
		
	}, this);

}

function restartLevel() {
	var topOrBottom = [topLimitY, bottomLimitY];
	var isDownOrIsUp = [90,270];
	var movingLeftOrRight = [-defShooterVelocity, defShooterVelocity];
	
	removeAndKillAllTimeBombEvents();

	saveShooterVelocityX = null;
	saveShooterVelocityY = null;
	shooterDead = false;
	shooter1.visible = true;
	shooter1.alpha = 1;
  //shooter1.angle = Phaser.Math.getRandom(isDownOrIsUp);
  setShooterAngle( Phaser.Math.getRandom(isDownOrIsUp) );
  shooter1.x = game.world.centerX;
  shooter1.y = Phaser.Math.getRandom(topOrBottom); //topLimitY;
  shooter1.body.angularVelocity = 0;
  shooter1.body.acceleration.setTo(0,0);
  shooter1.body.velocity.setTo(0,0);
	shooter1.body.velocity.x = Phaser.Math.getRandom(movingLeftOrRight); //-defShooterVelocity; // make the direction random left/right
	// also make the starting side random (top/bottom)

	// healthText.setText( totalHealthShooter.toString() );
	// scoreText.setText( totalPrizeHits.toString() );
	// timerText.setText( gameLevelTimer.toString() );
	setTextRight( healthText, totalHealthShooter.toString() );
	setTextRight( scoreText, totalPrizeHits.toString() );
	setTextRight( timerText, gameLevelTimer.toString() );
	timerText.alpha = 1;

	resetGamePlayStats();

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

function drawLaserFrom( x0, y0 ) {
	
	if ( debug==1) console.log("\n\n\n\n\n\n-----------------------------------------\ndrawLaserFrom: IN")

	// laserSprite1.width = 1000;
	// laserSprite1.angle = angle;
	// laserSprite1.anchor.setTo(0,0);
	// laserSprite1.visible = true;
	// laserSprite1.x = x0+5;
	// laserSprite1.y = y0;

	//laserLayerTexture1.render(laserSprite1, {x:500,y:500}, false, true);

	var ctx = laserLayerBM1.context;
	var ctx1 = laserTrailBM.context;

	laserLayerBM1.clear();
	laserTrailBM.clear();

	//laserLayerBM1.clearRect(0,0,game.world.width,game.world.height);
	//laserLayerBM1.setStrokeStyle(laserWidth);
	ctx.strokeStyle = '#ff0000';
	ctx.lineWidth = laserWidth;
	ctx.beginPath();

	ctx1.strokeStyle = '#ffffff';
	ctx1.globalAlpha = 1;
	ctx1.lineWidth = laserTrailWidth;
	ctx1.beginPath();

	var lx0,ly0;

	var calcuatedLineSegmentInfo;

	lx0 = x0;
	ly0 = y0;

	var isReflectingBack = false;
	var laserPath = []; // an array of xyPoints

	ctx.moveTo(lx0,ly0);
	laserPath.push( {x:lx0,y:ly0} );

	// calcuatedLineSegmentInfo = calcLineSegment(shooterDirection(),lx0,ly0);
	// laserLayerBM1.lineTo(calcuatedLineSegmentInfo.x1, calcuatedLineSegmentInfo.y1);
	// isReflectingBack = calcuatedLineSegmentInfo.isReflectingBack;
	var laserDirection = shooterDirection();
	var prizeArr = [];
	var spriteCollideArr = [];
	var numLaserBounces = 0;
	
	// this is the accumulated prize hit score where prizes are worth more depending 
	// on the number of bounces needed to reach them
	var hitScore = 0;
	var prizePointsForSegment = 0;
	var failSafeCount = 0;

	while ( (!calcuatedLineSegmentInfo || !calcuatedLineSegmentInfo.isLastSegment) && failSafeCount < 200 ) {
		
		failSafeCount += 1;

		if ( debug == 1 ) console.log(
			"drawLaserFrom: in while, "
			+ "numLaserBounces="+numLaserBounces
			+ ", laserDirection="+stringForDir(laserDirection)
			+ ", lx0="+lx0+", ly="+ly0
			);

		calcuatedLineSegmentInfo = calcLineSegment(laserDirection,lx0,ly0);

		ctx.lineTo(calcuatedLineSegmentInfo.x1, calcuatedLineSegmentInfo.y1);
		if ( numLaserBounces === 0 ) {

			ctx1.save();
			var gradient = ctx1.createLinearGradient(lx0,ly0,calcuatedLineSegmentInfo.x1, calcuatedLineSegmentInfo.y1);
			gradient.addColorStop(0,"#000");
			gradient.addColorStop(0.5,"#fff");
			gradient.addColorStop(1,"#fff");
			ctx1.strokeStyle = gradient;
			ctx1.moveTo(lx0,ly0);
			ctx1.lineTo(calcuatedLineSegmentInfo.x1, calcuatedLineSegmentInfo.y1);
			ctx1.stroke();
			ctx1.restore();
			ctx1.beginPath();
			ctx1.moveTo(calcuatedLineSegmentInfo.x1, calcuatedLineSegmentInfo.y1);

		} else {
			ctx1.lineTo(calcuatedLineSegmentInfo.x1, calcuatedLineSegmentInfo.y1);

		}
		laserPath.push( {x:calcuatedLineSegmentInfo.x1, y:calcuatedLineSegmentInfo.y1} );

		if ( calcuatedLineSegmentInfo.spriteCollide ) {
			spriteCollideArr.push( calcuatedLineSegmentInfo.spriteCollide );
		}
		isReflectingBack = calcuatedLineSegmentInfo.isReflectingBack;

		prizeArr = prizeArr.concat( calcuatedLineSegmentInfo.prizeArr );
		//hitScore += calcuatedLineSegmentInfo.prizeArr.length * (numLaserBounces+1);
		prizePointsForSegment = 0;

		calcuatedLineSegmentInfo.prizeArr.forEach(function(p){
			var prizePoints = 0;
			if ( p.prizePoints ) {
				prizePoints = p.prizePoints;
			} else {
				prizePoints = 0;
			}
			prizePointsForSegment += prizePoints;
		});
		if ( debug == 20140404 ) {
			console.log("drawLaserFrom: prizePointsForSegment="+prizePointsForSegment);
		}
		hitScore += prizePointsForSegment * (numLaserBounces+1);

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

	ctx.stroke();
	ctx1.stroke();

	//laserLayerBM1.fillStyle('#f00');
	//laserLayerBM1.fill();
	
	// not sure if I need to do the below!
	// if (false) laserLayerSprite1.loadTexture(laserLayerBM1);
	//1----laserLayerTexture1.render(laserLayerSprite1, {x:0,y:0}, true, true);

	if ( debug !== 0 ) console.log("drawLaserFrom: OUT isReflectingBack="+isReflectingBack);

	return {isReflectingBack:isReflectingBack, numLaserBounces:numLaserBounces, hitScore:hitScore, prizeArr:prizeArr, spriteCollideArr:spriteCollideArr, laserPath:laserPath};
}

function touchListenerOnUp() {
	if ( laserFiring ) {
		fireButtonReleased();
	}
}

function clickListener() {
	if ( debug !== 0 ) console.log("\n\nclickListener: IN***");

	if (gameOver) {
		if ( isShowingIntroInfo() ) {
			hideIntroInfo();
		} else {
			// clicking anywhere (not including the help button) on the surface will start the game
			if (!((game.input.y > game.world.height-300 && game.input.y < game.world.height-200) && game.input.x > game.world.width-100)) {
				fireButtonPressed();
			}
		}
		
	}

	// console.log("clickListener: input.x="+game.input.x+", input.y="+game.input.y);
	// var sp = snapToShapeGrid( {x:game.input.x,y:game.input.y} );
	// console.log("clickListener: snapped to x="+sp.x+", y="+sp.y);

	// if ( game.input.y > bottomLimitY - shapeWidth/2 ) {
	// 	// only fire the button if the surface was touched at the bottom of the screen
	// 	fireButtonPressed();
	// 	return;
	// }

	// var r = hasShapeAt({x:game.input.x, y:game.input.y});

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

	// if ( r ) {
	// 	if ( isShapeTriangle(r) ) {
	// 		// make sure that the triangle isn't in the process of rotating
	// 		console.log("clickListener: clicked on triangle");
	// 		if ( r.angle == Phaser.Math.snapToFloor(r.angle, 90) ) {
	// 			rotateTriangleReflector(r, false);
	// 		} else {
	// 			console.log("clickListener: the triangle is rotating!!!!!!! Ignoring the click!")
	// 		}
	// 	} else if ( r.name == "boxReflector1" ) {
	// 		r.play("safeMode");
	// 	}
	// }
	if ( debug !== 0 ) console.log("clickListener: OUT\n\n\n");
}

// given a direction (isUp, isDown, isRight, isLeft) and a co-ordinate
// calculate the array of xy points to be used to draw the laser line
// considering the reflections properly. Returns the next part of the line
// ...this function would need to be called n times until the whole
// bounced around laser line is all calculated
// if isReflectingBack is true then the shooter should get hit
// if isLastSegment is true then there are no more line segments to calculate
function calcLineSegment( direction, x0, y0 ) {
	if ( debug !== 0 ) console.log("calcLineSegment: IN");
	var r = {x0:x0, y0:y0, isReflectingBack:false, isLastSegment:true};
	var spriteCollide = firstSpriteHit( direction, x0, y0 );	
	if ( spriteCollide ) {
		if (debug===1) console.log("calcLineSegment: sprite found for line segment! sprite.x="+spriteCollide.x+", sprite.y="+spriteCollide.y+", sprite.angle="+spriteCollide.angle);
		var hitInfo = calcHitPoint( direction, spriteCollide, x0, y0 );
		r.x1 = hitInfo.x1;
		r.y1 = hitInfo.y1;
		r.isReflectingBack = hitInfo.isReflectingBack;
		r.isLastSegment = hitInfo.isLastSegment;
		r.laserReflectionDirection = hitInfo.laserReflectionDirection;
		r.spriteCollide = spriteCollide;
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
	if ( debug !== 0 ) console.log("collectPrizesOnLine: IN");
	prizeGroup.forEach(function (prize) {
		if ( prize.alive && !prize.wasHit && isPrizeOnLine( prize, d, x0, y0, x1, y1 ) ) {
			//if ( debug !== 0 ) console.log("collectPrizesOnLine: found prize x="+prize.x+", y="+prize.y);
			prizeArr.push( prize );
		}
	});
	redBoxGroup.forEach(function (prize) {
		//console.log("collectPrizesOnLine: redBoxGroup prize.shapeId="+prize.shapeId+", prize.alive="+prize.alive);
		if ( prize.alive && !prize.wasHit && isPrizeOnLine( prize, d, x0, y0, x1, y1 ) ) {
			//console.log("collectPrizesOnLine: found prize x="+prize.x+", y="+prize.y);
			prizeArr.push( prize );
		}
	});
	timeBombGroup.forEach(function (prize) {
		if ( prize.alive && !prize.wasHit && isPrizeOnLine( prize, d, x0, y0, x1, y1 ) ) {
			//console.log("collectPrizesOnLine: found prize x="+prize.x+", y="+prize.y);
			prizeArr.push( prize );
		}
	});
	//if ( debug !== 0 ) console.log("collectPrizesOnLine: OUT  prizeArr.length="+prizeArr.length);
	return prizeArr;
}

function isShapeOnPath2( shape, d, x0, y0 ) {
	var line = lineFromDirectionAndXY( d, x0, y0 );
	return isPrizeOrShapeOnLine( shape, shapeWidth, d, x0, y0, line.x1, line.y1 );
}
function isPrizeOnLine( prize, d, x0, y0, x1, y1 ) {
	return isPrizeOrShapeOnLine( prize, prizeWidth, d, x0, y0, x1, y1 );
}

function isPrizeOrShapeOnLine( obj, sw, d, x0, y0, x1, y1 ) {
	//console.log("isPrizeOrShapeOnLine: obj.x="+obj.x+", y="+obj.y+", d.isUp|d.isDown="+(d.isUp|d.isDown)+", x0="+x0+", y0="+y0+", x1="+x1+",y1="+y1);
	//var dx, dy;
	if ( debug==1 ) 
		console.log("isPrizeOrShapeOnLine: "
			+ "obj.name="+obj.name+", obj.x="+obj.x+", obj.y="+obj.y
			+ ", sw="+sw
			+ ", d="+stringForDir(d)
			+ ", x0="+x0+", y0="+y0+", x1="+x1+", y1="+y1
			//+ ", isPrizeSearch="+isPrizeSearch
			);
	
	//<<<<333
	if ( Math.abs(obj.x-x0) <= sw/2 && Math.abs(obj.y-y0) <= sw/2 ) {
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
function isShapeBoxReflector( shape ) {
	if ( shape.name === "boxReflector1" ) {
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
				}, this);
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
	// r.reflectingLineInfo = 
	// 	{
	// 		x0: diagonalInfo.x0*triangleSpriteHalfWidth+triangleSprite.x, 
	// 		y0: diagonalInfo.y0*triangleSpriteHalfWidth+triangleSprite.y, 
	// 		x1: diagonalInfo.x1*triangleSpriteHalfWidth+triangleSprite.x, 
	// 		y1: diagonalInfo.y1*triangleSpriteHalfWidth+triangleSprite.y
	// 	};
	return r;
}

// returns the direction of the "normal" of the trianlge's reflecting diagonal 
function triangleReflectDirection( triangleSprite ) {
	var r = {up:false,down:false,left:false,right:false};
	var a = Phaser.Math.snapToFloor( triangleSprite.angle + 45, 90 ); // round to nearest 90 angle
	if ( a == 0 ) {
		r.isUp = true;
		r.isRight = true;
	} else if ( a == -90 ) {
		r.isUp = true;
		r.isLeft = true;
	} else if ( a == 90 ) {
		r.isDown = true;
		r.isRight = true;
	} else {
		// -180 or 180
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
	var a = getShooterAngle();
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
// function clickOnTriangleReflectorListener(sprite,pointer) {
// 	console.log("clickOnTriangleReflectorListener: isReflectorBeingDragged="+sprite.isReflectorBeingDragged);
// 	if ( sprite.isReflectorBeingDragged ) {
// 		console.log("clickOnTriangleReflectorListener: the triangle is being dragged!!!!!!! Ignoring the click!")
// 		return;
// 	}
// 	if ( sprite.angle == Phaser.Math.snapToFloor(sprite.angle, 90) ) {
// 		rotateTriangleReflector(sprite, false);
// 	} else {
// 		console.log("clickOnTriangleReflectorListener: the triangle is rotating!!!!!!! Ignoring the click!")
// 	}
// }
function clickOnBoxReflectorListener(sprite,pointer) {
	sprite.play("safeMode");
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
			//shooter1.angle = 180;
			setShooterAngle( 180 )
			shooter1.body.velocity.setTo(0,saveVelocity);
			// shooter1.body.velocity.x = 0;
			// shooter1.body.velocity.y = saveVelocity;
			shooter1.x = rightLimitX;
		} else if ( shooter1.y < topLimitY && d.isLeft ) {
			changed = true;
			//shooter1.angle = 90;
			setShooterAngle( 90 );
			shooter1.body.velocity.x = -saveVelocity;
			shooter1.body.velocity.y = 0;
			shooter1.y = topLimitY;
		} else if ( shooter1.y > bottomLimitY && d.isLeft ) {
			changed = true;
			//shooter1.angle = 270;
			setShooterAngle( 270 );
			shooter1.body.velocity.y = 0;
			shooter1.body.velocity.x = -saveVelocity;
			shooter1.y = bottomLimitY;
		} else if ( shooter1.x > rightLimitX && d.isUp ) {
			changed = true;
			//shooter1.angle = 180;
			setShooterAngle( 180 );
			shooter1.body.velocity.x = 0;
			shooter1.body.velocity.y = -saveVelocity;
			shooter1.x = rightLimitX;
		} else if ( shooter1.x < leftLimitX && d.isUp ) {
			changed = true;
			//shooter1.angle = 0;
			setShooterAngle( 0 );
			shooter1.body.velocity.x = 0;
			shooter1.body.velocity.y = -saveVelocity;
			shooter1.x = leftLimitX;
		} else if ( shooter1.y > bottomLimitY && d.isRight ) {
			changed = true;
			//shooter1.angle = 270;
			setShooterAngle( 270 );
			shooter1.body.velocity.x = saveVelocity;
			shooter1.body.velocity.y = 0;
			shooter1.y = bottomLimitY;
		} else if ( shooter1.y < topLimitY && d.isRight ) {
			changed = true;
			//shooter1.angle = 90;
			setShooterAngle( 90 );
			shooter1.body.velocity.x = saveVelocity;
			shooter1.body.velocity.y = 0;
			shooter1.y = topLimitY;
		} else if ( shooter1.x < leftLimitX && d.isDown ) {
			changed = true;
			//shooter1.angle = 0;
			setShooterAngle( 0 );
			// shooter1.body.velocity.x = 0;
			// shooter1.body.velocity.y = saveVelocity;
			shooter1.body.velocity.setTo(0,saveVelocity);
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
	
}

function snapToShapeGrid( xy ) {
	return {
		x:Phaser.Math.snapToFloor(xy.x - extraWidth/2, gridSize)+halfGridSize+ extraWidth/2, 
		y:Phaser.Math.snapToFloor(xy.y - extraHeight/2, gridSize)+halfGridSize+ extraHeight/2
	};
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
	if ( !b.alive ) {
		return;
	}
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

				// the following snap shouldn't be necessary but just in case
				var toXY = snapToShapeGrid( {x:newLocationPoint.x, y:newLocationPoint.y} );
				b.x = toXY.x;
				b.y = toXY.y;

				if ( debug !== 0 ) console.log("updateSingleObjectPosition: completed move, checking if need to move again");
				var count = shapeCountAtLocation( newLocationPoint.x, newLocationPoint.y );
				if ( count > 1 ) {
					if ( debug !== 0 ) console.log("updateSingleObjectPosition: moving shape again");
					updateSingleObjectPosition( b );
				} else {
					if ( debug !== 0 ) console.log("updateSingleObjectPosition: did not need to move again")
				}
			}, this);
	if ( isShapeTriangle(b) ) {
		audioSlidingTriangle.play();
		rotateTriangleReflector( b, true );
	} else if ( b.name == 'greenBox' || b.name == 'greenBox10' || b.name == 'greenBox10time' ) {
		audioSlidingPrize.play();
	} else {
		audioSliding.play();
	}

}

// this function mischeiviously changes the locations of some or all of the deadly blue squares
// if allAlive is true then all objects in the array will be moved
// if allAlive is false and numObjects is specified then only that number of objects will be moved
// the default is for only one object from the objectsToMoveArr will be moved
function updateObjectPositions( objectsToMoveArr, allAlive, numObjects ) {
	if ( debug!==0 ) return;
	//if ( savedGameTime !== 0 ) return;
	
	// if an object has been repositioned manually recently then do not consider it as
	// a candidate to be moved randomly
	var objsNotMovedRecently = [];
	//var objsHitRecently = [];
	objectsToMoveArr.forEach(function(obj) {
		if ( !obj.gameTimeOfLastManualMove || game.time.now - obj.gameTimeOfLastManualMove > 15000 ) {
			// if ( !obj.gameTimeLaserLastHit ) {
			// 	obj.gameTimeLaserLastHit = 0;
			// }
			objsNotMovedRecently.push( obj );
		}
	});

	// // sort the array so that the objects that were hit most recently are at the top
	// objsNotMovedRecently.sort(function (a,b) {
	// 	if ( a.gameTimeLaserLastHit > b.gameTimeLaserLastHit ) {
	// 		return -1;
	// 	} else if ( a.gameTimeLaserLastHit === b.gameTimeLaserLastHit ) {
	// 		return 0;
	// 	}
	// 	return 1;
	// });

	if ( allAlive ) {
		objsNotMovedRecently.forEach( function(s) {
			if ( s.alive && !s.wasHit ) {
				// the wasHit property is set on prizes and timeBomb sprites 
				// when hit by the laser or when they explode
				updateSingleObjectPosition( s );
			}
		});
	} else if ( numObjects && numObjects > 1 ) {
		if ( numObjects > 0 ) {
			var objRemainingArr = objsNotMovedRecently.slice();
			for ( var i=0; i<objsNotMovedRecently.length; i++ ) {
				var rndObj = Phaser.Math.removeRandom( objRemainingArr );
				updateSingleObjectPosition( rndObj );
				if ( i === numObjects-1 ) break;
			}
		}
	} else {
		var b = Phaser.Math.getRandom( objsNotMovedRecently );
		updateSingleObjectPosition( b );
	}
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
		rx = (Math.floor(Math.random() * numBlocksHorizontal)+1) * gridSize + leftLimitX;
		ry = (Math.floor(Math.random() * numBlocksVertical)+1) * gridSize + topLimitY;
		hasShapeAtRxRy = hasShapeAt({x:rx,y:ry});
		//if (hasShapeAtRxRy) console.log("hasShapeAtRxRy=true, getting another rx/ry");
	}
	return {x:rx,y:ry};
}

function scrambleAllObjects() {
		// allGridObjectsArr.forEach(function (b) {
		// 	b.alive = false;
		// });
		// create new arrangements
		allGridObjectsArr.forEach(function (b) {
			var point = findEmptyGridLocation();
			b.x = point.x;
			b.y = point.y;
			// if ( b.alive ) {
			// 	var point = findEmptyGridLocation();
			// 	b.x = point.x;
			// 	b.y = point.y;
			// }
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
		if ( debug !== 0 ) console.log("resetObjectPositions: b.x="+b.x+", b.y="+b.y+", point.x="+point.x+", point.y="+point.y);
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

function setTextCenter( textObj, v, centerHorizontally, centerVertically ) {
	if ( !textObj.originalXY ) {
		textObj.originalXY = {};
		textObj.originalXY.x = textObj.x;
		textObj.originalXY.y = textObj.y;
	}
	textObj.setText(v);
	textObj.updateTransform();
	if ( centerHorizontally || centerHorizontally == null ) {
		textObj.position.x = textObj.originalXY.x - textObj.textWidth / 2;
	}
	if ( centerVertically ) {
		textObj.position.y = textObj.originalXY.y - textObj.textHeight / 2;
	}
}
function setTextRight( textObj, v ) {
	if ( !textObj.originalXY ) {
		textObj.originalXY = {};
		textObj.originalXY.x = textObj.x;
		textObj.originalXY.y = textObj.y;
	}
	textObj.setText(v);
	textObj.updateTransform();
	textObj.position.x = textObj.originalXY.x - textObj.textWidth;
}

function getShooterAngle() {
	return shooter1.angle;
}
function setShooterAngle( angle ) {
	shooter1.angle = angle;
	//shooter1.body.rotation = Phaser.Math.degToRad(angle);
}

// ===

// -- create special prize box

function createSpritesheetPrize10Points() {
	var fw = gridSize;
	var fh = gridSize;
	var pw = prizeWidth;
	var ph = prizeWidth;

	var bmd = game.add.bitmapData( fw * 4, fh );
	var ctx = bmd.context;

	ctx.fillStyle = "#2E8B57"; //seagreen
	ctx.translate(fw/2,fh/2);
	ctx.fillRect(-pw/2,-ph/2,pw,ph);
	// ctx.fillStyle = "#FFFFFF";
	// ctx.fillRect(-pw/2,-ph/2,pw,ph/2);

	ctx.translate(fw,0);
	ctx.fillStyle = "#2E8B57"; //seagreen
	ctx.fillRect(-pw/2,-ph/2,pw,ph);
	// ctx.fillStyle = "#FFFFFF";
	// ctx.fillRect(-pw/2,-ph/2,pw,ph/2);
	ctx.strokeStyle = "#FFFFFF";
	ctx.lineWidth = 5;
	// ctx.strokeRect(-pw/2-5,-pw/2-5, pw+10,pw+10);

	ctx.translate(fw,0);
	ctx.fillStyle = "#2E8B57"; //seagreen
	ctx.fillRect(-pw/2,-ph/2,pw,ph);
	// ctx.fillStyle = "#FFFFFF";
	// ctx.fillRect(-pw/2,-ph/2,pw,ph/2);
	ctx.strokeStyle = "#FFFFFF";
	ctx.lineWidth = 5;
	ctx.strokeRect(-pw/2-10,-pw/2-10, pw+20,pw+20);

	ctx.translate(fw,0);
	ctx.fillStyle = "#2E8B57"; //seagreen
	ctx.fillRect(-pw/2,-ph/2,pw,ph);
	// ctx.fillStyle = "#FFFFFF";
	// ctx.fillRect(-pw/2,-ph/2,pw,ph/2);
	ctx.strokeStyle = "#FFFFFF";
	ctx.lineWidth = 5;
	ctx.strokeRect(-pw/2-15,-pw/2-15, pw+30,pw+30);

	return bmd.canvas.toDataURL();
}

function createSpritesheetPrize10Seconds() {
	var fw = gridSize;
	var fh = gridSize;
	var pw = prizeWidth;
	var ph = prizeWidth;

	var bmd = game.add.bitmapData( fw * 4, fh );
	var ctx = bmd.context;

	ctx.fillStyle = "#2E8B57"; //seagreen
	ctx.translate(fw/2,fh/2);
	ctx.fillRect(-pw/2,-ph/2,pw,ph);
	ctx.fillStyle = "#FFFFFF";
	ctx.fillRect(-pw/2,-ph/2,pw/2,ph);

	ctx.translate(fw,0);
	ctx.fillStyle = "#2E8B57"; //seagreen
	ctx.fillRect(-pw/2,-ph/2,pw,ph);
	ctx.fillStyle = "#FFFFFF";
	ctx.fillRect(-pw/2,-ph/2,pw/2,ph);
	ctx.strokeStyle = "#FFFFFF";
	ctx.lineWidth = 5;
	// ctx.strokeRect(-pw/2-5,-pw/2-5, pw+10,pw+10);

	ctx.translate(fw,0);
	ctx.fillStyle = "#2E8B57"; //seagreen
	ctx.fillRect(-pw/2,-ph/2,pw,ph);
	ctx.fillStyle = "#FFFFFF";
	ctx.fillRect(-pw/2,-ph/2,pw/2,ph);
	ctx.strokeStyle = "#FFFFFF";
	ctx.lineWidth = 5;
	ctx.strokeRect(-pw/2-10,-pw/2-10, pw+20,pw+20);

	ctx.translate(fw,0);
	ctx.fillStyle = "#2E8B57"; //seagreen
	ctx.fillRect(-pw/2,-ph/2,pw,ph);
	ctx.fillStyle = "#FFFFFF";
	ctx.fillRect(-pw/2,-ph/2,pw/2,ph);
	ctx.strokeStyle = "#FFFFFF";
	ctx.lineWidth = 5;
	ctx.strokeRect(-pw/2-15,-pw/2-15, pw+30,pw+30);

	return bmd.canvas.toDataURL();
}

function createSpritesheetPrizeUnlockChallenge1() {
	var fw = gridSize;
	var fh = gridSize;
	var pw = prizeWidth;
	var ph = prizeWidth;

	var bmd = game.add.bitmapData( fw*6, fh );
	var ctx = bmd.context;

	ctx.fillStyle = "#B22222"; //firebrick
	ctx.translate(fw/2,fh/2);
	ctx.fillRect(-pw/2,-ph/2,pw,ph);

	ctx.translate(fw,0);
	ctx.fillStyle = "#B22222"; //firebrick
	ctx.fillRect(-pw/2,-ph/2,pw,ph);

	ctx.translate(fw,0);
	ctx.fillStyle = "#B22222"; //firebrick
	ctx.fillRect(-pw/2,-ph/2,pw,ph);
	// ctx.save();
	// ctx.fillStyle = "#FF0000"; //"rgba(255,0,0,0.25)"; //red
	// ctx.globalAlpha = 0.25;
	// ctx.fillRect(-p2/2,-ph/2,pw,ph);
	// ctx.restore();

	ctx.translate(fw,0);
	ctx.fillStyle = "#FF0000"; //firebrick
	ctx.fillRect(-pw/2,-ph/2,pw,ph);
	// ctx.save();
	// ctx.fillStyle = "#FF0000"; //"rgba(255,0,0,0.25)"; //red
	// ctx.globalAlpha = 0.5;
	// ctx.fillRect(-p2/2,-ph/2,pw,ph);
	// ctx.restore();

	ctx.translate(fw,0);
	ctx.fillStyle = "#B22222"; //firebrick
	ctx.fillRect(-pw/2,-ph/2,pw,ph);
	// ctx.save();
	// ctx.fillStyle = "#FF0000"; //"rgba(255,0,0,0.25)"; //red
	// ctx.globalAlpha = 0.75;
	// ctx.fillRect(-p2/2,-ph/2,pw,ph);
	// ctx.restore();

	ctx.translate(fw,0);
	ctx.fillStyle = "#FF0000"; //firebrick
	ctx.fillRect(-pw/2,-ph/2,pw,ph);
	// ctx.save();
	// ctx.fillStyle = "#FF0000"; //"rgba(255,0,0,0.25)"; //red
	// ctx.globalAlpha = 1;
	// ctx.fillRect(-p2/2,-ph/2,pw,ph);
	// ctx.restore();

	return bmd.canvas.toDataURL();
}

function timeToShowRedBoxesAfterGameStart() {
	return timeToShowRedBoxes()
}
function timeToShowRedBoxes() {
	return game.rnd.integerInRange(20000, 30000);
}

function showRedBoxPrizes() {
	if ( isShowingRedBoxes() ) {
		if ( debug !== 0 ) console.log("showRedBoxPrizes: already showing boxes so ignore request to show them now");
		return;
	}
	var p;
	var numOfBoxesToShow = 3;
	var pCount = 0;
	//while ( pCount < numOfBoxesToShow ) {
	//	p = redBoxGroup.getFirstDead();
	redBoxGroup.forEach( function(p) {
		if ( pCount >= numOfBoxesToShow ) {
			return; //no need to add more
		}
		pCount += 1;
		var point = findEmptyGridLocation();
		p.alpha = 0;
		p.scale.setTo(6,6);
		p.wasHit = true; // so that the laser cannot hit it when it is in the process of appearing
		p.reset( point.x, point.y );
		game.add.tween(p).to({alpha:1}, 500, Phaser.Easing.None, true);
		game.add.tween(p.scale).to({x:1,y:1}, 500, Phaser.Easing.None, true)
			.onComplete.add( function() {
					p.wasHit = false;
					p.alpha = 1;
					p.play("basic");
			});
		});
}

function hideRedBoxPrizes() {
	// TODO: should we worry about the case where the red boxes were hit or partially hit with the laser already? <<<<2
	redBoxArr.forEach( function(p) {
		//console.log("hideRedBoxPrizes: p.shapeId="+p.shapeId);
		p.wasHit = true;
		p.alive = false;
		game.add.tween(p).to({alpha:0},500, Phaser.Easing.None, true)
			.onComplete.add( function() {
				p.wasHit = false;
				p.kill();
				//console.log("hideRedBoxPrizes: onComplete p.shapeId="+p.shapeId);
			});
	});
	
}

function isShowingRedBoxes() {
	if ( redBoxGroup.countLiving() > 0 ) {
		return true;
	}
	return false;
}

function laserHitAllRedBoxes() {
	//TODO: maybe this should trigger a special game play mode where a challenge is presented
	
	totalPrizeHits += 100; // woo hoo!
	setTextRight( scoreText, totalPrizeHits.toString() );

	savedGameTime = game.time.now;

	removeAndKillAllTimeBombEvents();

	reflectorGroup1.forEachAlive(function(b) {
		b.alive = false;
		game.add.tween(b.scale).to({x:0,y:0}, 500, Phaser.Easing.Linear.None, true)
			.yoyo(true).repeat(3)
			.onComplete.add( function() {
				// b.visible = false;
				// b.scale.setTo(0,0);
			} );
	});
	prizeGroup.forEachAlive(function(b) {
		b.alive = false;
		game.add.tween(b.scale).to({x:0,y:0}, 500, Phaser.Easing.Linear.None, true)
			.yoyo(true).repeat(3)
			.onComplete.add( function() {
				// b.visible = false;
				// b.scale.setTo(0,0);
			} );
	});
	
	// game.time.events.add(1500, function(){
	// 	savedGameTime=0;
	// }, this);
	game.time.events.add(1500, function(){
		hideRedBoxPrizes();
		timeMarkerShowRedBoxes = game.time.now + timeToShowRedBoxes();
		showBonusInfo("+100 POINTS!",3000);
		continueRegularGamePlay();
	});

}

function shuffleAllReflectors() {	

	savedGameTime = game.time.now;
	allGridObjectsArr.forEach(function(b) {
		//b.alive = false;
		game.add.tween(b.scale).to({x:0,y:0}, 500, Phaser.Easing.Linear.None, true)
			.onComplete.add( function() {
				// b.visible = false;
				// b.scale.setTo(0,0);
				scrambleAllObjects();
				game.add.tween(b.scale).to({x:1,y:1}, 500, Phaser.Easing.Linear.None, true)
					.onComplete.add(function(){ 
						//b.alive = true; 
						savedGameTime = 0;
					});
			} );
	});
	
	// game.time.events.add(500, function(){
	// 	timeMarkerShowRedBoxes = game.time.now + timeToShowRedBoxes();
	// 	continueRegularGamePlay();
	// }, this);

}

function startupSequenceAllReflectors() {	

	savedGameTime = game.time.now;
	allGridObjectsArr.forEach(function(b) {
		//b.alive = false;

		b.alpha = 0;
		b.scale.setTo(6,6);

		game.add.tween(b).to({alpha:1}, 1000, Phaser.Easing.Linear.None, true);

		var tween1 = game.add.tween(b.scale).to({x:1,y:1}, 1000, Phaser.Easing.Linear.None, false)
			.to({x:0,y:0}, 250, Phaser.Easing.Linear.None, false)
			.to({x:1,y:1}, 250, Phaser.Easing.Sinusoidal.Out, false)
			;
		tween1.onComplete.add( function() {
				savedGameTime = 0;
			});
		tween1.start();

	});

}

function endingSequenceAllReflectors() {	

	savedGameTime = game.time.now;
	allGridObjectsArr.forEach(function(b) {
		//b.alive = false;

		//b.alpha = 0;
		//b.scale.setTo(6,6);

		game.add.tween(b).to({alpha:0}, 1000, Phaser.Easing.Linear.None, true);

		game.add.tween(b.scale)
			.to({x:0,y:0}, 250, Phaser.Easing.Linear.None, true)
			.to({x:6,y:6}, 1000, Phaser.Easing.Linear.None, false)
			.onComplete.add( function() {
				// b.visible = false;
				game.time.events.add(6000, function(){
					b.scale.setTo(0,0);
					game.add.tween(b).to({alpha:1}, 500, Phaser.Easing.Linear.None, true);
					game.add.tween(b.scale).to({x:1,y:1}, 500, Phaser.Easing.Back.Out, true)
						.onComplete.add( function() {savedGameTime = 0;} );
					//savedGameTime = 0;
					//b.scale.setTo(1,1);
					//b.alpha = 1;
				}, this);
				//scrambleAllObjects();
				// game.add.tween(b.scale).to({x:1,y:1}, 500, Phaser.Easing.Linear.None, true)
				// 	.onComplete.add(function(){ 
				// 		//b.alive = true; 
				// 		savedGameTime = 0;
				// 	});
			} );
	});

}

// ==

function timeSinceLastCommentOfType( type ) {
	if ( !savedGameTimeAtLastCommentOfType[type] ) {
		return 1000000;
	}
	return game.time.now - savedGameTimeAtLastCommentOfType[type];
}

var bonusInfoTween = null;
function showBonusInfo(txt, duration, type) {
	//console.log("showBonusInfo: txt=",txt);
	savedGameTimeAtLastComment = game.time.now;
	if ( type ) {
		savedGameTimeAtLastCommentOfType[type] = game.time.now;
	}
	if ( gameOver || shooterDead || gameLevelTimer <= 3 ) return;
	if ( bonusInfoTween ) {
		bonusInfoTween.stop();
		bonusInfoTween = null;
	}
	setTextCenter(bonusText, txt, true, true);
	bonusInfoGroup.visible = true;
	bonusInfoGroup.alpha = 1;
	bonusInfoTween = game.add.tween(bonusInfoGroup).to({alpha:0}, duration ? duration : 1000, Phaser.Easing.Linear.None, true);
	bonusInfoTween.onComplete.add( function(){ 
		bonusInfoGroup.visible = false; 
	} );
}

function continueRegularGamePlay() {
	if ( debug !== 0 ) console.log("\n\n\n\n*******continueRegularGamePlay*********\n\n\n\n");
	reflectorGroup1.forEachDead(function(b) {
		b.visible = true;
		b.alive = true;
		// game.add.tween(b.scale).to({x:1,y:1}, 1000, Phaser.Easing.Linear.None, true)
		// 	.onComplete.add( function(){ b.alive = true; });
	});
	prizeGroup.forEachDead(function(b) {
		b.visible = true;
		b.alive = true;
		// game.add.tween(b.scale).to({x:1,y:1}, 1000, Phaser.Easing.Linear.None, true)
		// 	.onComplete.add( function(){ b.alive = true; } );
	});
	game.time.events.add(2000, function(){
		restoreTimeMarkers();
		savedGameTime=0;
	}, this);
}

function restoreTimeMarkers() {
	var haltedTimeInterval = game.time.now - savedGameTime;
	timeMarkerMoveBlueSquares = game.time.now + haltedTimeInterval;
	timeMarkerMovePrizes = game.time.now + haltedTimeInterval;
	timeMarkerShowRedBoxes = game.time.now + haltedTimeInterval;
	timeMarkerHideRedBoxes = game.time.now + haltedTimeInterval;
	timeMarkerMoveTimeBomb = game.time.now + haltedTimeInterval;
	timeMarkerTweakTriangles = game.time.now + haltedTimeInterval;
	timeToLaunchTimeBomb = game.time.now + haltedTimeInterval;
}

// ===
// -- time bomb related...

function createSpritesheetTimeBomb() {
	// create bitmap data 
	var width = gridSize;
	var height = gridSize;
	var bombSize = prizeWidth;
	var bombSizeHalf = bombSize/2;
	var shiftXY = width/2-bombSize/2;

	var yellow = "#FFD700";
	var brightYellow = "#FFFF00";

	var bmd = game.add.bitmapData( width * 8, height );
	var ctx = bmd.context;

	ctx.save();

	// arm1/arm2 animation frames

	ctx.translate(shiftXY,shiftXY);
	ctx.fillStyle = "#2E8B57";
	ctx.fillRect(0,0,bombSize,bombSize);
	ctx.fillStyle = "#FFFFFF";
	ctx.fillRect(0,0,bombSize/2,bombSize/2);
	ctx.fillRect(bombSize/2,bombSize/2,bombSize/2,bombSize/2);

	ctx.translate(width,0);
	ctx.fillStyle = "#2E8B57";
	ctx.fillRect(0,0,bombSize,bombSize);
	ctx.fillStyle = "#FFFFFF";
	ctx.fillRect(bombSize/2,0,bombSize/2,bombSize/2);
	ctx.fillRect(0,bombSize/2,bombSize/2,bombSize/2);

	// arm3 animation frames

	ctx.translate(width,0);
	ctx.fillStyle = "#2E8B57";
	ctx.fillRect(0,0,bombSize,bombSize);
	
	ctx.translate(width,0);
	ctx.fillStyle = "#FFFFFF";
	ctx.fillRect(0,0,bombSize,bombSize);

	// explode animation frames

	ctx.translate(width,0);
	ctx.translate(bombSize/2,bombSize/2); // position in center of frame
	ctx.fillStyle = yellow;
	ctx.fillRect(-bombSize/2,-bombSize/2,bombSize,bombSize);
	ctx.fillStyle = brightYellow;
	ctx.fillRect(-5,-5,10,10);
	ctx.save();
	ctx.strokeStyle = brightYellow;
	ctx.beginPath();
	ctx.moveTo(0,-bombSize/2-5);
	ctx.lineTo(0,0);
	ctx.moveTo(0,bombSize/2+5);
	ctx.lineTo(0,height);
	ctx.moveTo(-bombSize-5,0);
	ctx.lineTo(1,0);
	ctx.moveTo(bombSize+5,0);
	ctx.lineTo(width-1,0);
	ctx.stroke();
	ctx.restore();

	ctx.translate(width,0);
	ctx.fillStyle = yellow;
	ctx.fillRect(-bombSize/2-10,-bombSize/2-10,bombSize+20,bombSize+20);
	ctx.fillStyle = brightYellow;
	ctx.fillRect(-15,-15,30,30);

	ctx.translate(width,0);
	ctx.fillStyle = yellow;
	ctx.fillRect(-bombSize/2-20,-bombSize/2-20,bombSize+40,bombSize+40);
	ctx.fillStyle = brightYellow;
	ctx.fillRect(-25,-25,50,50);

	ctx.translate(width,0);
	ctx.fillStyle = yellow;
	ctx.fillRect(-width/2,-width/2,width,width);
	ctx.fillStyle = brightYellow;
	ctx.fillRect(-40,-40,80,80);

	return bmd.canvas.toDataURL();
}

function timeBombAliveCount() {
	var count = 0;
	timeBombArr.forEach( function(tb) {
		if ( tb.alive ) {
			count += 1;
		}
	});
	return count;
}
function timeBombAliveArr() {
	var arr = [];
	timeBombArr.forEach( function(tb) {
		if ( tb.alive ) {
			arr.push( tb );
		}
	});
	return arr;
}

function launchTimeBomb() {
	if ( gameOver || shooterDead ) return;
	//if ( savedGameTime !== 0 ) return;
	//console.log("launchTimeBomb?");
	if ( timeBombGroup.countLiving() >= maxSimultaneousTimeBombs() ) {
		if ( debug !== 0 ) console.log("too many time bombs in play based on time remaining so skip launch");
		return;
	}
	if ( debug !== 0 ) console.log("********** launchTimeBomb **********");
	var timeBombSprite = timeBombGroup.getFirstDead();
	if ( timeBombSprite === null ) {
		if ( debug !== 0 ) console.log("unable to find an available time bomb");
		return;
	}
	if ( debug !== 0 ) console.log("FOUND an available time bomb!!! shapeId="+timeBombSprite.shapeId);
	var point = findEmptyGridLocation();
	timeBombSprite.alpha = 0;
	timeBombSprite.scale.setTo(6,6);
	timeBombSprite.wasHit = true; // so that the laser cannot hit it when the timeBomb is in the process of appearing
	timeBombSprite.reset( point.x, point.y );
	game.add.tween(timeBombSprite).to({alpha:1}, 500, Phaser.Easing.None, true);
	game.add.tween(timeBombSprite.scale).to({x:1,y:1}, 500, Phaser.Easing.None, true)
		.onComplete.add( function() {
				timeBombSprite.wasHit = false;
		});
	audioTimeBombLaunched.play();
	timeBombSprite.play('arm1');
	//timeBombSprite.alpha = 0.1;
	if ( timeBombGroup.countLiving() >= 4 && gameLevelTimer < 100 ) {
		showBonusInfo("Time Bomb ALERT!", 2000);
	}
	setTimeBombEvent( timeBombSprite, "arm1" );
}

function maxSimultaneousTimeBombs() {
	if ( gameLevelTimer < 25 )	{
		return 1;
	} else if ( gameLevelTimer < 50 ) {
		return 2;
	} else if ( gameLevelTimer < 100 ) {
		return 4;
	} else if ( gameLevelTimer < 150 ) {
		return 6;
	} else if ( gameLevelTimer < 175 ) {
		return 8;
	}
	return 10;
}
function timeBombIntervalNextBombLaunch() {
	return game.rnd.integerInRange(1000, 15000);
}

function destroyedTimeBomb( timeBombSprite ) {
	removeTimeBombEvent( timeBombSprite );
	timeBombSprite.kill();
	//debugTimeBombEvents();
}
function fadeOutAllTimeBombs() {
	game.add.tween(timeBombGroup).to({alpha:0}, 1000, Phaser.Easing.None, true)
		.onComplete.add( function () {
			removeAndKillAllTimeBombEvents();
			timeBombGroup.alpha = 1;
		});
	// game.add.tween(timeBombTextGroup).to({alpha:0}, 1000, Phaser.Easing.None, true)
	// 	.onComplete.add( function () {
	// 		//removeAndKillAllTimeBombEvents();
	// 		timeBombTextGroup.alpha = 1;
	// 	});	
}

function removeAndKillAllTimeBombEvents() {
	if ( debug !== 0 ) console.log("removeAndKillAllTimeBombEvents: IN");
	var sprite, shapeId;
	//var shapeId in timeBombTimerInfo
	for ( var shapeId in timeBombTimerInfo ) {
		if ( debug !== 0 ) console.log("timeBomb.shapeId="+shapeId);
		sprite = timeBombTimerInfo[shapeId];
		if ( sprite ) {
			if ( debug !== 0 ) console.log("about to remove time bomb event for shapeId="+shapeId);
			removeTimeBombEvent( sprite );
			sprite.kill();
		}
		timeBombTimerInfo[shapeId] = null;
	}
	if ( debug !== 0 ) console.log("removeAndKillAllTimeBombEvents: OUT");
}

function removeTimeBombEvent( timeBombSprite ) {
	if ( timeBombSprite.timeBombEvent ) {
		if ( timeBombSprite.timeBombEventType !== "explode" ) {
			// do not remove this event because and explode event is the thing that cleans up the explosion after it exploded
			// and that event callback will not trigger further callbacks
			game.time.events.remove( timeBombSprite.timeBombEvent );
		}
		timeBombSprite.timeBombEvent = null;
		timeBombSprite.timeBombEventType = null;
		timeBombTimerInfo[timeBombSprite.shapeId] = null;
		timeBombSprite.textMinus25Sprite = null;
	}
}
function setTimeBombEvent( timeBombSprite, eventType ) {
	removeTimeBombEvent( timeBombSprite );
	var timeInterval;
	if ( eventType === "arm1" ) {
		timeInterval = 15;
	} else if ( eventType === "arm2" ) {
		timeInterval = 5;
	} else if ( eventType === "arm3" ) {
		timeInterval = 2;
	} else {
		// eventType === "explode"
		timeInterval = 2;
	}
	timeBombSprite.timeBombEvent = game.time.events.add( 
		Phaser.Timer.SECOND*timeInterval, 
		function () {
			timeBombEventCB(timeBombSprite, eventType);
		}, 
		this);
	timeBombSprite.timeBombEventType = eventType;
	timeBombTimerInfo[timeBombSprite.shapeId] = timeBombSprite;

	// for debugging
	// if ( debug === 20140407 ) {
	// 	for ( var shapeId in timeBombTimerInfo ) {
	// 		console.log("timeBomb.shapeId="+shapeId);
	// 		if ( timeBombTimerInfo[shapeId] ) {
	// 			console.log("timeBombTimerInfo["+shapeId+"].shapeId="+timeBombTimerInfo[shapeId].shapeId);
	// 		}
	// 	}
	// }

	if ( debug !== 0 ) console.log("timeBomb.shapeId="+timeBombSprite.shapeId+", gameLevelTimer="+gameLevelTimer+",  eventType="+eventType);
}

function timeBombEventCB( timeBombSprite, eventType ) {
	timeBombSprite.timeBombEvent = null;
	if ( eventType === "arm1" ) {
		timeBombSprite.play('arm2');
		setTimeBombEvent( timeBombSprite, "arm2" );
	} else if ( eventType === "arm2" ) {
		timeBombSprite.play('arm3');
		audioTimeBombArm3.play();
		setTimeBombEvent( timeBombSprite, "arm3" );
	} else if ( eventType === "arm3" ) {
		// start the explode sequence if not already hit
		// ***maybe at the moment that the laser hits the timebomb is when the timebomb event should be removed
		//    in case the wasHit flag is changed before this callback is invoked
		if ( timeBombSprite.wasHit ) {
			// must have been hit with the laser just before it was about to explode
			removeTimeBombEvent( timeBombSprite ); // should be unnecessary
			return;
		}
		timeBombSprite.wasHit = true; // so that the shooter my not hit this while it is exploding
		gameLevelTimer -= 25; //Math.floor(gameLevelTimer - gameLevelTimer/4);
		if ( gameLevelTimer < 0 ) {
			gameLevelTimer = 0;
		}
		timeBombSprite.play('explode');
		audioTimeBombExplode.play();
		setTimeBombEvent( timeBombSprite, "explode" );
	} else {
		// eventType === "explode"
		timeBombExplodeCallback( timeBombSprite );
	}
}

function timeBombExplodeCallback( timeBombSprite ) {
	timeBombSprite.timeBombEvent = null;
	removeTimeBombEvent( timeBombSprite );
	
	var textMinus25 = timeBombTextGroup.getFirstDead();
	textMinus25.alpha = 1;
	textMinus25.reset( timeBombSprite.x, timeBombSprite.y );
	timeBombSprite.textMinus25Sprite = textMinus25;

	game.add.tween(timeBombSprite).to({alpha:0},1000,Phaser.Easing.Linear.None,true)
		.onComplete.add(function() {
			if ( timeBombSprite.textMinus25Sprite ) {
				timeBombSprite.textMinus25Sprite.kill();
				timeBombSprite.textMinus25Sprite = null;
			}
			timeBombSprite.kill();
		});
}

// ==

function resetGamePlayStats() {
	savedGameTimeAtLastRestartLevel = game.time.now;
	savedGameTimeAtLastPrizeHit = 0; //game.time.now;
	savedGameTimeAtLastLaserFiring = 0; //game.time.now;
	savedPrizeHitCountPerShotArr = [];
	savedPrizeHitScorePerSuccessfulShotArr = [];
}

function avgHitCount( numLastShots ) {
	//savedPrizeHitCountPerShotArr.push( r.prizeArr.length );
	if ( savedPrizeHitCountPerShotArr.length === 0 ) return 0;
	var totalHits = 0;
	var count = 0;
	for ( var i=savedPrizeHitCountPerShotArr.length-1; i>=0; i-- ) {
		totalHits += savedPrizeHitCountPerShotArr[i];
		count += 1;
		if ( count >= numLastShots ) {
			break;
		}
	}
	return totalHits / count; //count will not be zero!
}

function avgHitScore( numLastShots ) {
	//savedPrizeHitCountPerShotArr.push( r.prizeArr.length );
	if ( savedPrizeHitScorePerSuccessfulShotArr.length === 0 ) return 0;
	var totalHitScore = 0;
	var count = 0;
	for ( var i=savedPrizeHitScorePerSuccessfulShotArr.length-1; i>=0; i-- ) {
		totalHitScore += savedPrizeHitScorePerSuccessfulShotArr[i];
		count += 1;
		if ( count >= numLastShots ) {
			break;
		}
	}
	return totalHitScore / count; //count will not be zero!
}

function removeActiveTimers() {
	// nonPlayModeTimersActiveArr.forEach( function (t) {
	// 	game.time.events.remove( t );
	// });
	game.time.events.removeAll();
}

// finally
game.state.add('main', game_state.main);
game.state.start('main');
