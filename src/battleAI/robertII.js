/***
 * Specs Engine v6: Spectacles Saga Game Engine
  *           Copyright (c) 2017 Power-Command
***/

RequireScript('battleEngine/battleAI.js');

class Robert2AI extends BattleAI
{
	constructor(unit, battle)
	{
		super(unit, battle);
		this.definePhases([ 4000, 2500, 1500, 500 ], 50);
		this.defaultSkill = 'swordSlash';

		this.hasZombieHealedSelf = false;
		this.isAlcoholPending = false;
		this.isAlcoholUsed = false;
		this.isNecroTonicItemPending = false;
		this.isNecromancyPending = false;
		this.isScottZombie = false;
		this.necroTonicItem = null;
		this.necromancyChance = 0.0;
		this.nextElementalMove = null;
		this.scottStance = Stance.Attack;
		this.scottImmuneTurnsLeft = 0;
		this.zombieHealAlertLevel = 0.0;
		this.zombieHealFixState = null;
	}

	strategize()
	{
		switch (this.phase) {
			case 1:
				let magicks = [ 'hellfire', 'windchill', 'electrocute', 'upheaval' ];
				if (this.doChargeSlashNext) {
					this.queueSkill('chargeSlash');
					this.doChargeSlashNext = false;
				} else if (this.scottStance == Stance.Attack || this.isComboStarted) {
					qsTurns = this.predictSkillTurns('quickstrike');
					if (qsTurns[0].unit === this.unit) {
						this.queueSkill('quickstrike');
						this.isComboStarted = true;
					} else {
						if (this.isComboStarted) {
							this.queueSkill('swordSlash');
							this.doChargeSlashNext = true;
							this.isComboStarted = false;
						} else {
							let skillID = random.sample(magicks);
							if (this.isSkillUsable(skillID))
								this.queueSkill(skillID);
							else
								this.queueSkill('swordSlash');
						}
					}
				} else {
					let skillID = random.sample(magicks);
					if (this.isSkillUsable(skillID))
						this.queueSkill(skillID);
					else
						this.queueSkill('swordSlash');
				}
				break;
			case 2:
				this.isStatusHealPending =
					(this.unit.hasStatus('frostbite') || this.unit.hasStatus('ignite'))
					&& this.isStatusHealPending;
				var qsTurns = this.predictSkillTurns('quickstrike');
				if (this.isStatusHealPending && this.hasZombieHealedSelf
					&& !this.wasHolyWaterUsed && this.unit.hasStatus('zombie') && this.isItemUsable('holyWater'))
				{
					var holyWaterTurns = this.predictItemTurns('holyWater');
					if (holyWaterTurns[0].unit === this.unit && this.isItemUsable('tonic')) {
						this.queueItem('holyWater');
						this.queueItem('tonic');
						this.wasTonicUsed = true;
					} else {
						this.queueItem('holyWater');
						this.wasTonicUsed = false;
					}
					this.wasHolyWaterUsed = true;
				} else if (this.isStatusHealPending && (this.unit.hasStatus('frostbite') || this.unit.hasStatus('ignite'))) {
					var skillID = this.unit.hasStatus('frostbite') ? 'flare' : 'chill';
					var spellTurns = this.predictSkillTurns(skillID);
					var isTonicUsable = (!this.unit.hasStatus('zombie') || this.wasHolyWaterUsed || !this.hasZombieHealedSelf)
						&& this.isItemUsable('tonic');
					if (spellTurns[0].unit === this.unit && isTonicUsable || this.wasTonicUsed) {
						this.queueSkill(skillID, Stance.Attack, 'robert2');
						if (!this.wasTonicUsed && isTonicUsable) {
							this.queueItem('tonic');
						} else {
							this.queueSkill(this.nextElementalMove !== null ? this.nextElementalMove
								: skillID == 'chill' ? 'flare' : 'chill');
						}
					} else if (!this.wasTonicUsed && isTonicUsable) {
						this.queueItem('tonic');
					} else {
						this.queueSkill(this.nextElementalMove !== null ? this.nextElementalMove
							: skillID == 'chill' ? 'flare' : 'chill');
					}
					this.isStatusHealPending = false;
					this.wasHolyWaterUsed = false;
				} else if ((random.chance(0.5) || this.isComboStarted) && qsTurns[0].unit === this.unit) {
					this.queueSkill('quickstrike');
					this.isComboStarted = true;
					this.wasHolyWaterUsed = false;
				} else if (this.isComboStarted) {
					var skillToUse = random.chance(0.5)
						? random.sample([ 'hellfire', 'windchill', 'electrocute', 'upheaval' ])
						: 'chargeSlash';
					this.queueSkill(skillToUse);
					if (skillToUse == 'upheaval')
						this.queueSkill('quake');
					this.isComboStarted = false;
					this.isStatusHealPending = skillToUse == 'upheaval';
					this.wasHolyWaterUsed = false;
				} else {
					var skillToUse = random.sample([ 'hellfire', 'windchill', 'electrocute', 'upheaval' ]);
					this.queueSkill(skillToUse);
					if (skillToUse == 'upheaval')
						this.queueSkill('quake');
					this.isStatusHealPending = skillToUse == 'upheavel';
					this.wasHolyWaterUsed = false;
				}
				break;
			case 3:
				var holyWaterTurns = this.predictItemTurns('holyWater');
				if (this.isChargeSlashPending && !this.unit.hasStatus('protect')) {
					this.queueSkill('chargeSlash');
					this.isChargeSlashPending = false;
				} else if (this.unit.hasStatus('zombie') && this.hasZombieHealedSelf
					&& this.isItemUsable('holyWater') && this.isItemUsable('tonic')
					&& holyWaterTurns[0].unit === this.unit)
				{
					this.queueItem('holyWater');
					this.queueItem('tonic');
				} else if ((this.unit.hasStatus('ignite') || this.unit.hasStatus('frostbite')) && this.elementalsTillRevenge > 0) {
					--this.elementalsTillRevenge;
					if (this.elementalsTillRevenge <= 0) {
						this.queueSkill('lightning');
						this.necroTonicItem = 'powerTonic';
					} else {
						if (this.unit.hasStatus('ignite')) {
							this.queueSkill('chill', Stance.Attack, 'robert2');
						} else if (this.unit.hasStatus('frostbite')) {
							this.queueSkill('flare', Stance.Attack, 'robert2');
						}
					}
				} else if (random.chance(0.5) || this.isComboStarted) {
					var forecast = this.predictSkillTurns('chargeSlash');
					if ((forecast[0].unit === this.unit && !this.isComboStarted) || this.doChargeSlashNext) {
						this.isComboStarted = false;
						if (forecast[0].unit === this.unit) {
							this.queueSkill('chargeSlash');
						} else {
							this.queueSkill(this.nextElementalMove !== null
								? this.nextElementalMove
								: random.sample([ 'flare', 'chill' ]));
						}
					} else {
						this.isComboStarted = true;
						forecast = this.predictSkillTurns('quickstrike');
						if (forecast[0].unit === this.unit) {
							this.queueSkill('quickstrike');
						} else {
							var skillToUse = random.chance(0.5) ? 'upheaval' : 'swordSlash';
							if (this.isSkillUsable(skillToUse)) {
								this.queueSkill(skillToUse);
								if (skillToUse == 'upheaval')
									this.queueSkill('quake');
								this.doChargeSlashNext = skillID == 'swordSlash';
								this.isComboStarted = false;
							} else {
								this.queueSkill('swordSlash');
								this.doChargeSlashNext = true;
								this.isComboStarted = false;
							}
						}
					}
				} else {
					var skillID = random.sample([ 'hellfire', 'windchill', 'electrocute', 'upheaval' ]);
					this.queueSkill(skillID);
					if (skillID == 'upheaval')
						this.queueSkill('quake');
				}
				break;
			case 4:
				var skillID = random.sample([ 'hellfire', 'windchill', 'electrocute', 'upheaval' ]);
				var finisherID = this.isSkillUsable(skillID) ? skillID : 'swordSlash';
				var qsTurns = this.predictSkillTurns('quickstrike');
				this.queueSkill(qsTurns[0].unit == this.unit ? 'quickstrike' : finisherID);
				if (this.isSkillQueued(finisherID) && this.scottStance == Stance.Guard)
					this.queueSkill('chargeSlash');
				break;
			case 5:
				if (this.isAlcoholPending) {
					if (this.unit.hasStatus('zombie')) {
						if (this.isSkillUsable('omni'))
							this.queueSkill('omni');
						this.queueSkill('chargeSlash');
						this.isAlcoholPending = false;
						this.isDesperate = true;
					} else {
						this.isAlcoholPending = false;
						this.queueItem('alcohol');
						this.queueSkill('chargeSlash');
						this.queueSkill('hellfire');
						this.queueSkill('upheaval');
						this.queueSkill('windchill');
						this.queueSkill('electrocute');
					}
				} else if ((this.unit.hp <= 500 || this.unit.mpPool.availableMP < 200) && !this.isDesperate) {
					this.isDesperate = true;
					this.queueSkill('omni');
				} else {
					var qsTurns = this.predictSkillTurns('quickstrike');
					var moves = this.unit.mpPool.availableMP >= 200
						? [ 'flare', 'chill', 'lightning', 'quake', 'quickstrike', 'chargeSlash' ]
						: [ 'quickstrike', 'chargeSlash' ];
					var skillID = random.sample(moves);
					if (skillID == 'quickstrike' || this.isComboStarted) {
						skillID = qsTurns[0].unit === this.unit ? 'quickstrike' : 'swordSlash';
						this.isComboStarted = skillID == 'quickstrike';
						this.queueSkill(skillID);
					} else {
						this.queueSkill(skillID);
					}
				}
		}
	};

