import { Booster, BoosterName, BoosterEffect } from '../booster'

export class Booster1 extends Booster {
	private remainingUses: number
	constructor() {
		super(BoosterName.BOOSTER_1)
		this.remainingUses = 5
	}
	getBoosterEffect(): BoosterEffect {
		return {
			remainingUses: this.remainingUses,
			remainingTime: 0,
			hitMeteorScore: 0,
			laserFrequency: 0,
			bulletCount: 0,
			shootingPhase: 0,
			destroyMeteorScore: 0,
			laserFactory: 'single',
			releasedBullet: 0,
			bulletMultiply: 0,
			score: 0,
		}
	}
}
