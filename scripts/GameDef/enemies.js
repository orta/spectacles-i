/***
 * Specs Engine v6: Spectacles Saga Game Engine
  *           Copyright (c) 2015 Power-Command
***/

RequireScript('AIs/HeadlessHorseAI.js');
RequireScript('AIs/LumisquirrelAI.js');
RequireScript('AIs/Robert1AI.js');
RequireScript('AIs/Robert2AI.js');
RequireScript('AIs/ScottTempleAI.js');
RequireScript('AIs/ScottStarcrossAI.js');
RequireScript('AIs/VictorAI.js');

Game.enemies =
{
	// Headless Horse (Spectacles: Bruce's Story)
	// Fought in the courtyard of Lexington Manor
	headlessHorse: {
		name: "H. Horse",
		fullName: "Headless Horse",
		aiType: HeadlessHorseAI,
		hasLifeBar: true,
		tier: 2,
		turnRatio: 3.0,
		baseStats: {
			vit: 50,
			str: 10,
			def: 55,
			foc: 65,
			mag: 30,
			agi: 70
		},
		damageModifiers: {
			bow: Game.bonusMultiplier,
			gun: Game.bonusMultiplier,
			fire: -1.0,
			fat: Game.bonusMultiplier
		},
		immunities: [],
		munchData: {
			skill: 'spectralDraw'
		}
	},
	
	lumisquirrel: {
		name: "Lumisquirrel",
		aiType: LumisquirrelAI,
		baseStats: {
			vit: 30,
			str: 20,
			def: 15,
			foc: 80,
			mag: 95,
			agi: 90
		},
		damageModifiers: {
			bow: Game.bonusMultiplier,
			shuriken: Game.bonusMultiplier,
			lightning: 1 / Game.bonusMultiplier
		},
		immunities: [],
		munchData: {
			skill: 'delusion'
		}
	},
	
	victor: {
		name: "Victor",
		fullName: "Victor Spellbinder",
		aiType: VictorAI,
		hasLifeBar: true,
		tier: 3,
		turnRatio: 1.0,
		baseStats: {
			vit: 50,
			str: 60,
			def: 85,
			foc: 75,
			mag: 85,
			agi: 50,
		},
		immunities: [],
		weapon: 'templeSword',
		items: [
			'alcohol'
		],
	},
	
	// Robert Spellbinder (I) (Spectacles: Bruce's Story)
	// Fought on the balcony of Temple Manor
	robert1: {
		name: "Robert",
		fullName: "Robert Spellbinder",
		aiType: Robert1AI,
		hasLifeBar: true,
		tier: 3,
		turnRatio: 3.0,
		baseStats: {
			vit: 75,
			str: 75,
			def: 75,
			foc: 75,
			mag: 75,
			agi: 75
		},
		immunities: [],
		weapon: 'rsbSword',
		munchData: {
			skill: 'omni'
		},
		items: [
			'tonic',
			'powerTonic',
			'vaccine'
		]
	},
	
	// Robert Spellbinder (II) (Spectacles: Bruce's Story)
	// Final Boss of Spectacles: Bruce's Story
	robert2: {
		name: "Robert",
		fullName: "Robert Spellbinder",
		aiType: Robert2AI,
		hasLifeBar: true,
		tier: 3,
		turnRatio: 1.0,
		baseStats: {
			vit: 75,
			str: 75,
			def: 75,
			foc: 75,
			mag: 75,
			agi: 75
		},
		immunities: [],
		weapon: 'rsbSword',
		munchData: {
			skill: 'omni'
		},
		items: [
			'tonic',
			'powerTonic',
			'redBull',
			'holyWater',
			'vaccine',
			'alcohol'
		]
	},
	
	// Scott Temple (Spectacles III)
	// Penultimate Boss of Spectacles III
	scottTemple: {
		name: "Scott T",
		fullName: "Scott Victor Temple",
		aiType: ScottTempleAI,
		hasLifeBar: true,
		tier: 3,
		turnRatio: 2.0,
		baseStats: {
			vit: 100,
			str: 85,
			def: 80,
			foc: 60,
			mag: 90,
			agi: 70
		},
		immunities: [ 'zombie' ],
		weapon: 'templeSword'
	},
	
	// Scott Starcross (Spectacles III)
	// Final Boss of Spectacles III
	scottStarcross: {
		name: "Scott",
		fullName: "Scott Starcross",
		aiType: ScottStarcrossAI,
		hasLifeBar: true,
		tier: 4,
		turnRatio: 2.0,
		baseStats: {
			vit: 80,
			str: 80,
			def: 80,
			foc: 80,
			mag: 80,
			agi: 80
		},
		immunities: [],
		weapon: 'templeSword'
	},
	
	// Katelyn (Spectacles 0: Nothing's Call)
	// No idea what the heck this girl is doing here! My guess is she's probably going
	// to get eaten. By a hunger-pig. Which will then, um, eat itself, for... some reason?
	// Probably to show off.
	katelyn: {
		name: "Katelyn",
		fullName: "Katelyn Hippofoood",
		aiType: ScottStarcrossAI,
		hasLifeBar: true,
		tier: 1,
		baseStats: {
			vit: 0,
			str: 0,
			def: 0,
			foc: 0,
			mag: 0,
			agi: 0
		},
		immunities: [],
		weapon: 'templeSword'
	}
};