	on_itemUsed(userID, itemID, targetIDs)
	{
		if (this.unit.hasStatus('drunk') || this.unit.hasStatus('offGuard'))
			return;

		term.print(userID, itemID, targetIDs);

		var curativeIDs = [ 'tonic', 'powerTonic' ];
		if (userID == 'robert2' && from(curativeIDs).anyIs(itemID) && this.unit.hasStatus('zombie')
			&& from(targetIDs).anyIs('robert2') && this.phase <= 4)
		{
			if (this.zombieHealFixState === null && this.isItemUsable('holyWater')) {
				this.queueItem('holyWater');
				this.hasZombieHealedSelf = true;
			}
		} else if (userID == 'robert2' && itemID == 'alcohol' && from(targetIDs).anyIs('robert2')) {
			this.unit.addStatus('finalStand');
			new scenes.Scene()
				.adjustBGM(0.5, 300)
				.talk("Scott", true, 2.0, Infinity,
					"Robert! Tell me what we're accomplishing fighting like this! You HAVE to "
					+ "realize by now that no matter what any of us do, Amanda is the Primus! None of us--nothing can "
					+ "change that now!")
				.talk("Robert", true, 2.0, Infinity, "...")
				.talk("Scott", true, 2.0, Infinity,
					"You think I haven't come just as far as you? Is that it, Robert? You believe I "
					+ "chose to be in the position I'm in? No... instead I can only stand here wishing it were so simple.",
					"None of us chose our lots, Robert, not one. Not Bruce, Lauren, Amanda... not even you or me. All of us, "
					+ "in the end, left with no choice but to try to play with the absurd hand we were dealt.")
				.talk("Robert", true, 1.0, Infinity, "...")
				.fork()
					.adjustBGM(0.0, 300)
				.end()
				.talk("Scott", true, 2.0, Infinity, "Let the cards fall how they may. I'm not backing down now. I owe myself far too much.")
				.resync()
				.pause(60)
				.changeBGM('basicInstinct')
				.adjustBGM(1.0)
				.talk("Robert", true, 2.0, Infinity, "If that's what you want, then so be it.")
				.run(true);
			this.isAlcoholUsed = true;
		} else if (userID == 'scott' && from(targetIDs).anyIs('robert2')) {
			if (from(curativeIDs).anyIs(itemID) && this.unit.hasStatus('zombie')
				&& !this.isSkillQueued('electrocute'))
			{
				if (this.phase <= 4 && this.zombieHealFixState === null) {
					this.zombieHealFixState = 'fixStatus';
					if (this.zombieHealAlertLevel > 1.0 || !this.isItemUsable('vaccine') && !this.isItemUsable('holyWater'))
						this.zombieHealFixState = 'retaliate';
				} else if (this.phase == 5 && !this.hasMovesQueued()) {
					if ((this.isItemUsable('powerTonic') || this.isItemUsable('tonic'))
						&& this.unit.mpPool.availableMP >= 300)
					{
						this.queueSkill('electrocute');
						this.queueItem(this.isItemUsable('powerTonic') ? 'powerTonic' : 'tonic', 'scott');
					}
				}
			}
		} else if (userID == 'scott' && from(targetIDs).anyIs('scott')) {
			if (itemID == 'vaccine' && this.scottImmuneTurnsLeft == 0) {
				this.isScottZombie = false;
				this.scottImmuneTurnsLeft = 6;
			} else if (itemID == 'holyWater' && this.isScottZombie) {
				this.isScottZombie = false;
			} else if (this.phase <= 3 && from(curativeIDs).anyIs(itemID) && !this.isNecromancyPending
				&& !this.isScottZombie && !this.isSkillQueued('necromancy') && !this.isSkillQueued('electrocute')
				&& this.zombieHealFixState === null)
			{
				this.necromancyChance += 0.25;
				if (random.chance(this.necromancyChance) && !this.isNecroTonicItemPending) {
					this.queueSkill(this.phase <= 2 ? 'necromancy' : 'lightning');
					this.necromancyChance = 0.0;
				}
			}
		}
	}

