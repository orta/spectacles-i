/***
 * Specs Engine v6: Spectacles Saga Game Engine
  *           Copyright (c) 2013 Power-Command
***/

RequireScript('lib/json2.js');
RequireScript('lib/MultiDelegate.js');
RequireScript('lib/persist.js');
RequireScript('lib/Scenario.js');
RequireScript('lib/SpriteImage.js');

var DBG_DISABLE_BATTLES = false;
var DBG_DISABLE_BGM = true;
var DBG_DISABLE_TEXTBOXES = true;
var DBG_DISABLE_TITLE_CARD = true;
var DBG_DISABLE_TITLE_SCREEN = true;
var DBG_DISABLE_TRANSITIONS = true;

EvaluateScript('Game.js');

RequireScript('Core/Engine.js');
RequireScript('Core/BGM.js');
RequireScript('Core/Console.js');
RequireScript('Core/Threads.js');
RequireScript('Battle.js');
RequireScript('Cutscenes.js');
RequireScript('MenuStrip.js');
RequireScript('Session.js');
RequireScript('TitleScreen.js');

// PATCH! - Scenario.run() method
// Scenario's built-in wait loop locks the Specs threader under most circumstances.
// This patches it so it plays along.
(function() {
	var old_Scenario_run = Scenario.prototype.run;
	
	Scenario.prototype.run = function(waitUntilDone)
	{
		old_Scenario_run.call(this, false);
		if (waitUntilDone) {
			Threads.waitFor(Threads.doWith(this, function() {
				return this.isRunning();
			}));
		}
		return this;
	}
})();

// clone() function
// Creates a deep copy of an object, preserving circular references.
// Arguments:
//     o: The object to clone.
function clone(o)
{
	var clones = arguments.length >= 2 ? arguments[1] : [];
	if (typeof o === 'object' && o !== null) {
		for (var i = 0; i < clones.length; ++i) {
			if (o === clones[i].original) {
				return clones[i].dolly;
			}
		}
		var dolly = {};
		clones.push({ original: o, dolly: dolly });
		for (var p in o) {
			dolly[p] = clone(o[p], clones);
		}
		return dolly;
	} else {
		return o;
	}
};

// delegate() function
// Creates a method delegate from an object and function. When the delegate is called, control is
// handed over to the function, with the object set as 'this'.
// Arguments:
//     o:      The object to pass as 'this' to the method.
//     method: The function to invoke when the delegate is called.
// Returns:
//     A function that, when called, invokes the method with the specified object as 'this'.
//     Note that if method is null, delegate() also returns null.
function delegate(o, method)
{
	if (method !== null) {
		return function(/*...*/) {
			return method.apply(o, arguments);
		};
	} else {
		return null;
	}
}

// game() function
// This is called by Sphere when the game is launched.
function game()
{
	Engine.initialize(60);
	Threads.initialize();
	BGM.initialize();
	Scenario.initialize();
	Threads.doWith(Scenario,
		function() { this.updateAll(); return true; },
		function() { this.renderAll(); }, 99
	);
	Console.initialize(17);
	persist.init();
	
	if (!DBG_DISABLE_TITLE_CARD) {
		BGM.change("SpectaclesTheme");
		Engine.showLogo("TitleCard", 150);
	}
	var session = new TitleScreen("SpectaclesTheme").show();
	var world = persist.getWorldState();
	world.currentSession = session;
	
	/*ALPHA*/
	var battleResult = new Battle(world.currentSession, 'robert2').go();
	if (battleResult == BattleResult.enemyWon) {
		Abort("You lost...\n\nOh well, have fun in Terminus! Say hello to Scott Temple for me, okay? :o)");
	} else if (battleResult == BattleResult.partyWon) {
		Abort("Yay! You win!\n\nWait a minute... you didn't cheat, did you...? I'm on to you!");
	} else if (battleResult == BattleResult.partyRetreated) {
		Abort("You coward! You suck!");
	} else {
		Abort("Um... what's going on here? That was a really strange battle...");
	}
	
	MapEngine("main.rmp", Engine.frameRate);
}
