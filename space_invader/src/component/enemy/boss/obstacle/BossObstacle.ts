/* eslint-disable @typescript-eslint/no-empty-function */
import { Enemy } from '../../Enemy'
import Player from 'component/player/Player'
import Score from 'component/ui/Score'

import {
	DESTROY_METEOR_SCORE,
	HIT_METEOR_SCORE,
	METEOR_ITEMPHASE_SPEED,
	METEOR_SPEED,
	METEOR_SPIN_SPEED,
	PLAYER_HIT_DELAY_MS,
} from 'config'

import { BoosterEffect } from 'component/booster/booster'

export class BossObstacle extends Enemy {
	private explosionEmitter: Phaser.GameObjects.Particles.ParticleEmitter
	private isHit!: boolean

	private soundEffect!:
		| Phaser.Sound.NoAudioSound
		| Phaser.Sound.WebAudioSound
		| Phaser.Sound.HTML5AudioSound

	private boosterEffect!: BoosterEffect

	constructor(
		scene: Phaser.Scene,
		player: Player,
		score: Score,
		soundEffect:
			| Phaser.Sound.NoAudioSound
			| Phaser.Sound.WebAudioSound
			| Phaser.Sound.HTML5AudioSound,
		isTutorial?: boolean,
		isInItemPhase?: boolean,
	) {
		super(scene, player, score, isTutorial, isInItemPhase)

		const { width } = this.scene.scale
		this.soundEffect = soundEffect
		const startingX = Math.floor(Math.random() * width)
		this.enemy = this.scene.physics.add.image(startingX - 4, 0, 'obstacle')
		this.enemy.depth = 1
		this.isHit = false

		this.boosterEffect = scene.registry.get('boosterEffect')

		this.scene.physics.add.overlap(this.player.getBody(), this.enemy, () => {
			if (this.player.getIsHit()) {
				this.isHit = false
				return
			}

			if (this.boosterEffect?.remainingUses > 0 && !this.isHit) {
				this.boosterEffect.remainingUses--
				this.player.activateShield()
				this.isHit = true
				return
			}

			if (
				this.boosterEffect?.remainingUses > 0 &&
				this.player.getIsUsedShield() &&
				!this.isHit
			) {
				this.boosterEffect.remainingUses--
				this.isHit = true
				return
			}

			if (
				this.boosterEffect?.remainingUses === 0 &&
				this.boosterEffect.remainingTime === 0 &&
				this.player.getIsUsedShield() &&
				!this.isHit
			) {
				this.player.deactivateShield()
				this.boosterEffect.remainingUses--
				this.isHit = true
				return
			}

			if (
				this.boosterEffect?.remainingUses === 0 &&
				this.boosterEffect.remainingTime > 0 &&
				!this.player.getIsUsedShield() &&
				!this.isHit
			) {
				console.log('hit2')
				this.player.activateShield(this.boosterEffect.remainingTime)
				this.isHit = true
				return
			}
			if (
				this.boosterEffect?.remainingUses === 0 &&
				this.boosterEffect.remainingTime > 0 &&
				this.player.getIsUsedShield() &&
				!this.isHit
			) {
				this.isHit = true
				return
			}

			if (!this.isHit) {
				this.player.setIsHit(true)
				this.player.damaged()
				this.score.add(HIT_METEOR_SCORE * this.boosterEffect?.hitMeteorScore)
				this.scene.time.delayedCall(PLAYER_HIT_DELAY_MS, () => {
					this.player.setIsHit(false)
					this.player.recovered()
				})
			}
		})

		this.scene.time.delayedCall(5000, () => {
			this.enemy.destroy()
		})

		this.explosionEmitter = scene.add.particles(0, 0, 'explosion', {
			speed: 80,
			scale: 0.6,
			blendMode: Phaser.BlendModes.ADD,
			gravityY: -20,
		})

		this.explosionEmitter.active = false
		this.move()
		this.attack()
	}

	create(): Phaser.Types.Physics.Arcade.ImageWithDynamicBody {
		return this.enemy
	}

	move(): void {
		const velocityX = Math.floor(
			Math.random() * (METEOR_SPEED / 3) - METEOR_SPEED / 6,
		)
		this.enemy.setVelocityY(
			this.isInItemPhase ? METEOR_ITEMPHASE_SPEED : METEOR_SPEED,
		)
		this.enemy.setVelocityX(velocityX)
		this.enemy.setAngularVelocity(METEOR_SPIN_SPEED)
	}

	attack(): void {}

	hit(): void {
		this.destroy()
	}

	destroy(): void {
		this.explosionEmitter.startFollow(this.enemy)
		this.explosionEmitter.active = true
		this.explosionEmitter.start()
		this.scene.time.delayedCall(200, () => {
			this.explosionEmitter.stop()
		})
		this.enemy.destroy()
		// this.soundManager.play(this.enermyDestroyedSound!, true)
		this.soundEffect.play('rock-destroy')
		this.score.add(
			DESTROY_METEOR_SCORE * this.boosterEffect?.destroyMeteorScore,
		)
	}

	getBody(): Phaser.Types.Physics.Arcade.ImageWithDynamicBody {
		return this.enemy
	}

	isActive(): boolean {
		return this.enemy.active
	}

	getIsHit(): boolean {
		return this.isHit
	}
}
