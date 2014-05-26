/***
 * Specs Engine v6: Spectacles Saga Game Engine
  *           Copyright (c) 2013 Power-Command
***/

Game.conditions =
{
	// Blackout field condition
	// Lowers accuracy and sometimes retargets attacks.
	blackout:
	{
		name: "Blackout",
		
		actionTaken: function(battle, eventData) {
			if (eventData.targets.length == 1 && 0.5 > Math.random()) {
				var target = eventData.targets[0];
				var newTargets = Math.random() < 0.5
					? battle.alliesOf(target)
					: battle.enemiesOf(target);
				var targetID = Math.min(Math.floor(Math.random() * newTargets.length), newTargets.length - 1);
				eventData.targets = [ newTargets[targetID] ];
			}
		}
	},
	
	// General Disarray field condition
	// Randomizes the move rank of any skill or item used. Wears off after
	// 15 actions.
	generalDisarray:
	{
		name: "G. Disarray",
		
		initialize: function(battle) {
			this.actionsLeft = 15;
		},
		
		actionTaken: function(battle, eventData) {
			eventData.action.rank = Math.min(Math.floor(Math.random() * 5 + 1), 5);
			--this.actionsLeft;
			if (this.actionsLeft > 0) {
				Console.writeLine("G. Disarray will expire in " + this.actionsLeft + " more action(s)");
			} else {
				Console.writeLine("G. Disarray has expired");
				battle.liftCondition('generalDisarray');
			}
		}
	},
	
	// Healing Aura field condition
	// Restores a small amount of health to a random battler at the beginning of
	// each cycle. Wears off after 25 healings.
	healingAura:
	{
		name: "Healing Aura",
		
		initialize: function(battle) {
			this.cyclesLeft = 25;
		},
		
		beginCycle: function(battle, eventData) {
			var units = Link(battle.battleUnits)
				.where(function(unit) { return unit.isAlive(); })
				.toArray();
			var unit = units[Math.min(Math.floor(Math.random() * units.length), units.length - 1)];
			var vit = Game.math.statValue(unit.battlerInfo.baseStats.vit, unit.battlerInfo.level);
			unit.heal(vit, [ 'reGen' ]);
			--this.cyclesLeft;
			if (this.cyclesLeft <= 0) {
				Console.writeLine("Healing Aura has expired");
				battle.liftCondition('healingAura');
			} else {
				Console.writeLine("Healing Aura will expire in " + this.cyclesLeft + " more cycle(s)");
			}
		}
	},
	
	// Inferno field condition
	// Inflicts a small amount of Fire damage on all battlers at the beginning of a
	// cycle. The effect diminishes over time, settling at half its original
	// damage output.
	inferno:
	{
		name: "Inferno",
		overrules: [ 'subzero' ],
		
		initialize: function(battle) {
			this.multipliers = {};
		},
		
		beginCycle: function(battle, eventData) {
			var units = Link(battle.battleUnits)
				.where(function(unit) { return unit.isAlive(); })
				.toArray();
			var unit = units[Math.min(Math.floor(Math.random() * units.length), units.length - 1)];
			var vit = Game.math.statValue(unit.battlerInfo.baseStats.vit, unit.battlerInfo.level);
			if (!(unit.id in this.multipliers)) {
				this.multipliers[unit.id] = 1.0;
			}
			unit.takeDamage(vit * this.multipliers[unit.id], [ 'special', 'fire' ]);
			this.multipliers[unit.id] = Math.max(this.multipliers[unit.id] - 0.05, 0.5);
		},
		
		unitDamaged: function(battle, eventData) {
			if (Link(eventData.tags).contains('ice') && eventData.unit.stance != BattleStance.guard) {
				eventData.amount *= Game.bonusMultiplier;
				Console.writeLine("Ice damage taken during Inferno, damage increased");
			}
		}
	},

	// Subzero field condition
	// Inflicts a small amount of Ice damage on a battler at the end of his turn.
	// The effect intensifies over time per battler, maxing out at double its original
	// output.
	subzero:
	{
		name: "Subzero",
		overrules: [ 'inferno' ],
		
		initialize: function(battle) {
			this.multipliers = {};
		},
		
		endTurn: function(battle, eventData) {
			var unit = eventData.actingUnit;
			if (unit.isAlive()) {
				var vit = Game.math.statValue(unit.battlerInfo.baseStats.vit, unit.battlerInfo.level);
				if (!(unit.id in this.multipliers)) {
					this.multipliers[unit.id] = 1.0;
				}
				unit.takeDamage(vit * this.multipliers[unit.id], [ 'special', 'ice' ]);
				this.multipliers[unit.id] = Math.max(this.multipliers[unit.id] + 0.10, 2.0);
			}
		},
		
		unitDamaged: function(battle, eventData) {
			if (Link(eventData.tags).contains('fire') && eventData.unit.stance != BattleStance.guard) {
				eventData.amount *= Game.bonusMultiplier;
				Console.writeLine("Fire damage taken during Subzero, damage increased");
			}
		}
	},
	
	// Thunderstorm field condition
	// Strikes a battler every so often at the end of their turn, dealing a small amount
	// of lightning damage and inflicting Zombie status.
	thunderstorm:
	{
		name: "Thunderstorm",
		
		endTurn: function(battle, eventData) {
			if (0.1 > Math.random()) {
				var unit = eventData.actingUnit;
				var level = battle.getLevel();
				var attack = Game.math.statValue(100, level);
				var defense = Game.math.statValue(0, level);
				var damage = Game.math.damage.calculate(5, battle.getLevel(), unit.tier, attack, defense);
				unit.takeDamage(damage, [ 'special', 'lightning' ]);
				unit.addStatus('zombie');
			}
		}
	}
};
