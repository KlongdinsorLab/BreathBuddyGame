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
import { B2BossVersion1 } from './B2BossVersion1'
import { B2BossVersion2 } from './B2BossVersion2'

import { boosters } from 'scene/booster/RedeemScene'
import { BoosterName } from 'component/booster/booster'
import { Booster5 } from 'component/booster/boosterList/booster_5'

let isHit = false

export class B2Boss extends Boss {
	// private soundManager: SoundManager
	private phaseCount!: number
	private bossTimer = 0
	private isStartAttack = false
	private isItemPhase = false
	private isAttackPhase = true
	private isSecondPhase = false
	private bossVersion!: BossVersion
	private bossSkill!: BossSkill
	// private bossHitSounds!: (Phaser.Sound.NoAudioSound
	// 	| Phaser.Sound.WebAudioSound
	// 	| Phaser.Sound.HTML5AudioSound)[]
	private bossSound!: Phaser.Sound.NoAudioSound
	| Phaser.Sound.WebAudioSound
	| Phaser.Sound.HTML5AudioSound
	private bossRemoved!: boolean

	private destroyMeteorScore!: number	
	private booster5?: Booster5

	constructor(
		scene: Phaser.Scene,
		player: Player,
		score: Score,
		lap: number = 6,
	) {
		super(scene, player, score, lap)
		
		// this.soundManager = new SoundManager(scene)
		this.bossSound = scene.sound.addAudioSprite('bossSound')
		this.phaseCount = 0

		this.bossVersion = this.setVersion(lap)
		
		this.enemy = this.bossVersion.createAnimation(this.scene)
		this.enemy.depth = 3

		this.enemy.play('boss-move')
		this.scene.physics.world.enable(this.enemy)

		// this.bossSkill = new B1BossSkill(this.scene, this, this.player)
		// this.scene.physics.world.enable(this.bossSkill.getBody())

		this.destroyMeteorScore = DESTROY_METEOR_SCORE
		if(boosters.includes(BoosterName.BOOSTER_5)){
			this.booster5 = new Booster5()
			this.destroyMeteorScore = this.booster5.applyBooster(DESTROY_METEOR_SCORE)
		}
	}

	create(): Phaser.Types.Physics.Arcade.ImageWithDynamicBody | void {
		// return this.enemy
	}

	path(): void {}

	move(): void {
		const path = this.bossVersion.getMovePattern(this.scene, this)
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
		if(!this.isSecondPhase){
			if(this.bossTimer >= this.bossVersion.getDurationPhase1() && !this.bossRemoved) this.remove()
		} else {
			if(this.bossTimer >= this.bossVersion.getDurationPhase2() && !this.bossRemoved) this.remove()
		}
	}

	hit(): void {
		if (isHit) return

		// TODO fixes me
		// const randomSoundIndex = Math.floor(Math.random() * 4)
		// this.soundManager.play(this.bossHitSounds[randomSoundIndex], false)
		this.bossSound.play(`b2-hit${Math.floor(Math.random() * 4) + 1}`)

		this.enemy.stop()
		// this.enemy.setTexture('boss')
		this.enemy.play('boss-hit')

		isHit = true
		this.enemy.setAlpha(0.75)
		setTimeout(() => {
			isHit = false
			this.enemy.setAlpha(1)
			this.enemy.stop()
			// this.enemy.setTexture('boss')
			this.enemy.play('boss-move')
		}, BOSS_HIT_DELAY_MS)
		// this.soundManager.play(this.enermyDestroyedSound!, true)
		this.score.add(this.destroyMeteorScore)
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
		this.enemy.setPath(path).startFollow({ duration: 300, onComplete:() => this.endAttackPhase() })
	}

	startAttackPhase(): void {
		this.phaseCount++
		this.isSecondPhase = this.phaseCount === 2
		this.isStartAttack = true
		setTimeout(() => {
			this.isAttackPhase = true
			this.isItemPhase = false
			this.bossRemoved = false
			this.bossTimer = 0
			this.move()
			this.player.startReload()
		}, BOSS_TUTORIAL_DELAY_MS)
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
		const bossVersions = [B2BossVersion1, B2BossVersion2]
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
		if (this.isSecondPhase) {
			this.bossVersion.createObstacleByTime(
				this.scene,
				this.player,
				this.score,
				delta,
			)
			this.bossVersion.useSkill(this.bossSkill, delta)
		}
	}
}
