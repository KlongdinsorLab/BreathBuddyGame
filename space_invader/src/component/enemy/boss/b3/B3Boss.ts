/* eslint-disable @typescript-eslint/no-empty-function */
import Player from 'component/player/Player'
import Score from 'component/ui/Score'

import {
	DESTROY_METEOR_SCORE,
	BOSS_HIT_DELAY_MS,
	BOSS_TUTORIAL_DELAY_MS,
	BOSS_MULTIPLE_COUNT,
} from 'config'
// import SoundManager from 'component/sound/SoundManager'
import { Boss } from '../Boss'
import { BossVersion } from '../BossVersion'
import { BossSkill } from '../BossSkill'

import { BoosterEffect } from 'component/booster/booster'
import { B3BossVersion1 } from './B3BossVersion1'
import { B3BossVersion2 } from './B3BossVersion2'
import { BossByName } from 'scene/boss/bossInterface'
import { B3BossSkill } from './B3BossSkill'
let isHit = false

export class B3Boss extends Boss {
	private phaseCount!: number
	private bossTimer = 0
	private isStartAttack = false
	private isItemPhase = false
	private isAttackPhase = true
	private isSecondPhase = false
	private bossVersion!: BossVersion
	private bossSkill!: BossSkill
	private bossSound!:
		| Phaser.Sound.NoAudioSound
		| Phaser.Sound.WebAudioSound
		| Phaser.Sound.HTML5AudioSound
	private bossRemoved!: boolean

	private boosterEffect!: BoosterEffect

	constructor(scene: Phaser.Scene, player: Player, score: Score, lap = 1) {
		super(scene, player, score, lap)

		// this.soundManager = new SoundManager(scene)
		this.bossSound = scene.sound.addAudioSprite('bossSound')
		this.phaseCount = 0

		this.bossVersion = this.setVersion(lap)

		this.enemy = this.bossVersion.createAnimation(this.scene)
		this.enemy.depth = 3

		this.enemy.play('boss-move')
		this.scene.physics.world.enable(this.enemy)

		const bossVersionNumber = Math.floor((10 - lap) / BOSS_MULTIPLE_COUNT) + 1
		this.bossSkill = new B3BossSkill(
			this.scene,
			this,
			this.player,
			this.score,
			bossVersionNumber,
		)

		this.boosterEffect = scene.registry.get('boosterEffect')
	}

	create(): Phaser.Types.Physics.Arcade.ImageWithDynamicBody | void {
		// return this.enemy
	}

	path(): void {}

	move(): void {
		const path = this.bossVersion.getMovePattern(this.scene, this)
		this.bossSkill.setMovePath(path)
		this.bossSkill.move()
		this.enemy.setPath(path)
		this.enemy.startFollow({
			positionOnPath: true,
			duration: 7000,
			yoyo: true,
			repeat: -1,
			rotateToPath: false,
		})
	}

	attack(delta: number): void {
		this.bossTimer += delta
		if (!this.isSecondPhase) {
			if (
				this.bossTimer >= this.bossVersion.getDurationPhase1() &&
				!this.bossRemoved
			)
				this.remove()
		} else {
			if (
				this.bossTimer >= this.bossVersion.getDurationPhase2() &&
				!this.bossRemoved
			)
				this.remove()
		}
	}

	hit(): void {
		if (isHit) return

		// TODO fixes me
		// const randomSoundIndex = Math.floor(Math.random() * 4)
		// this.soundManager.play(this.bossHitSounds[randomSoundIndex], false)

		this.bossSound.play(`B3-hit${Math.floor(Math.random() * 4) + 1}`)

		this.enemy.stop()
		this.enemy.play('boss-hit')

		isHit = true
		this.enemy.setAlpha(0.75)
		setTimeout(() => {
			isHit = false
			this.enemy.setAlpha(1)
			this.enemy.stop()
			this.enemy.play('boss-move')
		}, BOSS_HIT_DELAY_MS)

		this.score.add(
			DESTROY_METEOR_SCORE * this.boosterEffect?.destroyMeteorScore,
		)
	}

	destroy() {
		// TODO
	}

	getBody(): Phaser.Types.Physics.Arcade.ImageWithDynamicBody {
		return this.enemy
	}

	isActive(): boolean {
		return this.enemy.active
	}

	remove(): void {
		const { width } = this.scene.scale
		const path = new Phaser.Curves.Path(this.enemy.x, this.enemy.y).lineTo(
			width / 2,
			-200,
		)
		this.bossRemoved = true
		this.enemy
			.setPath(path)
			.startFollow({ duration: 300, onComplete: () => this.endAttackPhase() })
	}

	startAttackPhase(): void {
		this.phaseCount++
		this.isSecondPhase = this.phaseCount === 2
		if (this.isSecondPhase) this.bossVersion.handleSecondPhase()
		this.isStartAttack = true
		setTimeout(
			() => {
				this.isAttackPhase = true
				this.isItemPhase = false
				this.bossRemoved = false
				this.bossTimer = 0
				this.move()
				this.player.startReload()
			},
			this.isSecondPhase ? BOSS_TUTORIAL_DELAY_MS : 0, //a little of delay after collect item
		)
	}

	endAttackPhase(): void {
		if (!this.isSecondPhase) {
			this.isItemPhase = true
			this.isAttackPhase = false
			this.isStartAttack = false
		} else {
			this.isAttackPhase = false
			this.isItemPhase = false
		}
	}

	getIsStartAttack(): boolean {
		return this.isStartAttack
	}

	getIsAttackPhase(): boolean {
		return this.isAttackPhase
	}

	getIsItemPhase(): boolean {
		return this.isItemPhase
	}

	getIsSecondPhase(): boolean {
		return this.isSecondPhase
	}

	resetState(): void {
		this.isStartAttack = false
		this.isAttackPhase = true
		this.isItemPhase = false
		this.isSecondPhase = false
	}

	setVersion(lap: number): BossVersion {
		const version = Math.floor((10 - lap) / BOSS_MULTIPLE_COUNT)
		const bossVersions = [B3BossVersion1, B3BossVersion2]
		this.bossVersion = new bossVersions[version]()

		this.scene.anims.remove('boss-move')
		this.scene.anims.remove('boss-hit')
		this.enemy = this.bossVersion.createAnimation(this.scene)
		this.enemy.depth = 3
		this.enemy.play('boss-move')
		this.scene.physics.world.enable(this.enemy)
		return this.bossVersion
	}

	getVersion(): BossVersion {
		return this.bossVersion
	}

	getSkill(): any {
		return this.bossSkill
	}

	playAttack(delta: number): void {
		this.attack(delta)
		this.bossVersion.useSkill(this.bossSkill, delta)
	}

	getName(): keyof typeof BossByName {
		return 'B3'
	}
}
