import { BoosterEffect } from 'component/booster/booster'
import Player from 'component/player/Player'
import Score from 'component/ui/Score'

import {
	BOSS_4_CRESCENT_SCALE_DURATION,
	BOSS_4_CRESCENT_SCORE_REDUCTION,
	BOSS_4_CRESCENT_VELOCITY_Y,
	PLAYER_HIT_DELAY_MS,
} from 'config'

// import { BoosterEffect } from 'component/booster/booster'
export default class B4SingleCrescent {
	// private boosterEffect!: BoosterEffect

	protected enemy!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody | any
	protected scene: Phaser.Scene
	protected player: Player
	protected score: Score
	protected isHit: Boolean
	protected boosterEffect: BoosterEffect

	constructor(
		scene: Phaser.Scene,
		player: Player,
		score: Score,
		x: number,
		y: number,
	) {
		this.scene = scene
		this.player = player
		this.score = score
		this.isHit = false
		this.boosterEffect = this.scene.registry.get('boosterEffect')
		this.create(x, y)

		// this.boosterEffect = scene.registry.get('boosterEffect')

		this.move()
	}

	create(
		x: number,
		y: number,
	): Phaser.Types.Physics.Arcade.ImageWithDynamicBody {
		this.enemy = this.scene.physics.add
			.image(x, y, 'b4v1', 'b4_skill1.png')
			.setOrigin(0.5, 0.5)
		this.enemy.depth = 1

		this.scene.tweens.add({
			targets: this.enemy,
			scaleX: 1.75,
			scaleY: 1.75,
			ease: 'Linear',
			duration: BOSS_4_CRESCENT_SCALE_DURATION,
			repeat: 0,
		})

		this.scene.physics.add.overlap(
			this.player.getBody(),
			this.enemy,
			(_, _meteor) => {
				if (this.player.getIsHit()) {
					this.isHit = false
					return
				}

				if(this.isHit) return
				
				if (this.boosterEffect?.remainingUses > 0) {
					this.boosterEffect.remainingUses--
					this.player.activateShield()
					this.isHit = true
					return
				}
				
				if (
					this.boosterEffect?.remainingUses > 0 &&
					this.player.getIsUsedShield()
				) {
					this.boosterEffect.remainingUses--
					this.isHit = true
					return
				}
				
				if (
					this.boosterEffect?.remainingUses === 1 &&
					this.boosterEffect.remainingTime === 0 &&
					this.player.getIsUsedShield()
				) {
					this.player.deactivateShield()
					this.boosterEffect.remainingUses--
					this.isHit = true
					return
				}
				
				if (
					this.boosterEffect?.remainingUses === 0 &&
					this.boosterEffect.remainingTime > 0 &&
					!this.player.getIsUsedShield()
				) {
					this.player.activateShield(this.boosterEffect.remainingTime)
					this.isHit = true
					return
				}
				if (
					this.boosterEffect?.remainingUses === 0 &&
					this.boosterEffect.remainingTime > 0 &&
					this.player.getIsUsedShield()
				) {
					this.isHit = true
					return
				}

				this.player.setIsHit(true)
				this.player.damaged()
				this.score.add(BOSS_4_CRESCENT_SCORE_REDUCTION * this.boosterEffect?.hitMeteorScore)
				this.scene.time.delayedCall(PLAYER_HIT_DELAY_MS, () => {
					this.player.setIsHit(false)
					this.player.recovered()
				})
			},
		)
		this.scene.time.delayedCall(5000, () => {
			this.enemy.destroy()
		})

		return this.enemy
	}

	move(): void {
		this.enemy.setVelocityY(BOSS_4_CRESCENT_VELOCITY_Y)
	}

	getBody(): Phaser.Types.Physics.Arcade.ImageWithDynamicBody {
		return this.enemy
	}

	isActive(): boolean {
		return this.enemy.active
	}
}
