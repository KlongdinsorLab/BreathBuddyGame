import { Enemy } from './Enemy'
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
// import SoundManager from 'component/sound/SoundManager'

import { BoosterEffect } from 'component/booster/booster'
export class Meteor extends Enemy {
	// private soundManager: SoundManager
	private explosionEmitter: Phaser.GameObjects.Particles.ParticleEmitter
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
		this.soundEffect = soundEffect
		this.explosionEmitter = scene.add.particles(0, 0, 'explosion', {
			speed: 80,
			scale: 0.6,
			blendMode: Phaser.BlendModes.ADD,
			gravityY: -20,
		})
		this.explosionEmitter.active = false
		// this.enermyDestroyedSound = this.scene.sound.add('meteorDestroyedSound')
		this.boosterEffect = scene.registry.get('boosterEffect')

		this.move()
		this.attack()
	}

	create(
		isTutorial?: boolean,
	): Phaser.Types.Physics.Arcade.ImageWithDynamicBody {
		const { width } = this.scene.scale
		const startingX = isTutorial ? width / 2 : Math.floor(Math.random() * width)
		this.enemy = this.scene.physics.add.image(startingX - 4, 0, 'obstacle')
		this.enemy.depth = 1

		this.scene.physics.add.overlap(
			this.player.getBody(),
			this.enemy,
			(_, _meteor) => {
				if (this.player.getIsHit()) return
				this.player.setIsHit(true)
				this.player.damaged()
				this.score.add(HIT_METEOR_SCORE * this.boosterEffect.hitMeteorScore)
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
		this.isInItemPhase
			? this.enemy.setVelocityY(METEOR_ITEMPHASE_SPEED)
			: this.enemy.setVelocityY(METEOR_SPEED)
		const velocityX = Math.floor(
			Math.random() * (METEOR_SPEED / 3) - METEOR_SPEED / 6,
		)
		this.enemy.setVelocityX(this.isTutorial ? -120 : velocityX)
		this.enemy.setAngularVelocity(METEOR_SPIN_SPEED)
	}

	attack(): void {
		// Do Nothing
		//        this.scene.physics.add.overlap(this.player.getBody(), this.enemy, (_, _meteor) => {
		//            if (this.player.getIsHit()) return;
		//            this.player.setIsHit(true)
		//            this.player.damaged()
		//            this.score.add(HIT_METEOR_SCORE)
		//            this.scene.time.delayedCall(PLAYER_HIT_DELAY_MS, () => {
		//                this.player.setIsHit(false)
		//                this.player.recovered()
		//            })
		//        })
		//        this.scene.time.delayedCall(5000, () => {
		//            this.enemy.destroy()
		//        })
	}

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
			DESTROY_METEOR_SCORE *
				(this.boosterEffect?.destroyMeteorScore
					? this.boosterEffect?.destroyMeteorScore
					: 1),
		)
	}

	getBody(): Phaser.Types.Physics.Arcade.ImageWithDynamicBody {
		return this.enemy
	}

	isActive(): boolean {
		return this.enemy.active
	}
}