	on_phaseChanged(newPhase, lastPhase)
	{
		switch (newPhase) {
			case 1:
				this.queueSkill('omni');
				this.doChargeSlashNext = true;
				this.isComboStarted = false;
				this.isNecromancyPending = true;
				break;
			case 2:
				this.queueSkill('upheaval');
				this.isComboStarted = false;
				this.isStatusHealPending = true;
				this.wasHolyWaterUsed = false;
				this.wasTonicUsed = false;
				break;
			case 3:
				this.queueSkill('protectiveAura');
				this.queueSkill(this.nextElementalMove !== null ? this.nextElementalMove : 'lightning', Stance.Charge);
				this.necroTonicItem = this.nextElementalMove === null ? 'tonic' : null;
				this.doChargeSlashNext = false;
				this.elementalsTillRevenge = 2;
				this.isChargeSlashPending = true;
				this.isComboStarted = false;
				break;
			case 4:
				this.queueSkill('crackdown');
				break;
			case 5:
				this.queueSkill('desperationSlash');
				if (this.unit.hasStatus('zombie') && this.isItemUsable('vaccine'))
					this.queueItem('vaccine');
				this.isAlcoholPending = true;
				this.isDesperate = false;
				this.isComboStarted = false;
				break;
		}
	}

	on_skillUsed(userID, skillID, targetIDs)
	{
		if (this.unit.hasStatus('drunk') || this.unit.hasStatus('offGuard'))
			return;

		if (userID == 'robert2') {
			if (skillID == this.nextElementalMove) {
				this.nextElementalMove = null;
			} else if (skillID == 'flare') {
				this.nextElementalMove = 'windchill';
			} else if (skillID == 'chill') {
				this.nextElementalMove = 'hellfire';
			} else if (skillID == 'necromancy' || skillID == 'lightning') {
				this.isScottZombie = (skillID == 'necromancy' || skillID == 'lightning' && this.scottStance != Stance.Guard)
					&& this.scottImmuneTurnsLeft <= 0;
				this.isNecroTonicItemPending = this.isScottZombie && this.necroTonicItem !== null
					&& this.isItemUsable(this.necroTonicItem);
			}
		} else if (userID == 'scott' && from(targetIDs).anyIs('scott')) {
			if (((skillID == 'flare' || skillID == 'hellfire') && this.nextElementalMove == 'hellfire')
				|| ((skillID == 'chill' || skillID == 'windchill') && this.nextElementalMove == 'windchill'))
			{
				this.nextElementalMove = null;
			}
		}
	}

