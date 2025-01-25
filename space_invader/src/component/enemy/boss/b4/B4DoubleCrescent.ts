import { BoosterEffect } from 'component/booster/booster'
import Player from 'component/player/Player'
import Score from 'component/ui/Score'

import {
	BOSS_4_CRESCENT_SCORE_REDUCTION,
	BOSS_4_DOUBLE_CRESCENT_VELOCITY_X,
	BOSS_4_CRESCENT_VELOCITY_Y,
	BOSS_4_DOUBLE_CRESCENT_ANGLE,
	PLAYER_HIT_DELAY_MS,
	BOSS_4_CRESCENT_SCALE_DURATION,
} from 'config'

// import { BoosterEffect } from 'component/booster/booster'
export default class B4DoubleCrescent {
	// private boosterEffect!: BoosterEffect

	protected enemy1!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody
	protected enemy2!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody
	protected scene: Phaser.Scene
	protected player: Player
	protected score: Score
	protected isHit1: Boolean
	protected isHit2: Boolean
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
		this.isHit1 = false
		this.isHit2 = false
		this.boosterEffect = this.scene.registry.get('boosterEffect')
		this.create(x, y)

		// this.boosterEffect = scene.registry.get('boosterEffect')

		this.move()
	}

	create(x: number, y: number): void {
		this.enemy1 = this.scene.physics.add
			.image(x + 75, y, 'b4v1', 'b4_skill1.png')
			.setOrigin(0.5, 0.5)
		this.enemy1.angle = -BOSS_4_DOUBLE_CRESCENT_ANGLE
		this.enemy1.depth = 1

		this.scene.tweens.add({
			targets: this.enemy1,
			scaleX: 1.75,
			scaleY: 1.75,
			ease: 'Linear',
			duration: BOSS_4_CRESCENT_SCALE_DURATION,
			repeat: 0,
		})

		this.scene.physics.add.overlap(
			this.player.getBody(),
			this.enemy1,
			(_, _meteor) => {
				if (this.player.getIsHit()) {
					this.isHit1 = false
					return
				}

				if(this.isHit1) return
				
				if (this.boosterEffect?.remainingUses > 0) {
					this.boosterEffect.remainingUses--
					this.player.activateShield()
					this.isHit1 = true
					return
				}
				
				if (
					this.boosterEffect?.remainingUses > 0 &&
					this.player.getIsUsedShield()
				) {
					this.boosterEffect.remainingUses--
					this.isHit1 = true
					return
				}
				
				if (
					this.boosterEffect?.remainingUses === 1 &&
					this.boosterEffect.remainingTime === 0 &&
					this.player.getIsUsedShield()
				) {
					this.player.deactivateShield()
					this.boosterEffect.remainingUses--
					this.isHit1 = true
					return
				}
				
				if (
					this.boosterEffect?.remainingUses === 0 &&
					this.boosterEffect.remainingTime > 0 &&
					!this.player.getIsUsedShield()
				) {
					this.player.activateShield(this.boosterEffect.remainingTime)
					this.isHit1 = true
					return
				}
				if (
					this.boosterEffect?.remainingUses === 0 &&
					this.boosterEffect.remainingTime > 0 &&
					this.player.getIsUsedShield()
				) {
					this.isHit1 = true
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
			this.enemy1.destroy()
		})

		this.enemy2 = this.scene.physics.add
			.image(x - 75, y, 'b4v1', 'b4_skill1.png')
			.setOrigin(0.5, 0.5)
		this.enemy2.angle = BOSS_4_DOUBLE_CRESCENT_ANGLE
		this.enemy2.depth = 1

		this.scene.tweens.add({
			targets: this.enemy2,
			scaleX: 1.75,
			scaleY: 1.75,
			ease: 'Linear',
			duration: BOSS_4_CRESCENT_SCALE_DURATION,
			repeat: 0,
		})

		this.scene.physics.add.overlap(
			this.player.getBody(),
			this.enemy2,
			(_, _meteor) => {
				if (this.player.getIsHit()) {
					this.isHit2 = false
					return
				}

				if(this.isHit2) return
				
				if (this.boosterEffect?.remainingUses > 0) {
					this.boosterEffect.remainingUses--
					this.player.activateShield()
					this.isHit2 = true
					return
				}
				
				if (
					this.boosterEffect?.remainingUses > 0 &&
					this.player.getIsUsedShield()
				) {
					this.boosterEffect.remainingUses--
					this.isHit2 = true
					return
				}
				
				if (
					this.boosterEffect?.remainingUses === 1 &&
					this.boosterEffect.remainingTime === 0 &&
					this.player.getIsUsedShield()
				) {
					this.player.deactivateShield()
					this.boosterEffect.remainingUses--
					this.isHit2 = true
					return
				}
				
				if (
					this.boosterEffect?.remainingUses === 0 &&
					this.boosterEffect.remainingTime > 0 &&
					!this.player.getIsUsedShield()
				) {
					this.player.activateShield(this.boosterEffect.remainingTime)
					this.isHit2 = true
					return
				}
				if (
					this.boosterEffect?.remainingUses === 0 &&
					this.boosterEffect.remainingTime > 0 &&
					this.player.getIsUsedShield()
				) {
					this.isHit2 = true
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
			this.enemy2.destroy()
		})
	}

	move(): void {
		// this.isInItemPhase
		// 	? this.enemy.setVelocityY(METEOR_ITEMPHASE_SPEED)
		// 	: this.enemy.setVelocityY(METEOR_SPEED)
		// const velocityX = Math.floor(
		// 	Math.random() * (METEOR_SPEED / 3) - METEOR_SPEED / 6,
		// )
		// this.enemy.setVelocityX(this.isTutorial ? -120 : velocityX)
		// this.enemy.setAngularVelocity(METEOR_SPIN_SPEED)

		this.enemy1.setVelocityY(BOSS_4_CRESCENT_VELOCITY_Y)
		this.enemy1.setVelocityX(BOSS_4_DOUBLE_CRESCENT_VELOCITY_X)

		this.enemy2.setVelocityY(BOSS_4_CRESCENT_VELOCITY_Y)
		this.enemy2.setVelocityX(-BOSS_4_DOUBLE_CRESCENT_VELOCITY_X)
	}

	// getBody(): Phaser.Types.Physics.Arcade.ImageWithDynamicBody {
	// 	return this.enemy1
	// }

	// isActive(): boolean {
	// 	return this.enemy1.active
	// }
}