	on_stanceChanged(unitID, stance)
	{
		if (this.unit.hasStatus('drunk'))
			return;

		if (unitID == 'scott')
			this.scottStance = stance;
	};

	on_unitReady(unitID)
	{
		if (this.unit.hasStatus('drunk'))
			return;

		if (this.zombieHealFixState === null)
			this.zombieHealAlertLevel = Math.max(0.0, this.zombieHealAlertLevel - 0.1);
		if (unitID == 'robert2' && !this.hasMovesQueued()) {
			if (this.isNecromancyPending && this.scottImmuneTurnsLeft <= 0) {
				if (!this.isScottZombie)
					this.queueSkill('necromancy');
				this.isNecromancyPending = false;
			} else if (this.unit.mpPool.availableMP < 0.25 * this.unit.mpPool.capacity && this.isItemUsable('redBull') && this.phase <= 4) {
				this.queueItem('redBull');
			} else if (this.isNecroTonicItemPending) {
				if (this.isItemUsable(this.necroTonicItem)) {
					let itemTarget = this.isScottZombie ? 'scott' : 'robert2';
					this.queueItem(this.necroTonicItem, itemTarget);
				}
				this.isNecroTonicItemPending = false;
				this.necroTonicItem = null;
			} else if (this.zombieHealFixState !== null) {
				switch (this.zombieHealFixState) {
					case 'fixStatus':
						let itemID = (this.zombieHealAlertLevel > 0.0 || !this.isItemUsable('holyWater')) && this.isItemUsable('vaccine')
							? 'vaccine' : 'holyWater';
						this.queueItem(itemID);
						this.zombieHealFixState = 'retaliate';
						break;
					case 'retaliate':
						switch (Math.ceil(this.zombieHealAlertLevel)) {
							case 0.0:
								if (this.isSkillUsable('lightning')) {
									this.queueSkill('lightning');
									this.necroTonicItem = 'tonic';
								}
								break;
							case 1.0:
								if (this.nextElementalMove === null) {
									this.queueSkill('flare');
									this.queueSkill('windchill');
								} else {
									let firstMoveID = this.nextElementalMove != 'hellfire' ? 'hellfire' : 'windchill'
									this.queueSkill(firstMoveID);
									this.queueSkill(this.nextElementalMove);
								}
								break;
							default:
								if (this.isItemUsable('redBull'))
									this.queueItem('redBull');
								this.queueSkill('omni');
								break;
						}
						this.zombieHealFixState = 'finish';
						break;
					case 'finish':
						this.zombieHealAlertLevel += 1.0;
						this.zombieHealFixState = null;
						break;
				}
			}
		} else if (unitID == 'scott') {
			if (this.scottImmuneTurnsLeft > 0)
				--this.scottImmuneTurnsLeft;
			this.necromancyChance = Math.max(this.necromancyChance - 0.05, 0.0);
		}
	}
}
